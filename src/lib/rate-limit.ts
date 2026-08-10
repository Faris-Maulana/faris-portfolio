/**
 * Fixed-window rate limiter held in process memory.
 *
 * Honest about what this is: on serverless each instance keeps its own counter,
 * so the real ceiling is roughly `limit x instances`. That is fine for the job
 * it does here, which is stopping one script from posting a thousand messages,
 * not enforcing a billing quota. A shared store would be the answer if this
 * ever needs to be exact.
 */

interface Window {
  count: number
  resetAt: number
}

const buckets = new Map<string, Window>()

// Bounded so a flood of unique keys cannot grow the map without limit.
const MAX_KEYS = 5_000

function sweep(now: number) {
  for (const [key, win] of buckets) {
    if (win.resetAt <= now) buckets.delete(key)
  }
  if (buckets.size <= MAX_KEYS) return
  // Still oversized after expiry, so drop oldest insertions first.
  const excess = buckets.size - MAX_KEYS
  let dropped = 0
  for (const key of buckets.keys()) {
    buckets.delete(key)
    if (++dropped >= excess) break
  }
}

export interface RateLimitResult {
  ok: boolean
  remaining: number
  /** Seconds until the window resets, for a Retry-After header. */
  retryAfter: number
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now()
  sweep(now)

  const existing = buckets.get(key)
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: limit - 1, retryAfter: 0 }
  }

  existing.count += 1
  const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000))

  if (existing.count > limit) {
    return { ok: false, remaining: 0, retryAfter }
  }
  return { ok: true, remaining: limit - existing.count, retryAfter }
}

/**
 * Best-effort client identity.
 *
 * On Vercel `x-forwarded-for` is set by the edge and its first entry is the
 * real client. Falling back to a constant means an unknown client shares one
 * bucket with every other unknown, which fails closed rather than open.
 */
export function clientKey(req: Request, scope: string): string {
  const fwd = req.headers.get('x-forwarded-for')
  const ip = fwd?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
  return `${scope}:${ip}`
}
