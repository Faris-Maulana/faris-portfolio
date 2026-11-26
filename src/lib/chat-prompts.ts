export type ChatStarterIcon = 'architecture' | 'controls' | 'evaluation' | 'leadership' | 'maturity'

export interface ChatStarter {
  icon: ChatStarterIcon
  label: string
  question: string
}

export const GENERAL_STARTERS: readonly ChatStarter[] = [
  { icon: 'controls', label: 'Query controls', question: 'How is generated SQL validated before execution?' },
  { icon: 'architecture', label: 'System maturity', question: 'Which projects are still in development?' },
  { icon: 'evaluation', label: 'Evaluation', question: 'How is RAG quality evaluated?' },
  { icon: 'leadership', label: 'Leadership', question: 'What does Faris own as an AI engineering lead?' },
]

const CASE_STUDY_STARTERS: Record<string, readonly ChatStarter[]> = {
  text2sql: [
    { icon: 'controls', label: 'Validation boundary', question: 'How is generated SQL validated before execution?' },
    { icon: 'architecture', label: 'Query planning', question: 'How does Text2SQL separate schema discovery, planning and generation?' },
    { icon: 'evaluation', label: 'Release evidence', question: 'How are execution accuracy and answer fluency evaluated separately?' },
    { icon: 'maturity', label: 'Production work', question: 'What remains before the Text2SQL platform is production-ready?' },
  ],
  'rag-eval': [
    { icon: 'evaluation', label: 'Retrieval evidence', question: 'What does the RAG 20-query retrieval report actually show?' },
    { icon: 'architecture', label: 'Two-stage retrieval', question: 'How do bi-encoder retrieval and cross-encoder reranking differ?' },
    { icon: 'controls', label: 'Evidence boundaries', question: 'Why is the retrieval metric a proxy rather than RAGAS context precision?' },
    { icon: 'maturity', label: 'Unpublished metrics', question: 'Which RAG generation and fine-tuning results remain unpublished?' },
  ],
  simpul: [
    { icon: 'controls', label: 'Policy enforcement', question: 'How does SIMPUL bind an approval to the exact run, target and action?' },
    { icon: 'architecture', label: 'Replay mechanism', question: 'How do scenario seeds and event replay make SIMPUL runs deterministic?' },
    { icon: 'evaluation', label: 'Counterfactuals', question: 'How do counterfactual branches preserve the original incident run?' },
    { icon: 'maturity', label: 'Simulation boundary', question: 'What does the SIMPUL synthetic reference run not prove?' },
  ],
  'wealth-advisor': [
    { icon: 'controls', label: 'Human review', question: 'Which Wealth Advisor findings pause for human review?' },
    { icon: 'architecture', label: 'Tool boundaries', question: 'How do least-privilege tools and typed failures constrain advisory agents?' },
    { icon: 'evaluation', label: 'Committed outputs', question: 'What do the Wealth Advisor synthetic scenarios and committed outputs demonstrate?' },
    { icon: 'maturity', label: 'Production work', question: 'Which Wealth Advisor controls still require production work?' },
  ],
  ottodot: [
    { icon: 'controls', label: 'Final-seat invariant', question: 'How does Ottodot prevent two payments from capturing the final seat?' },
    { icon: 'architecture', label: 'Failure compensation', question: 'How are authorization, allocation, capture and compensation separated?' },
    { icon: 'evaluation', label: 'Concurrency tests', question: 'What do the Ottodot race tests and database invariant tests cover?' },
    { icon: 'maturity', label: 'Integration boundary', question: 'Which Ottodot payment and authorization boundaries remain outside the public implementation?' },
  ],
  'noc-agent': [
    { icon: 'architecture', label: 'Interaction model', question: 'Which public NOC components handle questions and alerts?' },
    { icon: 'controls', label: 'Authorization', question: 'Which NOC controls are required before production use?' },
    { icon: 'evaluation', label: 'Failure cases', question: 'How should stale telemetry and alert deduplication be tested?' },
    { icon: 'maturity', label: 'Proof of concept', question: 'What does the NOC proof of concept establish, and what remains unproven?' },
  ],
  appraisal: [
    { icon: 'architecture', label: 'Parallel workflow', question: 'How does the appraisal workflow allow independent peer reviews in parallel?' },
    { icon: 'controls', label: 'Role permissions', question: 'How are appraisal roles and workflow transitions separated?' },
    { icon: 'evaluation', label: 'Workflow tests', question: 'What does the appraisal Playwright coverage verify?' },
    { icon: 'maturity', label: 'Evidence boundary', question: 'Which appraisal implementation and personnel details are not public?' },
  ],
}

export function getStarterQuestions(pathname: string): readonly ChatStarter[] {
  if (pathname === '/simpul') return CASE_STUDY_STARTERS.simpul ?? GENERAL_STARTERS
  const match = pathname.match(/^\/work\/([a-z0-9-]+)\/?$/)
  return (match?.[1] ? CASE_STUDY_STARTERS[match[1]] : undefined) ?? GENERAL_STARTERS
}
