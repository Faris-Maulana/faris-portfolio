'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, CheckCircle2, FlaskConical, Hammer, Library } from 'lucide-react'
import type { CASE_STUDIES, CaseStatus } from '@/lib/constants'
import {
  DATA_EXPOSURE_LABELS,
  EVIDENCE_LEVEL_LABELS,
  matchesEvidenceFilter,
  type EvidenceFilter,
  type ProjectEvidence,
} from '@/lib/evidence'
import { TiltCard } from '@/components/ui/TiltCard'

type CaseStudy = (typeof CASE_STUDIES)[number]

const STATUS: Record<CaseStatus, { icon: typeof Hammer; className: string }> = {
  'In development': { icon: Hammer, className: 'text-signal border-signal/40' },
  'Proof of concept': { icon: FlaskConical, className: 'text-cred border-cred/40' },
  'Public reference': { icon: Library, className: 'text-agent border-agent/40' },
  'Internally deployed': { icon: CheckCircle2, className: 'text-data border-data/40' },
}

const FILTERS: readonly { id: EvidenceFilter; label: string }[] = [
  { id: 'all', label: 'All cases' },
  { id: 'interactive', label: 'Interactive runs' },
  { id: 'test-artifacts', label: 'Test and result artifacts' },
  { id: 'private-boundary', label: 'Private-data boundaries' },
]

export function CaseStudyExplorer({ studies, evidence }: {
  readonly studies: readonly CaseStudy[]
  readonly evidence: readonly ProjectEvidence[]
}) {
  const [filter, setFilter] = useState<EvidenceFilter>('all')
  const records = studies.flatMap(study => {
    const record = evidence.find(item => item.id === study.id)
    return record ? [{ study, record }] : []
  })
  const visible = records.filter(({ record }) => matchesEvidenceFilter(record, filter))

  return (
    <div className="case-index">
      <div className="case-index-controls">
        <div>
          <p className="t-meta text-agent">Supporting systems / browse by proof</p>
          <h3>Evidence index</h3>
          <p className="mt-2 max-w-sm text-sm text-ink-2">Choose what you need to verify. Maturity and data exposure remain explicit.</p>
        </div>
        <div>
          <div className="seg w-full lg:justify-end" role="group" aria-label="Filter supporting case studies by evidence type">
            {FILTERS.map(option => (
              <button key={option.id} type="button" aria-pressed={filter === option.id} onClick={() => setFilter(option.id)}>
                {option.label}
                <span className="seg-count" aria-hidden>{records.filter(({ record }) => matchesEvidenceFilter(record, option.id)).length}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-ink-3 lg:text-right" role="status" aria-live="polite">
            Showing {visible.length} of {records.length} supporting cases. The SIMPUL flagship remains above.
          </p>
        </div>
      </div>

      {visible.length > 0 ? (
        <div className="case-index-results bento-grid">
          {visible.map(({ study, record }, index) => {
            const StatusIcon = STATUS[study.status].icon
            return (
              <TiltCard key={study.id} className={`case-index-row case-card case-card-${index % 4}`} max={1.7}>
                <article id={study.id} className="case-card-inner scroll-mt-28" data-accent={study.accent}>
                  <div className="case-card-head">
                    <span className="t-meta">{study.year} / {study.org}</span>
                    <span className={`status-badge ${STATUS[study.status].className}`}><StatusIcon size={12} aria-hidden />{study.status}</span>
                  </div>
                  <p className="case-card-coordinate t-meta" aria-hidden>CS / {String(studies.findIndex(item => item.id === study.id) + 2).padStart(2, '0')}</p>
                  <h4>{study.title}</h4>
                  <p className="case-card-problem">{study.problem}</p>
                  <div className="case-card-proof">
                    <span>{EVIDENCE_LEVEL_LABELS[record.evidenceLevel]}</span>
                    <span>{record.artifacts.length} recorded {record.artifacts.length === 1 ? 'artifact' : 'artifacts'}</span>
                    <span>Data: {DATA_EXPOSURE_LABELS[record.dataExposure]}</span>
                  </div>
                  <Link href={`/work/${study.id}`} className="case-card-link">Inspect evidence and limits <ArrowUpRight size={16} aria-hidden /></Link>
                </article>
              </TiltCard>
            )
          })}
        </div>
      ) : (
        <div className="border-y border-line py-10">
          <p className="text-ink-2">No supporting case matches this evidence view.</p>
          <button type="button" className="btn btn-ghost mt-5" onClick={() => setFilter('all')}>Show all cases</button>
        </div>
      )}
    </div>
  )
}
