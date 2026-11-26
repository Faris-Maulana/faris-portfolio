import { spawnSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import {
  SMOKE_WARNING,
  assertValidDataset,
  buildRunReport,
  evaluateApiCase,
} from './chat-eval-contract.mjs'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '..')
const origin = process.env.EVAL_BASE_URL || 'http://127.0.0.1:3000'
let endpoint
try {
  endpoint = new URL('/api/chat', origin)
} catch {
  throw new Error('EVAL_BASE_URL must be an HTTP(S) origin without embedded credentials.')
}

if (!['http:', 'https:'].includes(endpoint.protocol) || endpoint.username || endpoint.password) {
  throw new Error('EVAL_BASE_URL must be an HTTP(S) origin without embedded credentials.')
}

function identifier(value) {
  if (typeof value !== 'string') return null
  const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, '').trim()
  return cleaned ? cleaned.slice(0, 200) : null
}

function readCommit() {
  const result = spawnSync('git', ['show', '-s', '--format=%H', 'HEAD'], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    timeout: 5_000,
    shell: false,
    windowsHide: true,
  })
  if (result.status !== 0 || typeof result.stdout !== 'string') return null
  const commit = result.stdout.trim()
  return /^[0-9a-f]{40,64}$/i.test(commit) ? commit : null
}

const dataset = assertValidDataset(
  JSON.parse(await readFile(resolve(scriptDirectory, 'chat-eval-cases.json'), 'utf8'))
)
const startedAt = new Date().toISOString()
const runId = randomUUID()
const results = []

console.log(`ARIA LIVE SMOKE evaluation, dataset ${dataset.datasetVersion}`)
console.log(SMOKE_WARNING)

for (const [index, testCase] of dataset.cases.entries()) {
  const requestStarted = Date.now()
  let outcome

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: `aria-live-smoke-${runId}-${index + 1}`,
        messages: [{ role: 'user', content: testCase.prompt }],
      }),
      signal: AbortSignal.timeout(40_000),
      cache: 'no-store',
    })
    const rawResponse = await response.text()
    let body = null
    let formatError = null
    try {
      body = JSON.parse(rawResponse)
      if (typeof body !== 'object' || body === null || Array.isArray(body)) {
        formatError = 'Response body was not a JSON object.'
      }
    } catch {
      formatError = 'Response body was not valid JSON.'
    }

    outcome = {
      ok: response.ok,
      httpStatus: response.status,
      availability: body?.availability,
      reply: body?.reply,
      sources: body?.sources,
      rawResponse,
      latencyMs: Date.now() - requestStarted,
      formatError,
    }
  } catch (error) {
    outcome = {
      ok: false,
      httpStatus: null,
      availability: null,
      reply: null,
      sources: null,
      rawResponse: null,
      latencyMs: Date.now() - requestStarted,
      errorName: error instanceof Error ? error.name : 'Error',
    }
  }

  const result = evaluateApiCase(testCase, outcome)
  results.push(result)
  const httpStatus = result.httpStatus ?? 'request error'
  const reasons = result.failureReasons.length > 0
    ? `: ${result.failureReasons.join(' ')}`
    : ''
  console.log(`${result.status.toUpperCase()} ${result.id} (HTTP ${httpStatus}, ${result.latencyMs} ms)${reasons}`)
}

const completedAt = new Date().toISOString()
const report = buildRunReport({
  dataset,
  startedAt,
  completedAt,
  commit: readCommit(),
  target: {
    endpoint: endpoint.toString(),
    provider: identifier(process.env.EVAL_PROVIDER) ?? 'openrouter',
    model: identifier(process.env.EVAL_MODEL ?? process.env.OPENROUTER_MODEL),
    promptId: identifier(process.env.EVAL_PROMPT_ID),
    attributionNote:
      'Successful raw responses include deterministic/model mode and actual model attribution; unavailable responses have neither. EVAL_MODEL is only a non-secret configuration hint, not proof of the responder. promptId is optional and null when unavailable; source provenance is not established for an uncommitted tree.',
  },
  results,
})

const outputDirectory = resolve(repositoryRoot, 'eval-results', 'chat-evals')
const outputName = `${startedAt.replace(/[:.]/g, '-')}-${runId}.json`
const outputPath = resolve(outputDirectory, outputName)
await mkdir(outputDirectory, { recursive: true })
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' })

console.log(
  `SUMMARY ${report.summary.passed}/${report.summary.total} passed, ${report.summary.failed} failed, ${report.summary.durationMs} ms total.`
)
console.log(`Report: ${relative(repositoryRoot, outputPath)}`)
console.log('No visitor contact details or owner notifications were used. Raw responses are in the report, not stdout.')
if (report.summary.failed > 0) process.exitCode = 1
