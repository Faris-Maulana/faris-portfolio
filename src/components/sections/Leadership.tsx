import { Plus } from 'lucide-react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Reveal } from '@/components/ui/Reveal'
import { DECISIONS, EDUCATION, OWNERSHIP, PRINCIPLES, SITE_CONFIG } from '@/lib/constants'

export function Leadership() {
  return (
    <section id="leadership" className="section section-dark">
      <div className="container">
        <SectionHeader
          label="Leadership mandate"
          meta="Scope before self-description"
          title={['Own the system.', <span key="2" className="text-ink-3">Not only the model.</span>]}
          lead="AI leadership means connecting technical choices to the organisation that has to fund, govern and operate them. My scope spans the function, the data platform, the agent layer and the operating boundary."
        />

        <div className="leadership-ownership bento-grid">
          {OWNERSHIP.map((item, index) => (
            <Reveal key={item.area} delay={index * 55} className={`ownership-card ownership-${index} signal-card panel-interactive`}>
              <span className="t-meta text-signal">{item.index} / {item.area}</span>
              <p className="t-body mt-5">{item.body}</p>
            </Reveal>
          ))}
        </div>

        <div className="mt-16 grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <p className="kicker">Operating principles</p>
            <div className="mt-7">
              {PRINCIPLES.map((principle, index) => (
                <Reveal key={principle.title} className="grid grid-cols-[2.5rem_1fr] gap-4 border-t border-line py-6 last:border-b" delay={index * 45}>
                  <span className="t-meta text-ink-3">P{index + 1}</span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-ink">{principle.title}</h3>
                    <p className="t-body mt-2 text-base">{principle.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="kicker">Decision record</p>
                <h3 className="t-h3 mt-4">Tradeoffs, made inspectable.</h3>
              </div>
              <span className="t-meta">Current platform / public abstraction</span>
            </div>
            <div className="panel mt-7">
              {DECISIONS.map((decision, index) => (
                <details key={decision.id} className="group border-b border-line last:border-0" name="architecture-decisions" open={index === 0}>
                  <summary className="flex min-h-20 cursor-pointer list-none items-center gap-4 p-5 sm:p-6">
                    <span className="t-meta text-signal">{decision.id}</span>
                    <span className="flex-1 font-display text-lg font-semibold text-ink">{decision.title}</span>
                    <Plus className="transition-transform group-open:rotate-45" size={19} aria-hidden />
                  </summary>
                  <div className="grid gap-5 px-5 pb-7 sm:grid-cols-3 sm:px-6">
                    <div><h4 className="t-meta mb-2 text-ink-2">Context</h4><p className="text-sm text-ink-2">{decision.context}</p></div>
                    <div><h4 className="t-meta mb-2 text-ink-2">Decision</h4><p className="text-sm text-ink-2">{decision.decision}</p></div>
                    <div><h4 className="t-meta mb-2 text-ink-2">Tradeoff</h4><p className="text-sm text-ink-2">{decision.tradeoff}</p></div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>

        <Reveal className="mt-14 flex flex-col justify-between gap-4 border-l-2 border-signal pl-5 text-sm text-ink-2 sm:flex-row sm:items-center">
          <span>{SITE_CONFIG.role}, {SITE_CONFIG.company}. Concurrent enterprise AI consulting with iMerit Technology.</span>
          <span>{EDUCATION.degree}, {EDUCATION.honors}.</span>
        </Reveal>
      </div>
    </section>
  )
}
