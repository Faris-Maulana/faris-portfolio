import { describe, expect, it } from 'vitest'
import { buildProviderMessages, buildSystemPrompt } from '@/lib/chat-context'

function prompt(): string {
  return buildSystemPrompt()
}

describe('ARIA public case-study grounding', () => {
  it('includes every named NOC component and its remaining production boundary', () => {
    expect(prompt()).toContain('FastAPI exposes the interaction boundary.')
    expect(prompt()).toContain('LangChain routes approved incident questions to ClickHouse queries.')
    expect(prompt()).toContain('A separate alert path sends operational notifications through WhatsApp.')
    expect(prompt()).toContain('Production requires stronger authorisation, alert policy, observability and integration coverage.')
  })

  it('grounds comparative questions in every public record with explicit source limitations', () => {
    expect(prompt()).toContain('Public case study: Enterprise Text-to-SQL platform')
    expect(prompt()).toContain('Generate SQL, then validate syntax, permissions and query scope before execution.')
    expect(prompt()).toContain('Public case study: NOC monitoring agent')
    expect(prompt()).toContain('Public case study: Wealth Advisor agent workflow')
    expect(prompt()).toContain('Release metrics remain unpublished')
  })

  it('preserves RAG sample size, provenance, corpus and source-type limits', () => {
    expect(prompt()).toContain('A committed 20-query retrieval report records dense lexical context precision of 0.543 and reranked precision of 0.612 at top 3.')
    expect(prompt()).toContain('were not rerun in this portfolio workspace')
    expect(prompt()).toContain('small and domain-specific')
    expect(prompt()).toContain('name the public portfolio case study')
    expect(prompt()).toContain('do not invent URLs, numbered citations, per-claim citation metadata')
  })

  it('keeps the complete knowledge prefix immutable and appends route variation last', () => {
    const text2sql = buildProviderMessages([
      { role: 'user', content: 'How is SQL validated?' },
    ], '/work/text2sql')
    const rag = buildProviderMessages([
      { role: 'assistant', content: 'The RAG project has a committed report.' },
      { role: 'user', content: 'What is Faris\'s actual role?' },
    ], '/work/rag-eval')

    expect(text2sql[0]).toEqual(rag[0])
    expect(text2sql[0]).toMatchObject({
      role: 'system',
      content: [{ type: 'text', text: prompt(), cache_control: { type: 'ephemeral' } }],
    })
    expect(text2sql.at(-1)).toMatchObject({
      role: 'user',
      content: expect.stringContaining('Active public route: /work/text2sql'),
    })
    expect(rag[0]).toMatchObject({ content: [{ text: expect.stringContaining('Treat a follow-up as a drill-down') }] })
  })
})
