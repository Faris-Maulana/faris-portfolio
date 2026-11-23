'use client'

import { useState } from 'react'
import { ArrowUpRight, FileText, ShieldCheck } from 'lucide-react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Reveal } from '@/components/ui/Reveal'
import { CREDENTIALS, CREDENTIAL_TRACKS, TRACK_META, isExpired, type Credential, type CredentialTrack } from '@/lib/credentials'
import { EDUCATION } from '@/lib/constants'

type Filter = 'all' | CredentialTrack
const FEATURED = CREDENTIALS.filter(c => c.featured)
const LEDGER = CREDENTIALS.filter(c => !c.featured)

function Evidence({ credential }: { credential: Credential }) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      {credential.verify ? <a href={credential.verify} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-signal"><ShieldCheck size={14} aria-hidden />Verify<ArrowUpRight size={13} aria-hidden /><span className="sr-only"> {credential.title} with {credential.issuer} (opens in a new tab)</span></a> : null}
      {credential.file ? <a href={credential.file} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-ink-2 hover:text-ink"><FileText size={14} aria-hidden />Document<span className="sr-only"> for {credential.title} (opens in a new tab)</span></a> : null}
    </div>
  )
}

function Validity({ credential }: { credential: Credential }) {
  if (!credential.expires) return null
  const [year, month] = credential.expires.split('-').map(Number)
  const label = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' }).format(new Date(year, month - 1, 1))
  return <span className={`text-xs font-semibold ${isExpired(credential.expires) ? 'text-ink-3' : 'text-signal'}`}>{isExpired(credential.expires) ? `Expired ${label}` : `Valid to ${label}`}</span>
}

export function Credentials() {
  const [filter, setFilter] = useState<Filter>('all')
  const results = LEDGER.filter(c => filter === 'all' || c.track === filter)

  return (
    <section id="credentials" className="section section-mineral">
      <div className="container">
        <SectionHeader
          label="Credential evidence"
          meta={`${CREDENTIALS.length} records on file`}
          title={['Documents first.', <span key="2" className="text-ink-3">Claims second.</span>]}
          lead="Every entry links to an issuer verification page or the document itself. Expiry is shown plainly, including lapsed credentials."
        />

        <div className="mt-14 grid border-y border-line lg:grid-cols-12">
          {FEATURED.map((credential, index) => (
            <Reveal key={credential.title} delay={index * 60} className="flex flex-col border-b border-line p-6 last:border-b-0 lg:col-span-4 lg:border-b-0 lg:border-r lg:p-8 lg:last:border-r-0">
              <div className="flex items-center justify-between gap-3"><span className="t-meta text-signal">{credential.kind}</span><span className="t-meta">{credential.issued}</span></div>
              <h3 className="mt-5 font-display text-xl font-semibold leading-snug text-ink">{credential.title}</h3>
              <p className="mt-2 text-sm text-ink-2">{credential.issuer}</p>
              {credential.note ? <p className="mt-4 text-sm text-ink-3">{credential.note}</p> : null}
              {credential.credentialId ? <p className="t-meta mt-4 break-all">ID {credential.credentialId}</p> : null}
              <div className="mb-5 mt-3"><Validity credential={credential} /></div>
              <div className="mt-auto"><Evidence credential={credential} /></div>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="seg" role="group" aria-label="Filter credentials">
            {(['all', ...CREDENTIAL_TRACKS] as Filter[]).map(track => {
              const count = track === 'all' ? LEDGER.length : LEDGER.filter(c => c.track === track).length
              return <button key={track} type="button" aria-pressed={filter === track} aria-controls="credential-results" onClick={() => setFilter(track)}>{track === 'all' ? 'All' : TRACK_META[track].label}<span className="seg-count">{count}</span></button>
            })}
          </div>
          <p className="t-meta" role="status" aria-live="polite">Showing {results.length} additional records</p>
        </div>

        <ul id="credential-results" className="mt-6 grid gap-x-8 md:grid-cols-2">
          {results.map(credential => (
            <li key={credential.title} className="flex flex-col gap-2 border-t border-line py-5 sm:flex-row sm:items-center sm:gap-5">
              <span className="min-w-0 flex-1"><span className="block font-semibold text-ink">{credential.title}</span><span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-3"><span>{credential.issuer}</span><span className="t-meta">{credential.kind}, {credential.issued}</span><Validity credential={credential} /></span></span>
              <span className="flex-none"><Evidence credential={credential} /></span>
            </li>
          ))}
        </ul>

        <Reveal className="mt-12 grid gap-5 border-l-2 border-data pl-5 md:grid-cols-3">
          <div><p className="t-meta text-data">Education</p><h3 className="mt-2 font-display text-lg font-semibold">{EDUCATION.degree}</h3></div>
          <p className="text-sm text-ink-2">{EDUCATION.school}<br />{EDUCATION.graduated}<br />{EDUCATION.honors}</p>
          <p className="text-sm text-ink-2">Thesis: {EDUCATION.thesis}</p>
        </Reveal>
      </div>
    </section>
  )
}
