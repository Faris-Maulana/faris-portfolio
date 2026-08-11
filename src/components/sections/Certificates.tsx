'use client'

import { useMemo, useState } from 'react'
import { ArrowUpRight, FileText } from 'lucide-react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Reveal } from '@/components/ui/Reveal'
import {
  CREDENTIALS,
  CREDENTIAL_TRACKS,
  TRACK_META,
  type CredentialTrack,
} from '@/lib/credentials'
import { cn } from '@/lib/utils'

type Filter = 'all' | CredentialTrack

export function Certificates() {
  const [filter, setFilter] = useState<Filter>('all')

  const shown = useMemo(
    () =>
      filter === 'all'
        ? CREDENTIALS
        : CREDENTIALS.filter(c => c.track === filter),
    [filter]
  )

  const counts = useMemo(() => {
    const map = new Map<Filter, number>([['all', CREDENTIALS.length]])
    for (const track of CREDENTIAL_TRACKS) {
      map.set(track, CREDENTIALS.filter(c => c.track === track).length)
    }
    return map
  }, [])

  return (
    <section id="certificates" className="section">
      <div className="container">
        <SectionHeader
          index="06"
          label="Credentials"
          meta={`${CREDENTIALS.length} on file`}
          title={['Verified,', <span key="2" className="text-ink-3">not asserted.</span>]}
          lead="Certifications, competency standards, and research affiliations. Where a document exists it is linked directly. No verification portal, no expiring signed URL."
        />

        {/* ── Track filter ──────────────────────────────────────────── */}
        <Reveal delay={100} className="mt-12 flex flex-wrap gap-2">
          {(['all', ...CREDENTIAL_TRACKS] as Filter[]).map(track => {
            const isActive = filter === track
            const label = track === 'all' ? 'All' : TRACK_META[track].label
            return (
              <button
                key={track}
                onClick={() => setFilter(track)}
                data-cursor="hover"
                aria-pressed={isActive}
                className={cn(
                  'inline-flex min-h-11 items-center rounded-full border px-4 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors duration-300',
                  isActive
                    ? 'border-transparent bg-ink text-canvas'
                    : 'border-line-2 text-ink-3 hover:border-line-3 hover:text-ink'
                )}
              >
                {label}
                <span className="ml-2 tabular-nums opacity-50">
                  {counts.get(track)}
                </span>
              </button>
            )
          })}
        </Reveal>

        {/* ── Grid ──────────────────────────────────────────────────── */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((cert, i) => {
            const meta = TRACK_META[cert.track]
            const href = cert.file ?? cert.href
            const Tag = href ? 'a' : 'div'

            return (
              <Reveal
                key={cert.title}
                delay={Math.min(i, 8) * 55}
                className={cn(cert.featured && 'sm:col-span-2 lg:col-span-1')}
              >
                <Tag
                  {...(href
                    ? {
                        href,
                        target: '_blank',
                        rel: 'noopener noreferrer',
                        'data-cursor': 'hover',
                      }
                    : {})}
                  className={cn(
                    'panel panel-interactive group flex h-full flex-col p-5',
                    href && 'cursor-pointer'
                  )}
                >
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <span
                      className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em]"
                      style={{ color: meta.color }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: meta.color }}
                        aria-hidden
                      />
                      {meta.label}
                    </span>
                    <span className="t-label tnum">{cert.year}</span>
                  </div>

                  <h3 className="font-display text-base font-bold leading-snug text-ink">
                    {cert.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-ink-3">{cert.issuer}</p>

                  {cert.note ? (
                    <p className="mt-3 text-xs leading-relaxed text-ink-3">
                      {cert.note}
                    </p>
                  ) : null}

                  <div className="mt-auto flex items-center gap-1.5 pt-5">
                    {href ? (
                      <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-2 transition-colors group-hover:text-signal">
                        <FileText size={12} />
                        View document
                        <ArrowUpRight
                          size={12}
                          className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                      </span>
                    ) : (
                      <span className="t-label">On record</span>
                    )}
                  </div>
                </Tag>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
