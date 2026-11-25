import { describe, expect, it } from 'vitest'
import { buildSystemPrompt } from '@/lib/chat-context'

function promptFor(content: string): string {
  return buildSystemPrompt([{ role: 'user', content }])
}

describe('ARIA public case-study grounding', () => {
  it('includes every named NOC component and its remaining production boundary', () => {
    const prompt = promptFor('Which public NOC components and alert path are used, and is it production-ready?')
    expect(prompt).toContain('FastAPI exposes the interaction boundary.')
    expect(prompt).toContain('LangChain routes approved incident questions to ClickHouse queries.')
    expect(prompt).toContain('A separate alert path sends operational notifications through WhatsApp.')
    expect(prompt).toContain('Production requires stronger authorisation, alert policy, observability and integration coverage.')
  })

  it('grounds a comparative question in both records without adding unrelated record bodies', () => {
    const prompt = promptFor('Compare enterprise Text2SQL and the NOC agent, including SQL validation and maturity.')
    expect(prompt).toContain('Public case study: Enterprise Text-to-SQL platform')
    expect(prompt).toContain('Generate SQL, then validate syntax, permissions and query scope before execution.')
    expect(prompt).toContain('Public case study: NOC monitoring agent')
    expect(prompt).not.toContain('Public case study: Wealth Advisor')
    expect(prompt).toContain('Release metrics remain unpublished')
  })

  it('preserves RAG sample size, provenance, corpus and source-type limits', () => {
    const prompt = promptFor('Which portfolio materials support the RAG 20-query report and how broadly do they generalize?')
    expect(prompt).toContain('A committed 20-query retrieval report records dense lexical context precision of 0.543 and reranked precision of 0.612 at top 3.')
    expect(prompt).toContain('were not rerun in this portfolio workspace')
    expect(prompt).toContain('small and domain-specific')
    expect(prompt).toContain('name the public portfolio case study')
    expect(prompt).toContain('do not invent URLs, numbered citations, per-claim citation metadata')
  })

  it('uses only the latest user question to select public record bodies', () => {
    const prompt = buildSystemPrompt([
      { role: 'assistant', content: 'The RAG project has a committed report.' },
      { role: 'user', content: 'What is Faris\'s actual role?' },
    ])
    expect(prompt).toContain('Manager of AI Engineering')
    expect(prompt).not.toContain('Relevant public case-study records:')
  })
})
