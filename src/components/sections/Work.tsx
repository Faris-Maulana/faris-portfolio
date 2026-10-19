'use client'

import { useMemo, useState } from 'react'
import { ArrowUpRight, Lock, Star } from 'lucide-react'
import { GithubIcon } from '@/components/ui/Icons'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Reveal } from '@/components/ui/Reveal'
import { TiltCard } from '@/components/ui/TiltCard'
import { CASE_STUDIES, type CaseStatus } from '@/lib/constants'
import {
  GITHUB_PROFILE,
  LANGUAGE_COLOR,
  TIER_META,
  tierOf,
  type Repo,
  type Tier,
} from '@/lib/github'
import { cn } from '@/lib/utils'

const ACCENT: Record<string, string> = {
  signal: 'var(--color-signal)',
  agent: 'var(--color-agent)',
  data: 'var(--color-data)',
}

/** Status is stated plainly. A PoC labelled as a product is a lie a
 *  technical interviewer finds in one question. */
const STATUS_STYLE: Record<CaseStatus, string> = {
  'In development': 'border-signal/40 text-signal',
  'Proof of concept': 'border-cred/40 text-cred',
  Shipped: 'border-line-3 text-ink-2',
}

const TIER_ORDER: Tier[] = ['applied', 'practice', 'foundations']
const ARCHIVE_PREVIEW = 6

function prettify(name: string) {
  return name
    .replace(/[-_]+/g, ' ')
    .replace(/\bLat\b/gi, '')
    .replace(/\bLatihan\b/gi, 'Practice:')
    .replace(/\bdg\b/gi, 'with')
    .replace(/\s+/g, ' ')
    .trim()
}

function CaseStudy({ study, index }: { study: (typeof CASE_STUDIES)[number]; index: number }) {
  const color = ACCENT[study.accent] ?? 'var(--color-ink-3)'
  return (
    <Reveal delay={(index % 2) * 90} className="h-full">
      <TiltCard className="panel panel-interactive h-full p-6 sm:p-8">
        <article className="tilt-lift flex h-full flex-col">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="h-2 w-2 rounded-[2px]"
              style={{ background: color }}
              aria-hidden
            />
            <span className="text-sm font-semibold text-ink-2">{study.org}</span>
            <span className="t-meta">{study.year}</span>
            <span
              className={cn(
                'ml-auto rounded-[5px] border px-2 py-0.5 text-xs font-semibold',
                STATUS_STYLE[study.status]
              )}
            >
              {study.status}
            </span>
          </div>

          <h3 className="wide mt-6 text-2xl font-bold leading-[1.1] tracking-tight text-ink sm:text-[1.75rem]">
            {study.title}
          </h3>

          <dl className="mt-6 space-y-4 text-sm leading-relaxed">
            <div>
              <dt className="t-label">Problem</dt>
              <dd className="mt-1 text-ink-2">{study.problem}</dd>
            </div>
            <div>
              <dt className="t-label">Approach</dt>
              <dd className="mt-1 text-ink-2">{study.approach}</dd>
            </div>
            <div>
              <dt className="t-label" style={{ color }}>Outcome</dt>
              <dd className="mt-1 text-ink">{study.outcome}</dd>
            </div>
          </dl>

          <ul className="mt-auto flex flex-wrap gap-1.5 pt-7" aria-label="Stack">
            {study.stack.map(tech => (
              <li key={tech} className="chip">{tech}</li>
            ))}
          </ul>
        </article>
      </TiltCard>
    </Reveal>
  )
}

export function Work({ repos }: { repos: Repo[] }) {
  const [tier, setTier] = useState<Tier | 'all'>('applied')
  const [expanded, setExpanded] = useState(false)

  const grouped = useMemo(() => {
    const map = new Map<Tier, Repo[]>(TIER_ORDER.map(t => [t, []]))
    for (const repo of repos) map.get(tierOf(repo))!.push(repo)
    return map
  }, [repos])

  const filtered = useMemo(
    () => (tier === 'all' ? repos : (grouped.get(tier) ?? [])),
    [tier, repos, grouped]
  )
  const shown = expanded ? filtered : filtered.slice(0, ARCHIVE_PREVIEW)

  return (
    <section id="work" className="section">
      <div className="container">
        <SectionHeader
          label="Work"
          meta={`${CASE_STUDIES.length} case studies`}
          title={['Systems shipped,', <span key="2" className="text-ink-3">and what they changed.</span>]}
          lead="Most of this runs behind an air gap or an NDA, so it is described rather than linked. Each one is written as problem, approach and outcome, with its real status."
        />

        <div className="mt-14 grid gap-4 lg:mt-16 lg:grid-cols-2">
          {CASE_STUDIES.map((study, i) => (
            <CaseStudy key={study.id} study={study} index={i} />
          ))}
        </div>

        {/* ── Code archive ──────────────────────────────────────────── */}
        <div className="mt-24">
          <Reveal className="flex flex-wrap items-end justify-between gap-6 border-t border-line pt-10">
            <div>
              <h3 className="t-h3 text-ink">The code archive</h3>
              <p className="mt-2 max-w-[56ch] text-sm text-ink-2">
                Every repository on GitHub, pulled at build time and grouped by
                what it actually is.
              </p>
            </div>
            <a href={GITHUB_PROFILE} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              <GithubIcon size={15} />
              GitHub profile
              <ArrowUpRight size={14} />
            </a>
          </Reveal>

          <Reveal delay={80} className="mt-8">
            <div className="seg" role="group" aria-label="Filter repositories">
              {(['all', ...TIER_ORDER] as const).map(key => {
                const count = key === 'all' ? repos.length : (grouped.get(key)?.length ?? 0)
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={tier === key}
                    onClick={() => {
                      setTier(key)
                      setExpanded(false)
                    }}
                  >
                    {key === 'all' ? 'All' : TIER_META[key].label}
                    <span className="tnum opacity-60">{count}</span>
                  </button>
                )
              })}
            </div>
            {tier !== 'all' ? <p className="t-label mt-4">{TIER_META[tier].blurb}</p> : null}
          </Reveal>

          <ul className="mt-6">
            {shown.map(repo => {
              const dot = repo.language
                ? (LANGUAGE_COLOR[repo.language] ?? 'var(--color-ink-4)')
                : 'var(--color-ink-4)'
              // A private repo's URL 404s for every visitor, so the row stays
              // listed but is not presented as something to click.
              const Row = repo.private ? 'div' : 'a'
              const linkProps = repo.private
                ? {}
                : { href: repo.html_url, target: '_blank', rel: 'noopener noreferrer' }

              return (
                <li key={repo.name} className="border-t border-line last:border-b">
                  <Row
                    {...linkProps}
                    className={cn(
                      'group flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:gap-6',
                      !repo.private && 'transition-colors duration-300 hover:bg-white/[0.02]'
                    )}
                  >
                    <span className="flex min-w-0 flex-1 items-baseline gap-3">
                      <span
                        className="h-1.5 w-1.5 flex-none -translate-y-0.5 rounded-[2px]"
                        style={{ background: dot }}
                        aria-hidden
                      />
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              'font-semibold text-ink transition-colors',
                              !repo.private && 'group-hover:text-signal'
                            )}
                          >
                            {prettify(repo.name)}
                          </span>
                          {repo.private ? (
                            <span className="chip min-h-0 py-0 text-ink-3">
                              <Lock size={10} /> Private
                            </span>
                          ) : null}
                          {repo.fork ? <span className="chip min-h-0 py-0 text-ink-3">Fork</span> : null}
                        </span>
                        {repo.description ? (
                          <span className="mt-1 block max-w-[72ch] text-sm text-ink-3">
                            {/* Repo descriptions come from GitHub as written; dashes are
                                normalised to match the site's copy rules. */}
                            {repo.description.replace(/\s*[\u2014\u2013]\s*/g, ', ')}
                          </span>
                        ) : null}
                      </span>
                    </span>

                    <span className="flex flex-none items-center gap-5 pl-[18px] sm:pl-0">
                      {repo.stargazers_count > 0 ? (
                        <span className="t-meta flex items-center gap-1">
                          <Star size={11} /> {repo.stargazers_count}
                        </span>
                      ) : null}
                      <span className="t-meta w-28 truncate">{repo.language ?? ''}</span>
                      <span className="t-meta w-12 text-right">{repo.pushed_at.slice(0, 4)}</span>
                      {repo.private ? (
                        <span className="w-3.5" aria-hidden />
                      ) : (
                        <ArrowUpRight
                          size={14}
                          className="text-ink-4 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-signal"
                        />
                      )}
                    </span>
                  </Row>
                </li>
              )
            })}
          </ul>

          {filtered.length > ARCHIVE_PREVIEW ? (
            <button
              type="button"
              onClick={() => setExpanded(v => !v)}
              aria-expanded={expanded}
              className="btn btn-ghost mt-6"
            >
              {expanded ? 'Show fewer' : `Show all ${filtered.length}`}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  )
}
