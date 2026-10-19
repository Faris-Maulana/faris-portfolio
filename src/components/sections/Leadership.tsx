'use client'

import { SectionHeader } from '@/components/ui/SectionHeader'
import { Reveal } from '@/components/ui/Reveal'
import { TiltCard } from '@/components/ui/TiltCard'
import { DECISIONS, EDUCATION, OWNERSHIP, PRINCIPLES, SITE_CONFIG } from '@/lib/constants'

const PROFILE = [
  { k: 'Current', v: `${SITE_CONFIG.role}, ${SITE_CONFIG.company}` },
  { k: 'In parallel', v: 'Master Consultant AI Engineer, iMerit Technology (US, remote)' },
  { k: 'Education', v: `${EDUCATION.degree}, ${EDUCATION.school}. ${EDUCATION.honors}` },
  { k: 'Languages', v: 'Indonesian (native), English (professional)' },
  { k: 'Open to', v: SITE_CONFIG.availableFor },
]

/**
 * Lead and manager level, made legible. Three questions a hiring manager is
 * really asking: what does this person own, how do they work, and how do
 * they make the calls that matter. Ownership, operating principles, and a
 * decision log answer them in that order.
 */
export function Leadership() {
  return (
    <section id="leadership" className="section">
      <div className="container">
        <SectionHeader
          label="Leadership"
          title={['What I own,', <span key="2" className="text-ink-3">and how I run it.</span>]}
          lead="The model was never the hard part. The hard part is turning years of undocumented network telemetry into something an agent can be trusted to query, and building the team and the platform that keep it trustworthy."
        />

        {/* ── Ownership ─────────────────────────────────────────────── */}
        <div className="mt-14 grid gap-px overflow-hidden rounded-[10px] border border-line bg-line sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {OWNERSHIP.map((o, i) => (
            <Reveal
              key={o.area}
              delay={i * 70}
              className="flex flex-col bg-surface/95 p-6 sm:p-7"
            >
              <span className="h-px w-6 bg-signal" aria-hidden />
              <h3 className="t-h3 mt-5 text-ink">{o.area}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-2">{o.body}</p>
            </Reveal>
          ))}
        </div>

        <div className="mt-20 grid gap-14 lg:mt-24 lg:grid-cols-12 lg:gap-12">
          {/* ── Operating principles ────────────────────────────────── */}
          <div className="lg:col-span-5">
            <Reveal>
              <h3 className="text-sm font-semibold text-ink">How I operate</h3>
              <p className="t-body mt-2 max-w-[42ch] text-sm">
                The working rules I bring to every platform and every
                engagement, and hold the team to.
              </p>
            </Reveal>
            <ol className="mt-8">
              {PRINCIPLES.map((p, i) => (
                <Reveal
                  as="li"
                  key={p.title}
                  delay={i * 60}
                  className="border-t border-line py-5 last:border-b"
                >
                  <h4 className="font-semibold text-ink">{p.title}</h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{p.body}</p>
                </Reveal>
              ))}
            </ol>
          </div>

          {/* ── Decision log ────────────────────────────────────────── */}
          <div className="lg:col-span-7">
            <Reveal>
              <h3 className="text-sm font-semibold text-ink">Decision log</h3>
              <p className="t-body mt-2 max-w-[52ch] text-sm">
                Three architecture decisions from the TIS platform, written as
                they were made: the constraint, the call, and what it cost.
              </p>
            </Reveal>

            <div className="mt-8 space-y-4">
              {DECISIONS.map((d, i) => (
                <Reveal key={d.id} delay={i * 90}>
                  <TiltCard className="panel panel-interactive p-6 sm:p-7" max={3}>
                    <div className="tilt-lift">
                      <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <h4 className="wide text-lg font-bold tracking-tight text-ink">{d.title}</h4>
                        <span className="t-meta">{d.id}</span>
                      </div>
                      <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-[6.5rem_1fr] sm:gap-x-5">
                        <dt className="t-label pt-0.5">Constraint</dt>
                        <dd className="leading-relaxed text-ink-2">{d.context}</dd>
                        <dt className="t-label pt-0.5 text-signal">Decision</dt>
                        <dd className="leading-relaxed text-ink">{d.decision}</dd>
                        <dt className="t-label pt-0.5">Trade-off</dt>
                        <dd className="leading-relaxed text-ink-2">{d.tradeoff}</dd>
                      </dl>
                    </div>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        {/* ── Profile ───────────────────────────────────────────────── */}
        <Reveal className="panel ticks mt-20 p-6 sm:p-8 lg:mt-24">
          <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
            {PROFILE.map(f => (
              <div key={f.k} className="min-w-0">
                <dt className="t-label">{f.k}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-ink-2">{f.v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  )
}
