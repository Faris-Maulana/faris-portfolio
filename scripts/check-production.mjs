const baseUrl = (process.env.PRODUCTION_BASE_URL ?? 'https://faris-portfolio-red.vercel.app').replace(/\/+$/, '')
const REQUEST_TIMEOUT_MS = 15_000
const CHAT_TIMEOUT_MS = 20_000

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function fetchText(pathname, init = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  const method = init.method ?? 'GET'
  try {
    const response = await fetch(`${baseUrl}${pathname}`, {
      ...init,
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        'User-Agent': 'faris-portfolio-production-health/1',
        ...init.headers,
      },
    })
    const body = await response.text()
    assert(response.status === 200, `${method} ${pathname} returned HTTP ${response.status}`)
    return { response, body }
  } catch (error) {
    if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError')) {
      throw new Error(`${method} ${pathname} exceeded its ${timeoutMs}ms deadline`)
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

function assertSecurityHeaders(response, pathname) {
  const headers = response.headers
  assert(headers.get('x-content-type-options') === 'nosniff', `${pathname}: missing X-Content-Type-Options`)
  assert(headers.get('referrer-policy') === 'strict-origin-when-cross-origin', `${pathname}: invalid Referrer-Policy`)
  assert(headers.get('x-frame-options') === 'SAMEORIGIN', `${pathname}: invalid X-Frame-Options`)
  assert(headers.get('strict-transport-security') === 'max-age=63072000; includeSubDomains; preload', `${pathname}: invalid HSTS`)
  assert(headers.get('permissions-policy') === 'camera=(), microphone=(), geolocation=()', `${pathname}: invalid Permissions-Policy`)
  const csp = headers.get('content-security-policy') ?? ''
  for (const directive of ["object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'self'"]) {
    assert(csp.includes(directive), `${pathname}: missing CSP ${directive}`)
  }
  assert(!csp.includes("'unsafe-eval'"), `${pathname}: CSP permits unsafe-eval`)
}

async function checkDocument(pathname) {
  const { response, body } = await fetchText(pathname)
  assertSecurityHeaders(response, pathname)
  assert(body.includes('id="main"'), `${pathname}: missing main landmark`)
  const blocks = [...body.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
  assert(blocks.length > 0, `${pathname}: missing JSON-LD`)
  const records = blocks.map(([, value]) => {
    try {
      return JSON.parse(value)
    } catch {
      throw new Error(`${pathname}: malformed JSON-LD`)
    }
  })
  assert(records.some(record => record?.['@type'] === 'Person' && record?.name === 'Faris Maulana'), `${pathname}: missing Person JSON-LD`)
  console.log(`ok GET ${pathname}`)
}

async function checkHealth() {
  const { response, body } = await fetchText('/api/health')
  assert(response.headers.get('cache-control')?.includes('no-store'), '/api/health: response is cacheable')
  let health
  try {
    health = JSON.parse(body)
  } catch {
    throw new Error('/api/health: malformed JSON')
  }
  assert(health.status === 'ok', '/api/health: runtime is not ready')
  assert(health.runtime === 'ready', '/api/health: missing runtime readiness')
  assert(health.bindings?.OPENROUTER_API_KEY === true, '/api/health: required binding is unavailable')
  assert(Object.keys(health.bindings).length === 1, '/api/health: unexpected binding metadata')
  console.log('ok GET /api/health')
}

async function checkChat() {
  const { response, body } = await fetchText('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/x-ndjson',
      'X-Aria-Deterministic-Only': '1',
    },
    body: JSON.stringify({
      sessionId: 'production-health',
      messages: [{ role: 'user', content: 'What does the RAG 20-query retrieval report actually show?' }],
      stream: true,
      route: '/',
    }),
  }, CHAT_TIMEOUT_MS)
  assert(response.headers.get('content-type')?.includes('application/x-ndjson'), '/api/chat: expected NDJSON')
  let events
  try {
    events = body.split('\n').filter(line => line.trim()).map(line => JSON.parse(line))
  } catch {
    throw new Error('/api/chat: malformed NDJSON')
  }
  const done = events.at(-1)
  assert(events.some(event => event.type === 'meta'), '/api/chat: missing metadata event')
  assert(events.some(event => event.type === 'delta' && event.content), '/api/chat: missing content event')
  assert(done?.type === 'done' && done.availability === 'ok', '/api/chat: missing successful terminal event')
  assert(done.mode === 'deterministic', '/api/chat: synthetic check left the deterministic path')
  assert(typeof done.reply === 'string' && done.reply.trim() && done.reply.length <= 4000, '/api/chat: invalid reply')
  console.log('ok POST /api/chat (one deterministic request)')
}

try {
  await checkDocument('/')
  await checkDocument('/work/simpul')
  await checkHealth()
  await checkChat()
} catch (error) {
  console.error(`production health failed: ${error instanceof Error ? error.message : 'unknown error'}`)
  process.exitCode = 1
}
