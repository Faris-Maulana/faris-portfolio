'use client'

import { useMemo, useState } from 'react'
import { ArrowUpRight, Lock, Star } from 'lucide-react'
import { GithubIcon } from '@/components/ui/Icons'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Reveal } from '@/components/ui/Reveal'
import { FALLBACK_PROJECTS } from '@/lib/constants'
import {
  GITHUB_PROFILE,
  LANGUAGE_COLOR,
  TIER_META,
  tierOf,
  type Repo,
  type Tier,
} from '@/lib/github'
import { cn } from '@/lib/utils'

const CATEGORY_COLOR: Record<string, string> = {
  'LLM/AI': 'var(--color-agent)',
  'Data Engineering': 'var(--color-data)',
  Security: 'var(--color-threat)',
  'Full Stack': 'var(--color-signal)',
}

const TIER_ORDER: Tier[] = ['applied', 'practice', 'foundations']

function prettify(name: string) {
  return name
    .replace(/[-_]+/g, ' ')
    .replace(/\bLat\b/gi, '')
    .replace(/\bLatihan\b/gi, 'Practice:')
    .replace(/\bdg\b/gi, 'with')
    .replace(/\s+/g, ' ')
    .trim()
}

export function Projects({ repos }: { repos: Repo[] }) {
  const [tier, setTier] = useState<Tier | 'all'>('applied')

  const grouped = useMemo(() => {
    const map = new Map<Tier, Repo[]>(TIER_ORDER.map(t => [t, []]))
    for (const repo of repos) map.get(tierOf(repo))!.push(repo)
    return map
  }, [repos])

  const shown = useMemo(
    () => (tier === 'all' ? repos : (grouped.get(tier) ?? [])),
    [tier, repos, grouped]
  )

  return (
    <section id="projects" className="section">
      <div className="container">
        <SectionHeader
          index="03"
          label="Work"
          meta={`${repos.length} public repos`}
          title={['What shipped,', <span key="2" className="text-ink-3">and what it moved.</span>]}
          lead="Selected professional systems come first. Most of them live behind an air gap or an NDA, so they are described rather than linked. The full public GitHub archive follows underneath."
        />

        {/* ── Selected work ───────────────────────────────────────────── */}
        <div className="mt-14 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {FALLBACK_PROJECTS.map((project, i) => {
            const color = CATEGORY_COLOR[project.category] ?? 'var(--color-ink-3)'
            return (
              <Reveal
                key={project.id}
                delay={Math.min(i, 6) * 60}
                className="panel panel-interactive group flex flex-col p-6"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <span
                    className="font-mono text-[11px] uppercase tracking-[0.18em]"
                    style={{ color }}
                  >
                    {project.category}
                  </span>
                  <span className="t-label tnum">{project.year}</span>
                </div>

                <h3 className="font-display text-lg font-bold leading-tight tracking-tight text-ink">
                  {project.title}
                </h3>
                <p className="mt-1.5 text-sm text-ink-2">{project.tagline}</p>
                <p className="mt-4 text-[13px] leading-relaxed text-ink-3">
                  {project.description}
                </p>

                <ul className="mt-5 flex flex-wrap gap-1.5">
                  {project.stack.map(tech => (
                    <li
                      key={tech}
                      className="rounded-md border border-line px-2 py-0.5 font-mono text-[11px] text-ink-3"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto flex items-center gap-1.5 pt-6">
                  <Lock size={11} className="text-ink-4" aria-hidden />
                  <span className="t-label">Private / client-owned</span>
                </div>
              </Reveal>
            )
          })}
        </div>

        {/* ── GitHub archive ──────────────────────────────────────────── */}
        <div className="mt-24">
          <Reveal className="flex flex-wrap items-end justify-between gap-6 border-t border-line pt-10">
            <div>
              <span className="t-label mb-3 block">Open source archive</span>
              <h3 className="t-h3 text-ink">
                Every public repository, {new Date().getFullYear() - 2020} years
                deep.
              </h3>
              <p className="mt-3 max-w-[52ch] text-sm text-ink-3">
                Pulled live from GitHub and grouped by what each repo actually
                is: production tools, machine learning practice, and the
                coursework it started from.
              </p>
            </div>
            <a
              href={GITHUB_PROFILE}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="hover"
              className="btn btn-ghost"
            >
              <GithubIcon size={14} />
              View profile
              <ArrowUpRight size={13} />
            </a>
          </Reveal>

          <Reveal delay={80} className="mt-8 flex flex-wrap gap-2">
            {(['all', ...TIER_ORDER] as const).map(key => {
              const isActive = tier === key
              const count =
                key === 'all' ? repos.length : (grouped.get(key)?.length ?? 0)
              return (
                <button
                  key={key}
                  onClick={() => setTier(key)}
                  data-cursor="hover"
                  aria-pressed={isActive}
                  className={cn(
                    'inline-flex min-h-11 items-center rounded-full border px-4 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors duration-300',
                    isActive
                      ? 'border-transparent bg-ink text-canvas'
                      : 'border-line-2 text-ink-3 hover:border-line-3 hover:text-ink'
                  )}
                >
                  {key === 'all' ? 'All' : TIER_META[key].label}
                  <span className="ml-2 tabular-nums opacity-50">{count}</span>
                </button>
              )
            })}
          </Reveal>

          {tier !== 'all' ? (
            <p className="t-label mt-5">{TIER_META[tier].blurb}</p>
          ) : null}

          <ul className="mt-6">
            {shown.map((repo, i) => {
              const dot = repo.language
                ? (LANGUAGE_COLOR[repo.language] ?? 'var(--color-ink-4)')
                : 'var(--color-ink-4)'

              // A private repo's URL 404s for every visitor, so the row stays
              // listed but is not presented as something to click.
              const Row = repo.private ? 'div' : 'a'
              const linkProps = repo.private
                ? {}
                : {
                    href: repo.html_url,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    'data-cursor': 'hover',
                  }

              return (
                <Reveal
                  as="li"
                  key={repo.name}
                  delay={Math.min(i, 10) * 35}
                  className="border-t border-line last:border-b"
                >
                  <Row
                    {...linkProps}
                    className={cn(
                      'group flex flex-col gap-2 py-5 transition-colors duration-300 sm:flex-row sm:items-center sm:gap-6',
                      !repo.private && 'hover:bg-white/[0.015]'
                    )}
                  >
                    <span className="flex min-w-0 flex-1 items-baseline gap-3">
                      <span
                        className="h-1.5 w-1.5 flex-none translate-y-[-2px] rounded-full"
                        style={{ background: dot }}
                        aria-hidden
                      />
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              'font-display text-base font-bold tracking-tight text-ink transition-colors',
                              !repo.private && 'group-hover:text-signal'
                            )}
                          >
                            {prettify(repo.name)}
                          </span>
                          {repo.private ? (
                            <span className="flex items-center gap-1 rounded border border-line px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-4">
                              <Lock size={9} /> Private
                            </span>
                          ) : null}
                          {repo.fork ? (
                            <span className="rounded border border-line px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-4">
                              Fork
                            </span>
                          ) : null}
                        </span>
                        {repo.description ? (
                          <span className="mt-1 block max-w-[70ch] text-sm text-ink-3">
                            {repo.description}
                          </span>
                        ) : null}
                      </span>
                    </span>

                    <span className="flex flex-none items-center gap-5 pl-[18px] sm:pl-0">
                      {repo.stargazers_count > 0 ? (
                        <span className="t-label flex items-center gap-1">
                          <Star size={11} /> {repo.stargazers_count}
                        </span>
                      ) : null}
                      {repo.language ? (
                        <span className="t-label w-28 truncate">
                          {repo.language}
                        </span>
                      ) : (
                        <span className="w-28" aria-hidden />
                      )}
                      <span className="t-label tnum w-16 text-right">
                        {repo.pushed_at.slice(0, 4)}
                      </span>
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
                </Reveal>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
