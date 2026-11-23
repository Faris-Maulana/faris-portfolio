import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from '../../src/app/api/contact/route'
import { notifyOwner } from '../../src/lib/notify'

vi.mock('../../src/lib/notify', () => ({ notifyOwner: vi.fn() }))

const notifyMock = vi.mocked(notifyOwner)
let requestNumber = 0
const valid = {
  name: 'Faris',
  email: 'FARIS@EXAMPLE.COM',
  subject: 'RAG review',
  message: 'A sufficiently detailed message.',
}

function request(body: unknown, headers: Record<string, string> = {}) {
  requestNumber += 1
  return new NextRequest('http://localhost/api/contact', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': `198.51.100.${requestNumber}`,
      ...headers,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

beforeEach(() => {
  notifyMock.mockReset().mockResolvedValue({
    email: true,
    whatsapp: false,
    notified: true,
    unconfigured: ['whatsapp'],
  })
})

describe('contact route', () => {
  it('sends the trimmed, normalised payload', async () => {
    const res = await POST(request({ ...valid, name: '  Faris  ', message: `  ${valid.message}  ` }))
    expect(res.status).toBe(200)
    expect(notifyMock).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Faris', email: 'faris@example.com' })
    )
  })

  it('returns safe field errors for whitespace input', async () => {
    const res = await POST(request({ ...valid, name: '   ', message: '          ' }))
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body).toMatchObject({ error: 'Please check your details and try again.' })
    expect(body).not.toHaveProperty('issues')
    expect(notifyMock).not.toHaveBeenCalled()
  })

  it('rejects oversized declared and streamed bodies with 413', async () => {
    const declared = await POST(request(valid, { 'content-length': String(17 * 1024) }))
    const streamed = await POST(request({ data: 'x'.repeat(17 * 1024) }))
    expect(declared.status).toBe(413)
    expect(streamed.status).toBe(413)
    expect(notifyMock).not.toHaveBeenCalled()
  })

  it('returns 400 for malformed JSON and 503 when delivery fails', async () => {
    const malformed = await POST(request('{bad json'))
    expect(malformed.status).toBe(400)

    notifyMock.mockResolvedValue({
      email: false,
      whatsapp: false,
      notified: false,
      unconfigured: [],
    })
    const failed = await POST(request(valid))
    expect(failed.status).toBe(503)
    expect(await failed.json()).toMatchObject({ fallback: true })
  })

  it('silently accepts a filled honeypot without notifying', async () => {
    const res = await POST(request({ ...valid, honeypot: 'bot' }))
    expect(res.status).toBe(200)
    expect(notifyMock).not.toHaveBeenCalled()
  })
})
