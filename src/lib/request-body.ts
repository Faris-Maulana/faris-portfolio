export type JsonBodyResult =
  | { ok: true; data: unknown }
  | { ok: false; reason: 'malformed' | 'too_large' | 'unsupported_type' }

/**
 * Reads at most `maxBytes`, including when Content-Length is absent or false.
 * The header check avoids reading a body that is already known to be too big.
 */
export async function readJsonBody(
  req: Request,
  maxBytes: number
): Promise<JsonBodyResult> {
  const mediaType = req.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase()
  if (mediaType !== 'application/json') return { ok: false, reason: 'unsupported_type' }

  const declaredLength = Number(req.headers.get('content-length'))
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    return { ok: false, reason: 'too_large' }
  }

  if (!req.body) return { ok: false, reason: 'malformed' }

  const reader = req.body.getReader()
  const decoder = new TextDecoder()
  let bytes = 0
  let text = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        text += decoder.decode()
        break
      }

      bytes += value.byteLength
      if (bytes > maxBytes) {
        await reader.cancel().catch(() => undefined)
        return { ok: false, reason: 'too_large' }
      }
      text += decoder.decode(value, { stream: true })
    }

    return { ok: true, data: JSON.parse(text) as unknown }
  } catch {
    return { ok: false, reason: 'malformed' }
  } finally {
    reader.releaseLock()
  }
}
