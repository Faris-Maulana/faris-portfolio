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
 * A ledger, not a tag cloud. Seventy chips in a grid read as keyword
 * stuffing; one line per discipline, with what it is used for, reads as
 * someone who knows which tool belongs to which problem.
 */
export function Capabilities() {
  return (
    <section id="capabilities" className="section">
      <div className="container">
        <SectionHeader
          label="Capabilities"
          title={['The stack,', <span key="2" className="text-ink-3">end to end.</span>]}
          lead="Grouped by what it is used for. Everything listed has shipped to production or to a client deliverable."
        />

        <dl className="mt-14 lg:mt-16">
          {SKILLS.map((group, i) => (
            <Reveal
              key={group.category}
              delay={Math.min(i, 5) * 50}
              className="grid gap-3 border-t border-line py-6 last:border-b lg:grid-cols-12 lg:gap-8"
            >
              <dt className="lg:col-span-4">
                <span className="flex items-center gap-3">
                  <span
                    className="h-2 w-2 rounded-[2px]"
                    style={{ background: ACCENT[group.accent] ?? 'var(--color-ink-3)' }}
                    aria-hidden
                  />
                  <span className="font-semibold text-ink">{group.category}</span>
                </span>
                <span className="t-label mt-1 block pl-5">{group.note}</span>
              </dt>
              <dd className="text-[15px] leading-relaxed text-ink-2 lg:col-span-8">
                {group.items.join('  ·  ')}
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  )
}
