import { describe, expect, it } from 'vitest'
import { readJsonBody } from '../../src/lib/request-body'

function request(body: string, contentType = 'application/json') {
  return new Request('http://localhost/api/test', { method: 'POST', headers: { 'Content-Type': contentType }, body })
}

describe('readJsonBody', () => {
  it('rejects unsupported media types before parsing', async () => {
    expect(await readJsonBody(request('{}', 'text/plain'), 20)).toEqual({ ok: false, reason: 'unsupported_type' })
  })

  it('enforces the byte ceiling without Content-Length', async () => {
    const req = request(JSON.stringify({ value: 'x'.repeat(100) }))
    expect(await readJsonBody(req, 20)).toEqual({ ok: false, reason: 'too_large' })
  })

  it('decodes a valid bounded UTF-8 body', async () => {
    await expect(readJsonBody(request(JSON.stringify({ value: 'Jakarta' })), 100)).resolves.toEqual({ ok: true, data: { value: 'Jakarta' } })
  })
})
