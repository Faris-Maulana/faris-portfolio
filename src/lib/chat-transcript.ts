import type { ChatMessage } from '@/lib/chat-types'

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
    pattern: /lead|manage|own|mandate|team/i,
    questions: ['How does Faris make architecture tradeoffs visible?', 'Which delivery risks remain with the engineering lead?'],
  },
  {
    pattern: /project|matur|production|develop|ship/i,
    questions: ['Which case studies are shipped versus proofs of concept?', 'Show me the architecture behind the flagship project.'],
  },
] as const

const DEFAULT_FOLLOW_UPS = [
  'What does Faris own as an AI engineering lead?',
  'Which project best demonstrates evaluation discipline?',
] as const

export function getFollowUpQuestions(question: string): readonly string[] {
  const group = FOLLOW_UP_GROUPS.find(candidate => candidate.pattern.test(question))
  const candidates = group?.questions ?? DEFAULT_FOLLOW_UPS
  return candidates.filter(candidate => candidate.toLocaleLowerCase() !== question.trim().toLocaleLowerCase()).slice(0, 2)
}

export function formatTranscriptMarkdown(messages: ChatMessage[], exportedAt: Date): string {
  const turns = messages.filter(message => message.ts)
  const body = turns.map(message => {
    const author = message.role === 'user' ? 'You' : 'ARIA'
    return `## ${author}\n\n${message.content.trim()}\n\n_${message.ts}_`
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
