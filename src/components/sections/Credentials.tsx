'use client'

import { useState } from 'react'
import { ArrowUpRight, FileText, ShieldCheck } from 'lucide-react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Reveal } from '@/components/ui/Reveal'
import {
  CREDENTIALS,
  CREDENTIAL_TRACKS,
  TRACK_META,
  isExpired,
  type Credential,
  type CredentialTrack,
} from '@/lib/credentials'
import { cn } from '@/lib/utils'

type Filter = 'all' | CredentialTrack

const FEATURED = CREDENTIALS.filter(c => c.featured)
const LEDGER = CREDENTIALS.filter(c => !c.featured)
const COUNTS = new Map<Filter, number>([
  ['all', LEDGER.length],
  ...CREDENTIAL_TRACKS.map(t => [t, LEDGER.filter(c => c.track === t).length] as [Filter, number]),
])

function Evidence({ c }: { c: Credential }) {
  return (
    <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-5">
      {c.verify ? (
        <a
          href={c.verify}
          target="_blank"
          rel="noopener noreferrer"
          className="group/v inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-signal"
        >
          <ShieldCheck size={14} aria-hidden />
          Verify
          <ArrowUpRight size={13} className="transition-transform group-hover/v:-translate-y-0.5 group-hover/v:translate-x-0.5" aria-hidden />
          <span className="sr-only">{c.title} with {c.issuer}</span>
        </a>
      ) : null}
      {c.file ? (
        <a
          href={c.file}
          target="_blank"
          rel="noopener noreferrer"
          className="group/d inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-ink-2 transition-colors hover:text-ink"
        >
          <FileText size={14} aria-hidden />
          Document
          <span className="sr-only">for {c.title}</span>
        </a>
      ) : null}
    </div>
  )
}

function Validity({ c }: { c: Credential }) {
  if (!c.expires) return null
  const [y, m] = c.expires.split('-').map(Number)
  const label = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' }).format(
    new Date(y, m - 1, 1)
  )
  return isExpired(c.expires) ? (
    <span className="text-xs font-semibold text-ink-3">Expired {label}</span>
  ) : (
    <span className="text-xs font-semibold text-signal">Valid to {label}</span>
  )
}

export function Credentials() {
  const [filter, setFilter] = useState<Filter>('all')

  // Twenty items. Filtering on every render is cheaper than memoising.
  const rest = LEDGER.filter(c => filter === 'all' || c.track === filter)

  return (
    <section id="credentials" className="section">
      <div className="container">
        <SectionHeader
          label="Credentials"
          meta={`${CREDENTIALS.length} on file`}
          title={['Verified,', <span key="2" className="text-ink-3">not asserted.</span>]}
          lead="Every entry links to a public verification page or the document itself. Expiry dates are shown as they stand today, including the ones that have lapsed."
        />

        {/* ── Featured ─────────────────────────────────────────────── */}
        <div className="mt-14 grid gap-4 md:grid-cols-3 lg:mt-16">
          {FEATURED.map((c, i) => (
            <Reveal key={c.title} delay={i * 80} className="panel ticks flex flex-col p-6 sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold" style={{ color: TRACK_META[c.track].color }}>
                  {c.kind}
                </span>
                <span className="t-meta">{c.issued}</span>
              </div>
              <h3 className="wide mt-5 text-lg font-bold leading-snug tracking-tight text-ink">{c.title}</h3>
              <p className="mt-1.5 text-sm text-ink-2">{c.issuer}</p>
              {c.note ? <p className="mt-3 text-sm leading-relaxed text-ink-3">{c.note}</p> : null}
              {c.credentialId ? (
                <p className="t-meta mt-3 break-all">ID {c.credentialId}</p>
              ) : null}
              <div className="mt-2"><Validity c={c} /></div>
              <Evidence c={c} />
            </Reveal>
          ))}
        </div>

        {/* ── Ledger ───────────────────────────────────────────────── */}
        <Reveal delay={80} className="mt-14">
          <div className="seg" role="group" aria-label="Filter credentials">
            {(['all', ...CREDENTIAL_TRACKS] as Filter[]).map(t => (
              <button
                key={t}
                type="button"
                aria-pressed={filter === t}
                onClick={() => setFilter(t)}
              >
                {t === 'all' ? 'All' : TRACK_META[t].label}
                <span className="tnum opacity-60">{COUNTS.get(t)}</span>
              </button>
            ))}
          </div>
        </Reveal>

        <ul className="mt-6 grid gap-x-8 md:grid-cols-2">
          {rest.map(c => (
            <li
              key={c.title}
              className={cn('flex flex-col gap-1 border-t border-line py-5 sm:flex-row sm:items-center sm:gap-6')}
            >
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2.5">
                  <span
                    className="h-1.5 w-1.5 flex-none rounded-[2px]"
                    style={{ background: TRACK_META[c.track].color }}
                    aria-hidden
                  />
                  <span className="font-semibold text-ink">{c.title}</span>
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 pl-4 text-sm text-ink-3">
                  <span>{c.issuer}</span>
                  <span className="t-meta">{c.kind}, {c.issued}</span>
                  <Validity c={c} />
                </span>
              </span>
              <span className="flex flex-none items-center gap-4 pl-4 sm:pl-0 [&>div]:mt-0 [&>div]:pt-0">
                <Evidence c={c} />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
