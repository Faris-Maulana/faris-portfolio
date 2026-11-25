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
    <div className="case-index mt-14">
      <div className="grid gap-6 border-y border-line py-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-4">
          <h3 className="font-display text-2xl font-semibold text-ink">Evidence index</h3>
          <p className="mt-2 max-w-sm text-sm text-ink-2">Choose what you need to verify. Maturity and data exposure remain explicit.</p>
        </div>
        <div className="lg:col-span-8">
          <div className="seg w-full lg:justify-end" role="group" aria-label="Filter supporting case studies by evidence type">
            {FILTERS.map(option => (
              <button
                key={option.id}
                type="button"
                aria-pressed={filter === option.id}
                onClick={() => setFilter(option.id)}
              >
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

      {visible.length > 0 ? visible.map(({ study, record }) => {
        const StatusIcon = STATUS[study.status].icon
        return (
          <article key={study.id} className="case-index-row group grid gap-6 border-b border-line py-8 lg:grid-cols-12 lg:items-center lg:py-10" id={study.id}>
            <div className="flex flex-wrap items-center gap-3 lg:col-span-3 lg:block">
              <span className="t-meta text-ink-3 lg:block">{study.year} / supporting system</span>
              <span className={`inline-flex items-center gap-2 border px-2 py-1 font-body text-xs lg:mt-4 ${STATUS[study.status].className}`}><StatusIcon size={12} aria-hidden />{study.status}</span>
              <span className="t-meta mt-0 block w-full lg:mt-4">{EVIDENCE_LEVEL_LABELS[record.evidenceLevel]} / {record.artifacts.length} recorded {record.artifacts.length === 1 ? 'artifact' : 'artifacts'}</span>
              <span className="mt-1 block w-full text-xs text-ink-3 lg:mt-2">Data exposure: {DATA_EXPOSURE_LABELS[record.dataExposure]}</span>
            </div>
            <div className="lg:col-span-6">
              <p className="t-meta mb-2">{study.org}</p>
              <h4 className="t-h3">{study.title}</h4>
              <p className="t-body mt-3 max-w-2xl text-base">{study.problem}</p>
            </div>
            <div className="lg:col-span-3 lg:text-right">
              <Link href={`/work/${study.id}`} className="link-draw inline-flex items-center gap-2 text-sm font-semibold">Inspect evidence and limits <ArrowUpRight size={16} aria-hidden /></Link>
            </div>
          </article>
        )
      }) : (
        <div className="border-b border-line py-10">
          <p className="text-ink-2">No supporting case matches this evidence view.</p>
          <button type="button" className="btn btn-ghost mt-5" onClick={() => setFilter('all')}>Show all cases</button>
        </div>
      )}
    </div>
  )
}
