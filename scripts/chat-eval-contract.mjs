export const DATASET_SCHEMA_VERSION = 1
export const REPORT_SCHEMA_VERSION = 1

export const SMOKE_WARNING =
  'WARNING: LIVE SMOKE CHECKS ONLY. These results are not broad assistant accuracy scores, do not measure general assistant quality, and must not be presented as an accuracy benchmark.'

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function validatePatterns(value, field, location, errors) {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`${location}.${field} must be a non-empty regex array`)
    return
  }

  for (const [index, pattern] of value.entries()) {
    if (typeof pattern !== 'string' || pattern.length === 0) {
      errors.push(`${location}.${field}[${index}] must be a non-empty string`)
      continue
    }
    try {
      new RegExp(pattern, 'i')
    } catch {
      errors.push(`${location}.${field}[${index}] is not a valid JavaScript regex`)
    }
  }
}

export function validateDataset(dataset) {
  const errors = []
  if (!isRecord(dataset)) return ['Dataset must be a JSON object']

  if (dataset.schemaVersion !== DATASET_SCHEMA_VERSION) {
    errors.push(`schemaVersion must be ${DATASET_SCHEMA_VERSION}`)
  }
  if (typeof dataset.datasetVersion !== 'string' || !/^\d+\.\d+\.\d+$/.test(dataset.datasetVersion)) {
    errors.push('datasetVersion must use semantic versioning')
  }
  if (typeof dataset.label !== 'string' || dataset.label.trim() === '') {
    errors.push('label must be a non-empty string')
  }
  if (!Array.isArray(dataset.cases) || dataset.cases.length === 0) {
    errors.push('cases must be a non-empty array')
    return errors
  }

  const ids = new Set()
  const prompts = new Set()
  for (const [index, testCase] of dataset.cases.entries()) {
    const location = `cases[${index}]`
    if (!isRecord(testCase)) {
      errors.push(`${location} must be an object`)
      continue
    }

    if (typeof testCase.id !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(testCase.id)) {
      errors.push(`${location}.id must be a kebab-case identifier`)
    } else if (ids.has(testCase.id)) {
      errors.push(`${location}.id duplicates ${testCase.id}`)
    } else {
      ids.add(testCase.id)
    }

    for (const field of ['category', 'rationale', 'prompt']) {
      if (typeof testCase[field] !== 'string' || testCase[field].trim() === '') {
        errors.push(`${location}.${field} must be a non-empty string`)
      }
    }
    if (typeof testCase.prompt === 'string') {
      if (prompts.has(testCase.prompt)) errors.push(`${location}.prompt must be unique`)
      prompts.add(testCase.prompt)
    }
    if (
      !Array.isArray(testCase.caseStudies) ||
      testCase.caseStudies.some(slug => typeof slug !== 'string' || slug.trim() === '') ||
      new Set(testCase.caseStudies).size !== testCase.caseStudies.length
    ) {
      errors.push(`${location}.caseStudies must contain unique, non-empty strings`)
    }

    validatePatterns(testCase.accept, 'accept', location, errors)
    validatePatterns(testCase.reject, 'reject', location, errors)
    if (testCase.sourceAssertions !== undefined) {
      if (!isRecord(testCase.sourceAssertions)) {
        errors.push(`${location}.sourceAssertions must be an object`)
      } else {
        validatePatterns(testCase.sourceAssertions.accept, 'sourceAssertions.accept', location, errors)
        validatePatterns(testCase.sourceAssertions.reject, 'sourceAssertions.reject', location, errors)
      }
    }
  }

  return errors
}

export function assertValidDataset(dataset) {
  const errors = validateDataset(dataset)
  if (errors.length > 0) {
    throw new Error(`Invalid chat evaluation dataset:\n${errors.join('\n')}`)
  }
  return dataset
}

export function evaluateReply(testCase, reply) {
  if (typeof reply !== 'string') {
    return { passed: false, failureReasons: ['Response did not include a string reply.'] }
  }
  if (reply.trim() === '') {
    return { passed: false, failureReasons: ['Response reply was empty.'] }
  }

  const failureReasons = []
  for (const pattern of testCase.accept) {
    if (!new RegExp(pattern, 'i').test(reply)) {
      failureReasons.push(`Required pattern did not match: /${pattern}/i`)
    }
  }
  for (const pattern of testCase.reject) {
    if (new RegExp(pattern, 'i').test(reply)) {
      failureReasons.push(`Rejected pattern matched: /${pattern}/i`)
    }
  }

  return { passed: failureReasons.length === 0, failureReasons }
}

export function evaluateSources(assertions, sources) {
  if (!Array.isArray(sources)) {
    return { passed: false, failureReasons: ['Response sources were not an array.'] }
  }

  const entries = sources.map(source =>
    isRecord(source) && typeof source.title === 'string' && typeof source.href === 'string'
      ? `${source.title} ${source.href}`
      : null
  )
  const failureReasons = entries.includes(null)
    ? ['Response sources contained an invalid source record.']
    : []

  for (const pattern of assertions.accept) {
    if (!entries.some(entry => entry !== null && new RegExp(pattern, 'i').test(entry))) {
      failureReasons.push(`Required source pattern did not match: /${pattern}/i`)
    }
  }
  for (const pattern of assertions.reject) {
    if (entries.some(entry => entry !== null && new RegExp(pattern, 'i').test(entry))) {
      failureReasons.push(`Rejected source pattern matched: /${pattern}/i`)
    }
  }

  return { passed: failureReasons.length === 0, failureReasons }
}

export function evaluateApiCase(testCase, outcome) {
  const failureReasons = []
  const networkError = typeof outcome.errorName === 'string'
  const safeErrorName = /^[A-Za-z][A-Za-z0-9]{0,40}$/.test(outcome.errorName ?? '')
    ? outcome.errorName
    : 'Error'

  if (networkError) {
    failureReasons.push(`Request failed with ${safeErrorName}.`)
  } else {
    if (outcome.ok !== true) failureReasons.push('Response HTTP status was not successful.')
    if (outcome.formatError) failureReasons.push(outcome.formatError)
    if (outcome.availability !== 'ok') {
      failureReasons.push('Response availability was not "ok".')
    }
  }

  if (!networkError && outcome.ok === true && outcome.availability === 'ok') {
    failureReasons.push(...evaluateReply(testCase, outcome.reply).failureReasons)
    if (testCase.sourceAssertions) {
      failureReasons.push(...evaluateSources(testCase.sourceAssertions, outcome.sources).failureReasons)
    }
  }

  const passed = failureReasons.length === 0
  return {
    id: testCase.id,
    category: testCase.category,
    rationale: testCase.rationale,
    prompt: testCase.prompt,
    caseStudies: [...testCase.caseStudies],
    rawResponse: typeof outcome.rawResponse === 'string' ? outcome.rawResponse : null,
    httpStatus: Number.isInteger(outcome.httpStatus) ? outcome.httpStatus : null,
    availability: typeof outcome.availability === 'string' ? outcome.availability : null,
    latencyMs: Number.isFinite(outcome.latencyMs) && outcome.latencyMs >= 0
      ? Math.round(outcome.latencyMs)
      : 0,
    status: passed ? 'passed' : 'failed',
    passed,
    failureReasons,
  }
}

export function buildRunReport({ dataset, startedAt, completedAt, commit, target, results }) {
  const start = Date.parse(startedAt)
  const end = Date.parse(completedAt)
  if (!Number.isFinite(start) || !Number.isFinite(end) || !startedAt.endsWith('Z') || !completedAt.endsWith('Z')) {
    throw new Error('Run report timestamps must be valid UTC ISO timestamps.')
  }

  const passed = results.filter(result => result.passed === true).length
  const failed = results.length - passed
  return {
    schemaVersion: REPORT_SCHEMA_VERSION,
    evaluationType: 'aria-live-smoke',
    warning: SMOKE_WARNING,
    startedAt,
    completedAt,
    datasetSchemaVersion: dataset.schemaVersion,
    datasetVersion: dataset.datasetVersion,
    commit: commit ?? null,
    target: {
      endpoint: target.endpoint,
      provider: target.provider ?? null,
      model: target.model ?? null,
      promptId: target.promptId ?? null,
      attributionNote: target.attributionNote,
    },
    summary: {
      status: failed === 0 ? 'passed' : 'failed',
      total: results.length,
      passed,
      failed,
      durationMs: Math.max(0, end - start),
    },
    cases: results.map(result => ({
      ...result,
      status: result.passed === true ? 'passed' : 'failed',
      passed: result.passed === true,
      caseStudies: [...result.caseStudies],
      failureReasons: [...result.failureReasons],
    })),
  }
}
