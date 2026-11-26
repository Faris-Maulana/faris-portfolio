import type { ChatMessage, ChatSource } from '@/lib/chat-types'

const FOLLOW_UP_GROUPS = [
  {
    pattern: /sql|query|schema|database/i,
    questions: ['Which validation boundaries are deterministic?', 'What is still unresolved in the Text2SQL platform?'],
  },
  {
    pattern: /rag|retriev|evaluat|quality/i,
    questions: ['How are faithfulness and retrieval quality separated?', 'What belongs in a release-gating evaluation set?'],
  },
  {
    pattern: /simpul|incident|replay|counterfactual/i,
    questions: ['How does SIMPUL bind approval to an action?', 'What does the deterministic reference run not prove?'],
  },
  {
    pattern: /lead|manage|own|mandate|team/i,
    questions: ['How does Faris make architecture tradeoffs visible?', 'Which delivery risks remain with the engineering lead?'],
  },
  {
    pattern: /project|matur|production|develop|ship/i,
    questions: ['Which case studies are public references versus proofs of concept?', 'Show me the architecture behind the flagship project.'],
  },
] as const

const CASE_STUDY_FOLLOW_UPS: Record<string, readonly string[]> = {
  text2sql: [
    'Which validation boundaries are deterministic?',
    'How are SQL contract rules tested in CI?',
    'What happens when a generated query fails scope validation?',
  ],
  'rag-eval': [
    'How do bi-encoder retrieval and cross-encoder reranking fail differently?',
    'Why is the committed retrieval metric a proxy rather than RAGAS context precision?',
    'What evidence is still missing for generation-quality claims?',
  ],
  simpul: [
    'How does SIMPUL bind approval to an action?',
    'How do event replay and counterfactual branches avoid mutating the source run?',
    'What does the deterministic reference run not prove?',
  ],
  'wealth-advisor': [
    'How do least-privilege tools contain advisory-agent failures?',
    'Which findings require a reviewer checkpoint before advice can continue?',
    'Which detector calibration evidence is still missing?',
  ],
  ottodot: [
    'How does the class transaction serialize final-seat allocation?',
    'What happens to authorization when capture or allocation fails?',
    'How do direct database writes verify the booking invariants?',
  ],
  'noc-agent': [
    'Which production controls remain outside the NOC proof of concept?',
    'How should stale telemetry and alert deduplication be tested?',
    'What public evidence exists for the separate alert path?',
  ],
  appraisal: [
    'How do parallel peer reviews change the appraisal state machine?',
    'Which negative workflow cases are covered by Playwright?',
    'Which personnel records remain outside the public evidence?',
  ],
}

const DEFAULT_FOLLOW_UPS = [
  'What does Faris own as an AI engineering lead?',
  'Which project best demonstrates evaluation discipline?',
] as const

export function getFollowUpQuestions(
  question: string,
  sources: readonly ChatSource[] = [],
): readonly string[] {
  const caseStudy = sources
    .map(source => source.href.match(/^\/work\/([a-z0-9-]+)$/)?.[1])
    .find(slug => slug && CASE_STUDY_FOLLOW_UPS[slug])
  const group = FOLLOW_UP_GROUPS.find(candidate => candidate.pattern.test(question))
  const candidates = caseStudy
    ? CASE_STUDY_FOLLOW_UPS[caseStudy] ?? DEFAULT_FOLLOW_UPS
    : group?.questions ?? DEFAULT_FOLLOW_UPS
  return candidates
    .filter(candidate => candidate.toLocaleLowerCase() !== question.trim().toLocaleLowerCase())
    .slice(0, caseStudy ? 3 : 2)
}

export function stripGeneratedRolePrefix(content: string, role: ChatMessage['role']): string {
  const prefix = role === 'assistant' ? /^\s*ARIA\s*:\s*-?\s*/i : /^\s*You\s*:\s*-?\s*/i
  return content.replace(prefix, '').trim()
}

export function formatTranscriptMarkdown(messages: ChatMessage[], exportedAt: Date): string {
  const turns = messages.filter(message => message.ts)
  const body = turns.map(message => {
    const author = message.role === 'user' ? 'You' : 'ARIA'
    const sources = message.sources?.length
      ? `\n\nRelated public records:\n${message.sources.map(source => `- [${source.title}](${source.href})`).join('\n')}`
      : ''
    const content = stripGeneratedRolePrefix(message.content, message.role)
    return `## ${author}\n\n${content}${sources}\n\n_${message.ts}_`
  }).join('\n\n---\n\n')

  return [
    '# ARIA portfolio conversation',
    '',
    `Exported: ${exportedAt.toISOString()}`,
    '',
    'Scope: public portfolio context. AI-generated responses may be inaccurate and should be verified.',
    '',
    body,
    '',
  ].join('\n')
}
