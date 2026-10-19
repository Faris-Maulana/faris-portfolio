'use client'

import { Plus } from 'lucide-react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Reveal } from '@/components/ui/Reveal'
import { EXPERIENCES } from '@/lib/constants'

const ACCENT: Record<string, string> = {
  signal: 'var(--color-signal)',
  agent: 'var(--color-agent)',
  data: 'var(--color-data)',
  cred: 'var(--color-cred)',
  threat: 'var(--color-threat)',
}

/** Bullets shown before the disclosure. Enough to judge scope at a glance. */
const VISIBLE = 3

export function Experience() {
  return (
    <section id="experience" className="section">
      <div className="container">
        <SectionHeader
          label="Experience"
          meta={`${EXPERIENCES.length} roles`}
          title={['Five years,', <span key="2" className="text-ink-3">five industries.</span>]}
          lead="Telco, maritime, healthcare research, education and Web3 security. Different domains, one throughline: taking a system nobody had modelled and making it answerable."
        />

        <ol className="relative mt-14 lg:mt-16">
          {/* The timeline spine. */}
          <span
            className="absolute bottom-0 left-[5px] top-2 w-px bg-line-2 lg:left-[calc(33.333%+5px)]"
            aria-hidden
          />

          {EXPERIENCES.map((exp, i) => {
            const color = ACCENT[exp.accent] ?? 'var(--color-ink-3)'
            const isActive = exp.status === 'active'
            const rest = exp.bullets.slice(VISIBLE)

            return (
              <Reveal
                as="li"
                key={`${exp.company}-${exp.role}`}
                delay={Math.min(i, 3) * 60}
                className="relative grid gap-3 pb-12 pl-8 last:pb-0 lg:grid-cols-3 lg:gap-0 lg:pl-0"
              >
                {/* Meta column */}
                <div className="lg:pr-10 lg:text-right">
                  <p className="t-meta">{exp.period}</p>
                  <p className="mt-1 font-semibold text-ink">{exp.company}</p>
                </div>

                {/* Node on the spine */}
                <span
                  className="absolute left-0 top-1.5 h-[11px] w-[11px] rounded-[3px] border lg:left-[33.333%]"
                  style={{
                    borderColor: color,
                    background: isActive ? color : 'var(--color-canvas)',
                    boxShadow: isActive ? `0 0 14px ${color}` : 'none',
                  }}
                  aria-hidden
                />

                <div className="lg:col-span-2 lg:pl-10">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="wide text-xl font-bold tracking-tight text-ink">{exp.role}</h3>
                    {isActive ? (
                      <span className="text-xs font-semibold" style={{ color }}>Current</span>
                    ) : null}
                  </div>
                  <p className="t-body mt-2 max-w-[64ch]">{exp.summary}</p>

                  <ul className="mt-4 space-y-2.5">
                    {exp.bullets.slice(0, VISIBLE).map(b => (
                      <li key={b} className="flex gap-3 text-sm leading-relaxed text-ink-2">
                        <span className="mt-[9px] h-px w-3 flex-none" style={{ background: color }} aria-hidden />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  {rest.length > 0 ? (
                    <details className="group mt-3">
                      <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-semibold text-ink-3 transition-colors hover:text-ink [&::-webkit-details-marker]:hidden">
                        <Plus size={14} className="transition-transform duration-300 group-open:rotate-45" aria-hidden />
                        <span className="group-open:hidden">{rest.length} more</span>
                        <span className="hidden group-open:inline">Less</span>
                      </summary>
                      <ul className="mt-2 space-y-2.5">
                        {rest.map(b => (
                          <li key={b} className="flex gap-3 text-sm leading-relaxed text-ink-2">
                            <span className="mt-[9px] h-px w-3 flex-none" style={{ background: color }} aria-hidden />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </details>
                  ) : null}

                  <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Stack">
                    {exp.stack.map(tech => (
                      <li key={tech} className="chip">{tech}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
