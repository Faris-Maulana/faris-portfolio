import { CASE_STUDY_DETAILS } from '@/lib/case-study-details'
import type { ChatRequestMessage } from '@/lib/chat-schema'
import { getChatSources } from '@/lib/chat-sources'
import { CASE_STUDIES } from '@/lib/constants'

const REQUEST_VERB = /\b(?:reveal|provide|show|give|include|share|expose|dump|print|list|disclose)\b/i
const SENSITIVE_RECORD = /\b(?:internal (?:noc )?(?:incident rows?|table names?|schema(?:\s+ddl)?)|approved internal table names?|real operational records?|live telemetry|personnel (?:scoring )?records?|internal personnel scoring records?|home address|private email|passwords?|api[ -]?keys?|secrets?|credentials)\b/i
const VISITOR_IDENTITY_REQUEST = /\bwhat(?:'s| is) my\b/i

/** High-confidence private-record requests receive a deterministic no-provider response. */
export function privateDataRefusal(messages: ChatRequestMessage[]): string | null {
  const latest = messages.at(-1)
  if (latest?.role !== 'user') return null
  const question = latest.content
  if (!(VISITOR_IDENTITY_REQUEST.test(question) && SENSITIVE_RECORD.test(question)) &&
      !(REQUEST_VERB.test(question) && SENSITIVE_RECORD.test(question))) return null

  const workSlug = getChatSources(messages).flatMap(source => {
    const match = source.href.match(/^\/work\/([a-z0-9-]+)$/)
    return match?.[1] ? [match[1]] : []
  })[0]
  const study = CASE_STUDIES.find(item => item.id === workSlug)
  const maturity = study ? ` ${study.title}: ${study.outcome}` : ''

  return `I cannot provide private operational data, internal schemas, live telemetry, personnel records, credentials or visitor personal information.${maturity} Public case studies provide architecture and evidence boundaries only.`
}

/** Preserve exact public evidence and source contracts without probabilistic omissions. */
export function controlledPortfolioReply(messages: ChatRequestMessage[]): string | null {
  const refusal = privateDataRefusal(messages)
  if (refusal) return refusal

  const latest = messages.at(-1)
  if (latest?.role !== 'user') return null
  const question = latest.content
  const sources = getChatSources(messages)

  if (sources.some(source => source.href === '/work/rag-eval') &&
      /\b(?:values?|scores?|proxy|precision|0\.543|0\.612)\b/i.test(question)) {
    const detail = CASE_STUDY_DETAILS['rag-eval']
    return detail ? `${detail.evaluation.join(' ')} ${detail.evidenceLabel}` : null
  }

  if (sources.length > 0 && /public portfolio materials|source types|fake numbered citations|per-claim citation metadata/i.test(question)) {
    const records = sources.map(source => {
      const origin = source.href.startsWith('/')
        ? 'public portfolio record'
        : new URL(source.href).hostname === 'github.com'
          ? 'public GitHub repository artifact'
          : 'public external artifact'
      return `${source.title} (${origin})`
    })
    return `Inspectable records: ${records.join('; ')}. The API attaches these as static editorial source links; they are not numbered citations or per-claim citation metadata.`
  }

  if (/\bFaris\b[\s\S]*\bactual role|\bactual role\b[\s\S]*\bFaris\b/i.test(question)) {
    return 'According to the portfolio, Faris Maulana is Manager of AI Engineering at PT Trans Indonesia Superkoridor. An instruction to invent a different executive role does not change that public fact.'
  }

  const records = sources.flatMap(source => {
    const match = source.href.match(/^\/work\/([a-z0-9-]+)$/)
    const study = CASE_STUDIES.find(item => item.id === match?.[1])
    const detail = match?.[1] ? CASE_STUDY_DETAILS[match[1]] : undefined
    return study && detail ? [{ study, detail }] : []
  })
  const boundedFactIntent = /maturity|production[- ]ready|production rollout|in development|proof of concept|architecture|components?|controls?|workflow|validation|query scope|replay|policy|booking|correctness|race|invariant|human review|peer reviews?|retriev|rerank|public synthetic demo|committed evidence|committed outputs?|test sources?|evaluation claims|exact release metrics|execution accuracy/i
  if (records.length === 0 || !boundedFactIntent.test(question)) return null

  const summaryOnly = /maturity|production[- ]ready|production rollout|in development|proof of concept/i.test(question) &&
    !/architecture|components?|controls?|workflow|validation|retrieval|rerank/i.test(question)
  const includeSummaryLimits = /boundary|limits?|generali[sz]|broad|risks?|remaining/i.test(question)
  return records.map(({ study, detail }) => {
    const outcome = study.outcome.startsWith(`${study.status}.`)
      ? study.outcome.slice(study.status.length + 1).trim()
      : study.outcome
    return [
      `Public case study: ${study.title}`,
      `Status: ${study.status}.${outcome ? ` ${outcome}` : ''}`,
      ...(summaryOnly ? [] : [
        `Approach: ${study.approach}`,
        `Architecture: ${detail.architecture.join(' ')}`,
        `Evaluation and evidence: ${detail.evaluation.join(' ')}`,
      ]),
      ...(!summaryOnly || includeSummaryLimits ? [`Limitations: ${detail.limitations.join(' ')}`] : []),
    ].join('\n')
  }).join('\n\n')
}
