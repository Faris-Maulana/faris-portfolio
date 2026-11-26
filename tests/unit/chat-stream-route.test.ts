import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from '../../src/app/api/chat/route'
import { clearChatResponseCache } from '../../src/lib/chat-cache'
import { notifyOwner } from '../../src/lib/notify'

vi.mock('../../src/lib/notify', () => ({
  NOTIFICATION_TIMEOUT_MS: 8_000,
  notifyOwner: vi.fn(),
}))

const fetchMock = vi.fn<typeof fetch>()
const notifyMock = vi.mocked(notifyOwner)
let requestNumber = 0

type StreamEvent = { type: string } & Record<string, unknown>

function chatRequest(content: string): NextRequest {
  requestNumber += 1
  return new NextRequest('http://localhost/api/chat', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': `198.51.100.${requestNumber}`,
    },
    body: JSON.stringify({
      sessionId: `stream-test-${requestNumber}`,
      messages: [{ role: 'user', content }],
      stream: true,
      route: '/',
    }),
  })
}

function providerResponse(reply = 'A streamed public answer'): Response {
  return new Response(
    `data: ${JSON.stringify({ model: 'unit/test-model', choices: [{ delta: { content: reply } }] })}\n\ndata: [DONE]\n\n`,
    { headers: { 'content-type': 'text/event-stream' } },
  )
}

function providerErrorResponse(code: number, partial?: string): Response {
  const prefix = partial
    ? `data: ${JSON.stringify({ model: 'unit/test-model', choices: [{ delta: { content: partial } }] })}\n\n`
    : ''
  return new Response(
    `${prefix}data: ${JSON.stringify({ error: { code, message: 'Provider stream failed' }, choices: [] })}\n\ndata: [DONE]\n\n`,
    { headers: { 'content-type': 'text/event-stream' } },
  )
}

function parseNdjson(body: string): StreamEvent[] {
  return body.trim().split('\n').map(line => JSON.parse(line) as StreamEvent)
}

function expectMissMetadata(response: Response): void {
  expect(response.headers.get('x-aria-cache')).toBe('MISS')
  expect(response.headers.get('cache-control')).toBe('no-store')
  expect(response.headers.get('x-aria-latency-ms')).toMatch(/^\d+$/)
}

beforeEach(() => {
  clearChatResponseCache()
  fetchMock.mockReset().mockImplementation(async () => providerResponse())
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
  clearChatResponseCache()
  vi.useRealTimers()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('opt-in NDJSON chat response caching', () => {
  it('emits a stream MISS and then serves an equivalent normalized request from cache', async () => {
    const first = await POST(chatRequest('How does Faris approach production engineering?'))
    expect(first.status).toBe(200)
    expect(first.headers.get('content-type')).toBe('application/x-ndjson; charset=utf-8')
    expectMissMetadata(first)
    const firstEvents = parseNdjson(await first.text())

    expect(firstEvents.map(event => event.type)).toEqual(['meta', 'delta', 'done'])
    expect(firstEvents[0]).toMatchObject({
      type: 'meta',
      availability: 'ok',
      model: 'unit/test-model',
      mode: 'model',
      sources: [],
    })
    expect(firstEvents.at(-1)).toMatchObject({
      type: 'done',
      availability: 'ok',
      reply: 'A streamed public answer',
      model: 'unit/test-model',
      mode: 'model',
    })

    const second = await POST(chatRequest('  HOW   DOES faris APPROACH production ENGINEERING?!...  '))
    expect(second.status).toBe(200)
    expect(second.headers.get('x-aria-cache')).toBe('HIT')
    expect(second.headers.get('cache-control')).toBe('no-store')
    expect(second.headers.get('x-aria-latency-ms')).toMatch(/^\d+$/)
    expect(parseNdjson(await second.text())).toEqual(firstEvents)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('returns stream error metadata without caching an empty provider response', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    fetchMock
      .mockResolvedValueOnce(new Response('data: [DONE]\n\n', {
        headers: { 'content-type': 'text/event-stream' },
      }))
      .mockResolvedValue(Response.json({ choices: [] }))
    const question = 'What public production development work is in Faris\'s portfolio?'

    const failed = await POST(chatRequest(question))
    expect(failed.status).toBe(200)
    expectMissMetadata(failed)
    const failedEvents = parseNdjson(await failed.text())
    expect(failedEvents.map(event => event.type)).toEqual(['meta', 'error'])
    expect(failedEvents.at(-1)).toMatchObject({
      type: 'error',
      availability: 'unavailable',
      reply: expect.any(String),
    })
    expect(fetchMock).toHaveBeenCalledTimes(3)

    fetchMock.mockReset().mockImplementation(async () => providerResponse())
    const recovered = await POST(chatRequest(question))
    expect(recovered.status).toBe(200)
    expectMissMetadata(recovered)
    expect(parseNdjson(await recovered.text()).at(-1)).toMatchObject({
      type: 'done',
      availability: 'ok',
      reply: 'A streamed public answer',
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('recovers a committed provider error through a different model and caches only the full answer', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    fetchMock
      .mockResolvedValueOnce(providerErrorResponse(502))
      .mockResolvedValueOnce(Response.json({
        model: 'unit/recovered-model',
        choices: [{ message: { content: 'Recovered complete answer' } }],
      }))
    const question = 'What public validation trade-offs are visible in Faris\'s architecture?'

    const response = await POST(chatRequest(question))
    const events = parseNdjson(await response.text())
    expect(events.map(event => event.type)).toEqual(['meta', 'delta', 'done'])
    expect(events.at(-1)).toMatchObject({
      type: 'done',
      availability: 'ok',
      reply: 'Recovered complete answer',
      model: 'unit/recovered-model',
    })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    const bodies = fetchMock.mock.calls.map(([, init]) => JSON.parse(String(init?.body)) as { model: string; stream: boolean })
    expect(bodies[0]).toMatchObject({ model: 'unit/test-model', stream: true })
    expect(bodies[1]).toMatchObject({ model: 'mistralai/mistral-nemo', stream: false })

    const cached = await POST(chatRequest(question))
    expect(cached.headers.get('x-aria-cache')).toBe('HIT')
    expect(parseNdjson(await cached.text()).at(-1)).toMatchObject({ reply: 'Recovered complete answer' })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('replaces a partial failed stream with a complete fallback answer', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    fetchMock
      .mockResolvedValueOnce(providerErrorResponse(502, 'Incomplete draft'))
      .mockResolvedValueOnce(Response.json({ choices: [{ message: { content: 'Complete fallback answer' } }] }))

    const response = await POST(chatRequest('Which public constraints govern ARIA recommendations?'))
    const events = parseNdjson(await response.text())
    expect(events.map(event => event.type)).toEqual(['meta', 'delta', 'delta', 'done'])
    expect(events.at(-2)).toMatchObject({ type: 'delta', content: 'Complete fallback answer' })
    expect(events.at(-1)).toMatchObject({ type: 'done', availability: 'ok', reply: 'Complete fallback answer' })
    expect(events.at(-1)?.reply).not.toContain('Incomplete draft')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('maps an upstream mid-stream rate limit without starting another provider attempt', async () => {
    fetchMock.mockResolvedValueOnce(providerErrorResponse(429))
    const response = await POST(chatRequest('How should Faris approach public evaluation release gates?'))
    const events = parseNdjson(await response.text())

    expect(events).toHaveLength(2)
    expect(events.at(-1)).toMatchObject({ type: 'error', availability: 'rate_limited' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
