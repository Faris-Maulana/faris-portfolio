import { describe, expect, it } from 'vitest'
import dataset from '../../scripts/chat-eval-cases.json'
import {
  DATASET_SCHEMA_VERSION,
  assertValidDataset,
  validateDataset,
} from '../../scripts/chat-eval-contract.mjs'
import { CASE_STUDIES } from '../../src/lib/constants'

const requiredCategories = [
  'architecture',
  'maturity',
  'evaluation',
  'public-private-data',
  'personal-privacy',
  'instruction-resistance',
  'comparative',
  'source-behavior',
]

describe('ARIA live smoke dataset', () => {
  it('is a valid, explicitly versioned regex dataset with documented semantics', () => {
    expect(dataset.schemaVersion).toBe(DATASET_SCHEMA_VERSION)
    expect(dataset.datasetVersion).toMatch(/^\d+\.\d+\.\d+$/)
    expect(dataset.label).toMatch(/live smoke/i)
    expect(dataset.scope).toMatch(/no visitor contact data/i)
    expect(dataset.assertionSemantics).toEqual({
      accept: 'Every accept regex must match the reply.',
      reject: 'No reject regex may match the reply.',
      flags: 'Case-insensitive JavaScript regex (i).',
    })
    expect(validateDataset(dataset)).toEqual([])
    expect(() => assertValidDataset(dataset)).not.toThrow()
  })

  it('keeps IDs and prompts unique and requires rationale plus accept and reject patterns', () => {
    expect(new Set(dataset.cases.map(testCase => testCase.id)).size).toBe(dataset.cases.length)
    expect(new Set(dataset.cases.map(testCase => testCase.prompt)).size).toBe(dataset.cases.length)

    for (const testCase of dataset.cases) {
      expect(testCase.rationale.length).toBeGreaterThan(40)
      expect(testCase.category.length).toBeGreaterThan(0)
      expect(testCase.accept.length).toBeGreaterThan(0)
      expect(testCase.reject.length).toBeGreaterThan(0)
      for (const pattern of [...testCase.accept, ...testCase.reject]) {
        expect(() => new RegExp(pattern, 'i')).not.toThrow()
      }
      const sourceAssertions = 'sourceAssertions' in testCase ? testCase.sourceAssertions : undefined
      if (sourceAssertions) {
        for (const pattern of [...sourceAssertions.accept, ...sourceAssertions.reject]) {
          expect(() => new RegExp(pattern, 'i')).not.toThrow()
        }
      }
    }
  })

  it('covers every current public case study and only known case-study slugs', () => {
    const publicSlugs = CASE_STUDIES.map(study => study.id)
    const coveredSlugs = new Set(dataset.cases.flatMap(testCase => testCase.caseStudies))

    expect([...coveredSlugs].sort()).toEqual([...publicSlugs].sort())
    for (const slug of publicSlugs) {
      expect(
        dataset.cases.some(testCase => testCase.caseStudies.includes(slug)),
        `Missing live smoke coverage for ${slug}`
      ).toBe(true)
    }
  })

  it('covers maturity, privacy, injection, comparison, evaluation, and source boundaries', () => {
    const categories = new Set(dataset.cases.map(testCase => testCase.category))
    for (const category of requiredCategories) expect(categories).toContain(category)

    expect(dataset.cases.some(testCase => testCase.id === 'text2sql-maturity-boundary')).toBe(true)
    expect(dataset.cases.some(testCase => testCase.id === 'noc-agent-maturity-boundary')).toBe(true)
    expect(dataset.cases.some(testCase => testCase.id === 'comparative-text2sql-noc-maturity')).toBe(true)
    expect(dataset.cases.some(testCase => testCase.id === 'instruction-resistance-actual-role')).toBe(true)
  })

  it('stays within the request window and avoids contact notifications or unsupported citations', () => {
    expect(dataset.cases.length).toBeLessThanOrEqual(20)
    const emailAddress = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
    for (const testCase of dataset.cases) expect(testCase.prompt).not.toMatch(emailAddress)

    const sourceCase = dataset.cases.find(
      testCase => testCase.id === 'rag-public-sources-without-claim-citations'
    )!
    expect(sourceCase.accept.join(' ')).not.toMatch(/citation/i)
    const sourceAssertions = 'sourceAssertions' in sourceCase ? sourceCase.sourceAssertions : undefined
    expect(sourceAssertions?.accept).toHaveLength(2)
    expect(sourceCase.rationale).toMatch(/not per-claim or model-generated citations/i)
  })

  it('rejects duplicate identifiers and invalid regexes through the pure validator', () => {
    const invalid = {
      ...dataset,
      cases: [
        { ...dataset.cases[0]!, accept: ['[unterminated'] },
        { ...dataset.cases[0]!, prompt: 'A different prompt' },
      ],
    }
    const errors = validateDataset(invalid)
    expect(errors.some(error => error.includes('not a valid JavaScript regex'))).toBe(true)
    expect(errors.some(error => error.includes('duplicates'))).toBe(true)
    expect(() => assertValidDataset(invalid)).toThrow(/Invalid chat evaluation dataset/)
  })
})
