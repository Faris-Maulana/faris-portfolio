import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NOTIFICATION_TIMEOUT_MS, notifyOwner, type VisitorMessage } from '../../src/lib/notify'

const fetchMock = vi.fn<typeof fetch>()
const message: VisitorMessage = {
  name: '<img src=x onerror=alert(1)>',
  email: 'visitor@example.com',
  subject: 'Review\r\nInjected: header',
  message: '<script>alert("x")</script> & details',
  source: 'contact_form',
  meta: { Company: '<b>Example</b>' },
}

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
  vi.stubEnv('RESEND_API_KEY', 'unit-test-resend-key')
  vi.stubEnv('FONNTE_TOKEN', '')
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('notifyOwner', () => {
  it('escapes visitor-controlled HTML and reports provider acceptance', async () => {
    fetchMock.mockImplementation(async () => Response.json({ id: 'email-id' }))
    const result = await notifyOwner(message)

    expect(result).toMatchObject({ email: true, notified: true, unconfigured: ['whatsapp'] })
    const init = fetchMock.mock.calls[0]?.[1]
    const payload = JSON.parse(String(init?.body)) as { html: string; subject: string }
    expect(payload.html).toContain('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; details')
    expect(payload.html).toContain('&lt;img src=x onerror=alert(1)&gt;')
    expect(payload.html).toContain('&lt;b&gt;Example&lt;/b&gt;')
    expect(payload.html).not.toContain('<script>alert')
    expect(payload.subject).not.toMatch(/[\r\n]/)
    expect(init?.signal).toBeInstanceOf(AbortSignal)
  })

  it('does not treat a 200 rejection from Fonnte as delivered', async () => {
    vi.stubEnv('RESEND_API_KEY', '')
    vi.stubEnv('FONNTE_TOKEN', 'unit-test-fonnte-token')
    fetchMock.mockImplementation(async () => Response.json({ status: false }))
    const result = await notifyOwner(message)
    expect(result).toMatchObject({ whatsapp: false, notified: false })
  })

  it('times out a stuck channel and returns a failed delivery result', async () => {
    const controller = new AbortController()
    const timeout = vi.spyOn(AbortSignal, 'timeout').mockReturnValue(controller.signal)
    fetchMock.mockImplementation(async (_input, init) => {
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(new DOMException('Timed out', 'TimeoutError'))
        })
      })
    })

    const pending = notifyOwner(message)
    controller.abort()
    await expect(pending).resolves.toMatchObject({ email: false, notified: false })
    expect(timeout).toHaveBeenCalledWith(NOTIFICATION_TIMEOUT_MS)
  })
})
