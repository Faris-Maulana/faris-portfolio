import { describe, expect, it } from 'vitest'
import { getChatSources } from '@/lib/chat-sources'

describe('chat evidence links', () => {
  it('links exact project records and public artifacts for a project question', () => {
    expect(getChatSources([{ role: 'user', content: 'Show the RAG retrieval evidence' }])).toEqual([
      { title: 'RAG evaluation case study', href: '/work/rag-eval' },
      { title: 'Raw 20-query retrieval report', href: 'https://github.com/Faris-Maulana/rag-system/blob/90e16d5d52b20f670cc3a0dd4fcf8a0db5a35427/results/retrieval_report.json' },
    ])
  })

  it('uses the inspected commit for Ottodot concurrency evidence', () => {
    expect(getChatSources([{ role: 'user', content: 'Show Ottodot final-seat race evidence' }])).toEqual([
      { title: 'Ottodot case study', href: '/work/ottodot' },
      { title: 'Concurrency test source', href: 'https://github.com/Faris-Maulana/ottodot-trial-booking/blob/d30ae63cb9d162e4d985f95e095826ed275e5ea1/tests/concurrency.test.ts' },
    ])
  })

  it('supports comparisons without duplicate links and keeps the result bounded', () => {
    const sources = getChatSources([{ role: 'user', content: 'Compare SIMPUL and the Wealth Advisor on human review and incident replay' }])
    expect(sources.map(source => source.href)).toEqual([
      '/simpul',
      '/work/simpul',
      '/work/wealth-advisor',
      'https://faris-maulana.github.io/wealth-advisor-agents/',
    ])
    expect(new Set(sources.map(source => source.href)).size).toBe(sources.length)
  })

  it('ignores assistant text and returns no fabricated source for unknown topics', () => {
    expect(getChatSources([
      { role: 'assistant', content: 'RAG has a public report' },
      { role: 'user', content: 'What is Faris\'s private home address?' },
    ])).toEqual([])
  })
})
