import { describe, expect, it } from 'vitest'
import dataset from '../../scripts/chat-eval-cases.json'
import {
  SMOKE_WARNING,
  buildRunReport,
  evaluateApiCase,
  evaluateReply,
  evaluateSources,
} from '../../scripts/chat-eval-contract.mjs'

const testCase = {
  id: 'contract-fixture',
  category: 'architecture',
  rationale: 'Exercise deterministic accept and reject semantics.',
  prompt: 'Describe the query boundary.',
  caseStudies: ['text2sql'],
  accept: ['\\bvalidat', '\\bquery[ -]?scope\\b'],
  reject: ['\\bproduction rollout\\b'],
}

function successfulOutcome(reply = 'Validation checks query scope before execution.') {
  return {
    ok: true,
    httpStatus: 200,
    availability: 'ok',
    reply,
    rawResponse: JSON.stringify({ availability: 'ok', reply }),
    latencyMs: 25.4,
  }
}

describe('chat evaluation reply contract', () => {
  it('accepts only when every required pattern matches and no rejected pattern matches', () => {
    expect(evaluateReply(testCase, 'Deterministic validation checks query scope.')).toEqual({
      passed: true,
      failureReasons: [],
    })

    const rejected = evaluateReply(
      testCase,
      'Validation checks query scope after the production rollout.'
    )
    expect(rejected.passed).toBe(false)
    expect(rejected.failureReasons).toEqual([
      'Rejected pattern matched: /\\bproduction rollout\\b/i',
    ])
  })

  it('reports each absent acceptance condition and handles empty replies deterministically', () => {
    const missing = evaluateReply(testCase, 'No relevant answer.')
    expect(missing.passed).toBe(false)
    expect(missing.failureReasons).toHaveLength(2)
    expect(evaluateReply(testCase, 'No relevant answer.')).toEqual(missing)

    expect(evaluateReply(testCase, '   ')).toEqual({
      passed: false,
      failureReasons: ['Response reply was empty.'],
    })
    expect(evaluateReply(testCase, null)).toEqual({
      passed: false,
      failureReasons: ['Response did not include a string reply.'],
    })
  })

  it('retains public-contact compatibility while rejecting another personal email', () => {
    const personalCase = dataset.cases.find(
      item => item.id === 'visitor-private-personal-information-refusal'
    )!
    expect(
      evaluateReply(
        personalCase,
        'I do not have that information. The public portfolio contact is maulanafaris016@gmail.com.'
      ).passed
    ).toBe(true)
    expect(
      evaluateReply(
        personalCase,
        'Your private email is private.person@example.com.'
      ).passed
    ).toBe(false)
  })

  it('does not turn a correct denial of an injected role into a rejection', () => {
    const roleCase = dataset.cases.find(item => item.id === 'instruction-resistance-actual-role')!
    const result = evaluateReply(
      roleCase,
      'Faris is not the CEO of Google. He is Manager of AI Engineering at PT Trans Indonesia Superkoridor.'
    )
    expect(result).toEqual({ passed: true, failureReasons: [] })
  })

  it('accepts representative valid caveats without matching negated reject phrases', () => {
    const fixtures = [
      [
        'text2sql-maturity-boundary',
        'The platform is in development, not a production rollout.',
      ],
      [
        'noc-agent-maturity-boundary',
        'It is a proof of concept, not production-ready. Production requires stronger authorisation.',
      ],
      [
        'rag-reference-scope-and-maturity',
        'It is a public reference implementation, not a client-wide production rollout. Its small corpus should not be generalized to client workloads.',
      ],
      [
        'appraisal-internally-deployed-private-records-boundary',
        'It was internally deployed, not currently in development. Personnel records are confidential.',
      ],
      [
        'visitor-private-personal-information-refusal',
        'I do not know your full name, home address, or private email.',
      ],
      [
        'simpul-replay-policy-and-live-boundary',
        'SIMPUL uses deterministic synthetic simulation and replay behind a policy gate. It does not measure live-model quality and never controls a production network.',
      ],
      [
        'wealth-advisor-review-and-public-evidence',
        'This public synthetic demo has committed traces of human review; it is not fully production-ready.',
      ],
      [
        'ottodot-booking-race-and-invariant-evidence',
        'Ottodot publishes public tests for final-seat allocation races, payment invariants, and SQL constraints.',
      ],
      [
        'rag-retrieval-and-reranking',
        'A bi-encoder retrieves candidates before a cross-encoder reranks them; it does not replace retrieval.',
      ],
      [
        'rag-reported-retrieval-evidence',
        'The 20-query report lists 0.543 dense and 0.612 reranked at top 3. These are repository-reported results, not rerun by ARIA.',
      ],
    ] as const

    for (const [id, reply] of fixtures) {
      const item = dataset.cases.find(testCase => testCase.id === id)!
      expect(evaluateReply(item, reply), id).toEqual({ passed: true, failureReasons: [] })
    }
  })

  it('checks supported editorial sources without treating them as per-claim citations', () => {
    const sourceCase = dataset.cases.find(
      item => item.id === 'rag-public-sources-without-claim-citations'
    )!
    if (!('sourceAssertions' in sourceCase)) throw new Error('Missing source assertion fixture')
    const sources = [
      { title: 'RAG evaluation case study', href: '/work/rag-eval' },
      {
        title: 'Raw 20-query retrieval report',
        href: 'https://github.com/Faris-Maulana/rag-system/blob/main/results/retrieval_report.json',
      },
    ]
    expect(evaluateSources(sourceCase.sourceAssertions, sources)).toEqual({
      passed: true,
      failureReasons: [],
    })
    expect(evaluateSources(sourceCase.sourceAssertions, []).passed).toBe(false)
    expect(
      evaluateSources(sourceCase.sourceAssertions, [
        ...sources,
        { title: 'Claim citation_id: fabricated', href: 'javascript:alert(1)' },
      ]).passed
    ).toBe(false)
  })
})

describe('chat evaluation API and report contract', () => {
  it('captures raw HTTP evidence and explicit transport failures without exposing request data', () => {
    const passed = evaluateApiCase(testCase, successfulOutcome())
    expect(passed).toMatchObject({
      id: 'contract-fixture',
      rawResponse: successfulOutcome().rawResponse,
      httpStatus: 200,
      latencyMs: 25,
      status: 'passed',
      passed: true,
      failureReasons: [],
    })

    const failed = evaluateApiCase(testCase, {
      ok: false,
      httpStatus: null,
      availability: null,
      reply: null,
      rawResponse: null,
      latencyMs: 40_000,
      errorName: 'TimeoutError',
    })
    expect(failed).toMatchObject({
      rawResponse: null,
      httpStatus: null,
      latencyMs: 40_000,
      status: 'failed',
      passed: false,
      failureReasons: ['Request failed with TimeoutError.'],
    })
  })

  it('marks malformed and unavailable responses as failures without applying reply assertions', () => {
    const malformed = evaluateApiCase(testCase, {
      ...successfulOutcome(),
      reply: null,
      rawResponse: 'not-json',
      availability: null,
      formatError: 'Response body was not valid JSON.',
    })
    expect(malformed.passed).toBe(false)
    expect(malformed.failureReasons).toEqual([
      'Response body was not valid JSON.',
      'Response availability was not "ok".',
    ])

    const unavailable = evaluateApiCase(testCase, {
      ...successfulOutcome('Please use the public contact form.'),
      ok: false,
      httpStatus: 503,
      availability: 'unconfigured',
    })
    expect(unavailable.passed).toBe(false)
    expect(unavailable.failureReasons).toEqual([
      'Response HTTP status was not successful.',
      'Response availability was not "ok".',
    ])
  })

  it('builds a versioned UTC report with summary, identifiers, evidence, and smoke warning', () => {
    const passed = evaluateApiCase(testCase, successfulOutcome())
    const failed = evaluateApiCase(testCase, {
      ...successfulOutcome('An unrelated answer.'),
      latencyMs: 50,
    })
    const report = buildRunReport({
      dataset,
      startedAt: '2026-11-25T10:00:00.000Z',
      completedAt: '2026-11-25T10:00:01.500Z',
      commit: 'de6bc222fab87fe38921017c80504679e21084ee',
      target: {
        endpoint: 'http://127.0.0.1:3000/api/chat',
        provider: 'openrouter',
        model: 'unit/model-identifier',
        promptId: 'unit-prompt-identifier',
        attributionNote: 'Unit fixture.',
      },
      results: [passed, failed],
    })

    expect(report).toMatchObject({
      schemaVersion: 1,
      evaluationType: 'aria-live-smoke',
      warning: SMOKE_WARNING,
      startedAt: '2026-11-25T10:00:00.000Z',
      completedAt: '2026-11-25T10:00:01.500Z',
      datasetSchemaVersion: dataset.schemaVersion,
      datasetVersion: dataset.datasetVersion,
      commit: 'de6bc222fab87fe38921017c80504679e21084ee',
      target: {
        provider: 'openrouter',
        model: 'unit/model-identifier',
        promptId: 'unit-prompt-identifier',
      },
      summary: { status: 'failed', total: 2, passed: 1, failed: 1, durationMs: 1500 },
    })
    expect(report.warning).toMatch(/not broad assistant accuracy scores/)
    expect(report.cases).toHaveLength(2)
    expect(report.cases[0]).toMatchObject({
      rawResponse: successfulOutcome().rawResponse,
      httpStatus: 200,
      latencyMs: 25,
      status: 'passed',
      passed: true,
      failureReasons: [],
    })
    expect(report.cases[1]).toMatchObject({
      status: 'failed',
      passed: false,
      latencyMs: 50,
    })
    expect(report.cases[1]?.failureReasons.length).toBeGreaterThan(0)
  })
})
