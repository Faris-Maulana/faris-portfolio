import { afterEach, describe, expect, it, vi } from 'vitest'
import { GET } from '@/app/api/health/route'

afterEach(() => vi.unstubAllEnvs())

describe('health route', () => {
  it('reports readiness with a boolean binding and no secret material', async () => {
    vi.stubEnv('OPENROUTER_API_KEY', 'health-test-secret')

    const response = GET()

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    const body = await response.json()
    expect(body).toEqual({
      status: 'ok',
      runtime: 'ready',
      bindings: { OPENROUTER_API_KEY: true },
    })
    expect(JSON.stringify(body)).not.toContain('health-test-secret')
  })

  it.each(['', '   '])('returns 503 when the required binding is blank', async value => {
    vi.stubEnv('OPENROUTER_API_KEY', value)

    const response = GET()

    expect(response.status).toBe(503)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(await response.json()).toEqual({
      status: 'misconfigured',
      runtime: 'ready',
      bindings: { OPENROUTER_API_KEY: false },
    })
  })
})
