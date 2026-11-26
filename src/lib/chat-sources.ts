import type { ChatSource } from '@/lib/chat-types'
import type { ChatRequestMessage } from '@/lib/chat-schema'
import { EVIDENCE_REGISTRY } from '@/lib/evidence-content'

interface SourceRule {
  pattern: RegExp
  sources: readonly ChatSource[]
}

function artifactUrl(projectId: string, artifactId: string): string {
  const artifact = EVIDENCE_REGISTRY.find(project => project.id === projectId)
    ?.artifacts.find(item => item.id === artifactId)
  if (artifact?.location.type !== 'external') {
    throw new Error(`Missing external chat artifact: ${projectId}/${artifactId}`)
  }
  return artifact.location.url
}

const SOURCE_RULES: readonly SourceRule[] = [
  {
    pattern: /simpul|proving ground|incident replay|counterfactual/i,
    sources: [
      { title: 'Open SIMPUL proving ground', href: '/simpul' },
      { title: 'SIMPUL evidence and limitations', href: '/work/simpul' },
    ],
  },
  {
    pattern: /wealth|advisory|advisor|human.review/i,
    sources: [
      { title: 'Wealth Advisor case study', href: '/work/wealth-advisor' },
      { title: 'Run the public browser demo', href: 'https://faris-maulana.github.io/wealth-advisor-agents/' },
    ],
  },
  {
    pattern: /ottodot|booking|last.seat|payment.race|overbook/i,
    sources: [
      { title: 'Ottodot case study', href: '/work/ottodot' },
      { title: 'Concurrency test source', href: artifactUrl('ottodot', 'ottodot-concurrency-test-source') },
    ],
  },
  {
    pattern: /\brag\b|retriev|rerank|faithful|grounding/i,
    sources: [
      { title: 'RAG evaluation case study', href: '/work/rag-eval' },
      { title: 'Raw 20-query retrieval report', href: artifactUrl('rag-eval', 'rag-retrieval-report') },
    ],
  },
  {
    pattern: /text2sql|text.to.sql|\bsql\b|schema.discovery|warehouse/i,
    sources: [{ title: 'Text2SQL architecture and current maturity', href: '/work/text2sql' }],
  },
  {
    pattern: /\bnoc\b|network.monitoring|alert.agent|fiber.agent/i,
    sources: [{ title: 'NOC proof of concept and limits', href: '/work/noc-agent' }],
  },
  {
    pattern: /appraisal|crew.performance|maritime.workflow/i,
    sources: [{ title: 'Maritime appraisal evidence boundary', href: '/work/appraisal' }],
  },
  {
    pattern: /leadership|engineering.manager|mandate|ownership|decision.record/i,
    sources: [{ title: 'Leadership mandate and decision records', href: '/#leadership' }],
  },
  {
    pattern: /education|degree|credential|certificate|gpa/i,
    sources: [{ title: 'Public credentials', href: '/#credentials' }],
  },
]

/** Return static editorial links related to the latest question, never model-generated URLs. */
export function getChatSources(messages: ChatRequestMessage[]): ChatSource[] {
  const latest = messages.at(-1)
  const question = latest?.role === 'user' ? latest.content : ''
  if (!question) return []

  const sources = SOURCE_RULES.filter(rule => rule.pattern.test(question)).flatMap(rule => rule.sources)
  return [...new Map(sources.map(source => [source.href, source])).values()].slice(0, 4)
}
