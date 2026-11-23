import { afterEach, describe, expect, it, vi } from 'vitest'
import { clientKey, rateLimit } from '../../src/lib/rate-limit'

afterEach(() => {
  vi.useRealTimers()
})

describe('rateLimit', () => {
  it('enforces the fixed window and resets after expiry', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    const key = 'unit:fixed-window'

    expect(rateLimit(key, 2, 60_000)).toMatchObject({ ok: true, remaining: 1 })
    expect(rateLimit(key, 2, 60_000)).toMatchObject({ ok: true, remaining: 0 })
    expect(rateLimit(key, 2, 60_000)).toMatchObject({ ok: false, remaining: 0 })

    vi.advanceTimersByTime(60_001)
    expect(rateLimit(key, 2, 60_000)).toMatchObject({ ok: true, remaining: 1 })
  })

  it('keeps scopes and client addresses independent', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '203.0.113.8, 10.0.0.1' },
    })
    expect(clientKey(req, 'chat')).toBe('chat:203.0.113.8')
    expect(clientKey(req, 'contact')).toBe('contact:203.0.113.8')
  })
})
