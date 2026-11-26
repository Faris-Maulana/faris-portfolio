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
    fetchMock.mockResolvedValueOnce(new Response('data: [DONE]\n\n', {
      headers: { 'content-type': 'text/event-stream' },
    }))
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

    const recovered = await POST(chatRequest(question))
    expect(recovered.status).toBe(200)
    expectMissMetadata(recovered)
    expect(parseNdjson(await recovered.text()).at(-1)).toMatchObject({
      type: 'done',
      availability: 'ok',
      reply: 'A streamed public answer',
    })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
