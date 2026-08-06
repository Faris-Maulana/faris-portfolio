'use client'

import { SectionHeader } from '@/components/ui/SectionHeader'
import { Reveal } from '@/components/ui/Reveal'
import { SKILLS } from '@/lib/constants'

const ACCENT: Record<string, string> = {
  signal: 'var(--color-signal)',
  agent: 'var(--color-agent)',
  data: 'var(--color-data)',
  cred: 'var(--color-cred)',
  threat: 'var(--color-threat)',
}

/**
 * A matrix rather than a force-directed graph.
 *
 * The old constellation view pulled in d3-force for a visual that said less
 * than a plain list: node positions carried no meaning, labels overlapped at
 * small sizes, and it duplicated the network motif the hero already owns.
 * A scannable matrix answers the actual question, what can this person do, * and drops the dependency from the bundle.
 */
export function Skills() {
  const total = SKILLS.reduce((sum, group) => sum + group.items.length, 0)

  return (
    <section id="skills" className="section">
      <div className="container">
        <SectionHeader
          index="04"
          label="Capabilities"
          meta={`${total} tracked`}
          title={['The stack,', <span key="2" className="text-ink-3">end to end.</span>]}
          lead="Grouped by what it is actually used for. Everything here has shipped to production or to a client deliverable."
        />

        <div className="mt-14 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {SKILLS.map((group, i) => {
            const color = ACCENT[group.accent] ?? 'var(--color-ink-3)'
            return (
              <Reveal
                key={group.category}
                delay={Math.min(i, 6) * 65}
                className="panel panel-interactive group flex flex-col p-6"
              >
                <div className="mb-1 flex items-center gap-2.5">
                  <span
                    className="h-1.5 w-1.5 rotate-45"
                    style={{ background: color }}
                    aria-hidden
                  />
                  <h3 className="font-display text-base font-bold tracking-tight text-ink">
                    {group.category}
                  </h3>
                </div>
                <p className="mb-5 pl-4 text-xs text-ink-3">{group.note}</p>

                <ul className="flex flex-wrap gap-1.5">
                  {group.items.map(item => (
                    <li
                      key={item}
                      className="rounded-md border border-line bg-canvas-2/60 px-2.5 py-1 font-mono text-[11px] text-ink-2 transition-colors duration-300 hover:border-line-3 hover:text-ink"
                    >
                      {item}
                    </li>
                  ))}
                </ul>

                <div
                  className="mt-6 h-px w-full origin-left scale-x-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
                  style={{ background: color }}
                  aria-hidden
                />
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
