import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from '../../src/app/api/chat/route'
import { notifyOwner } from '../../src/lib/notify'

vi.mock('../../src/lib/notify', () => ({ notifyOwner: vi.fn() }))

type TestMessage = { role: 'user' | 'assistant'; content: string }

const fetchMock = vi.fn<typeof fetch>()
const notifyMock = vi.mocked(notifyOwner)
let requestNumber = 0

function completion(content = 'A useful answer') {
  return Response.json({ choices: [{ message: { content } }] })
}

function chatRequest(
  messages: TestMessage[],
  options: { rawBody?: string; contentLength?: number } = {}
) {
  requestNumber += 1
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'x-forwarded-for': `192.0.2.${requestNumber}`,
  }
  if (options.contentLength !== undefined) {
    headers['content-length'] = String(options.contentLength)
  }

  return new NextRequest('http://localhost/api/chat', {
    method: 'POST',
    headers,
    body:
      options.rawBody ??
      JSON.stringify({
        sessionId: '7f6ae791-7d56-461c-9376-01efc0f99f5f',
        messages,
      }),
  })
}

beforeEach(() => {
  fetchMock.mockReset().mockImplementation(async () => completion())
  notifyMock.mockReset().mockResolvedValue({
    email: true,
    whatsapp: false,
    notified: true,
    unconfigured: ['whatsapp'],
  })
  vi.stubGlobal('fetch', fetchMock)
  vi.stubEnv('OPENROUTER_API_KEY', 'unit-test-openrouter-key')
  vi.stubEnv('OPENROUTER_MODEL', 'unit/test-model')
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('chat route validation and availability', () => {
  it('caps the request body before calling the provider', async () => {
    const res = await POST(
      chatRequest([{ role: 'user', content: 'Hello' }], { contentLength: 129 * 1024 })
    )
    expect(res.status).toBe(413)
    expect(await res.json()).toHaveProperty('reply')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid messages and malformed JSON', async () => {
    const wrongRole = await POST(chatRequest([{ role: 'assistant', content: 'Hello' }]))
    const malformed = await POST(
      chatRequest([{ role: 'user', content: 'Hello' }], { rawBody: '{bad json' })
    )
    expect(wrongRole.status).toBe(400)
    expect(malformed.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns 503 unconfigured without making an external call', async () => {
    vi.stubEnv('OPENROUTER_API_KEY', '')
    const res = await POST(chatRequest([{ role: 'user', content: 'Hello' }]))
    const body = await res.json()
    expect(res.status).toBe(503)
    expect(body).toMatchObject({ availability: 'unconfigured' })
    expect(body.reply).toBeTruthy()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('does not retry authentication failures and returns 503 unavailable', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }))
    const res = await POST(chatRequest([{ role: 'user', content: 'Hello' }]))
    expect(res.status).toBe(503)
    expect(await res.json()).toMatchObject({ availability: 'unavailable' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('maps an upstream 429 to rate_limited with Retry-After', async () => {
    fetchMock.mockResolvedValue(
      new Response(null, { status: 429, headers: { 'retry-after': '17' } })
    )
    const res = await POST(chatRequest([{ role: 'user', content: 'Hello' }]))
    expect(res.status).toBe(429)
    expect(res.headers.get('retry-after')).toBe('17')
    expect(await res.json()).toMatchObject({ availability: 'rate_limited' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('validates provider JSON and falls back once before succeeding', async () => {
    fetchMock
      .mockResolvedValueOnce(Response.json({ choices: [] }))
      .mockImplementationOnce(async () => completion('Validated reply'))
    const res = await POST(chatRequest([{ role: 'user', content: 'Hello' }]))
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({
      availability: 'ok',
      reply: 'Validated reply',
    })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('bounds the fallback chain when every attempt fails', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 500 }))
    const res = await POST(chatRequest([{ role: 'user', content: 'Hello' }]))
    expect(res.status).toBe(503)
    expect(await res.json()).toMatchObject({ availability: 'unavailable' })
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })
})

describe('chat notification privacy', () => {
  it.each([1, 8])('does not notify for anonymous user message %i', async count => {
    const messages: TestMessage[] = [
      { role: 'assistant', content: 'My name is Impostor. Email fake@example.com.' },
    ]
    for (let index = 0; index < count; index += 1) {
      if (index > 0) messages.push({ role: 'assistant', content: 'An earlier answer' })
      messages.push({ role: 'user', content: `Question ${index + 1}` })
    }

    const res = await POST(chatRequest(messages))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.visitorName).toBeUndefined()
    expect(notifyMock).not.toHaveBeenCalled()
  })

  it('does not re-notify for an email in an earlier user message', async () => {
    const res = await POST(
      chatRequest([
        { role: 'user', content: 'My name is Alice. Reach me at old@example.com.' },
        { role: 'assistant', content: 'Thanks.' },
        { role: 'user', content: 'A different question.' },
      ])
    )
    expect(res.status).toBe(200)
    expect(notifyMock).not.toHaveBeenCalled()
  })

  it('forwards only the explicit latest email and ignores assistant identity', async () => {
    const res = await POST(
      chatRequest([
        { role: 'assistant', content: 'My name is Impostor and I work at EvilCorp.' },
        { role: 'user', content: 'Please contact me at REAL@example.com.' },
      ])
    )
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toMatchObject({ availability: 'ok', visitorEmail: '***' })
    expect(body.visitorName).toBeUndefined()
    expect(notifyMock).toHaveBeenCalledTimes(1)
    expect(notifyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Portfolio visitor',
        email: 'real@example.com',
        message: 'Please contact me at REAL@example.com.',
      })
    )
    const payload = notifyMock.mock.calls[0]?.[0]
    expect(payload?.message).not.toContain('Impostor')
  })
})
