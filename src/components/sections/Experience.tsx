'use client'

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

const STATUS_COPY: Record<string, string> = {
  active: 'Active',
  completed: 'Completed',
  archived: 'Archived',
}

export function Experience() {
  return (
    <section id="experience" className="section">
      <div className="container">
        <SectionHeader
          index="02"
          label="Experience"
          meta={`${EXPERIENCES.length} roles`}
          title={['Five years,', <span key="2" className="text-ink-3">five industries.</span>]}
          lead="Telco, maritime, healthcare research, education, and Web3 security. Different domains, one throughline: taking a system nobody had modelled and making it answerable."
        />

        <ol className="mt-16 lg:mt-20">
          {EXPERIENCES.map((exp, i) => {
            const color = ACCENT[exp.accent] ?? 'var(--color-ink-3)'
            const isActive = exp.status === 'active'

            return (
              <Reveal
                as="li"
                key={`${exp.company}-${exp.role}`}
                delay={Math.min(i, 4) * 70}
                className="group border-t border-line py-10 last:border-b lg:py-12"
              >
                <div className="grid gap-6 lg:grid-cols-12 lg:gap-10">
                  {/* ── Meta rail ─────────────────────────────────────── */}
                  <div className="lg:col-span-4">
                    <div className="lg:sticky lg:top-28">
                      <div className="mb-4 flex items-center gap-3">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{
                            background: isActive ? color : 'transparent',
                            border: `1px solid ${color}`,
                            boxShadow: isActive ? `0 0 10px ${color}` : 'none',
                          }}
                          aria-hidden
                        />
                        <span
                          className="font-mono text-[11px] uppercase tracking-[0.2em]"
                          style={{ color: isActive ? color : 'var(--color-ink-4)' }}
                        >
                          {STATUS_COPY[exp.status] ?? exp.status}
                        </span>
                        <span className="t-label tnum ml-auto lg:ml-0">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </div>

                      <h3 className="font-display text-xl font-extrabold leading-tight tracking-tight text-ink">
                        {exp.company}
                      </h3>
                      <p className="t-mono mt-2 text-ink-3">{exp.period}</p>
                    </div>
                  </div>

                  {/* ── Detail ────────────────────────────────────────── */}
                  <div className="lg:col-span-8">
                    <p
                      className="font-display text-lg font-bold tracking-tight"
                      style={{ color }}
                    >
                      {exp.role}
                    </p>

                    <p className="t-body mt-3 max-w-[62ch] text-[15px]">
                      {exp.summary}
                    </p>

                    <ul className="mt-6 space-y-3">
                      {exp.bullets.map(bullet => (
                        <li
                          key={bullet}
                          className="flex gap-3 text-sm leading-relaxed text-ink-2"
                        >
                          <span
                            className="mt-[9px] h-px w-3 flex-none"
                            style={{ background: color, opacity: 0.6 }}
                            aria-hidden
                          />
                          <span className="min-w-0">{bullet}</span>
                        </li>
                      ))}
                    </ul>

                    <ul className="mt-7 flex flex-wrap gap-1.5">
                      {exp.stack.map(tech => (
                        <li
                          key={tech}
                          className="rounded-md border border-line px-2.5 py-1 font-mono text-[11px] text-ink-3 transition-colors duration-300 group-hover:border-line-2"
                        >
                          {tech}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
