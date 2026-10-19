'use client'

import { ArrowUpRight, Download } from 'lucide-react'
import { Reveal, RevealLines } from '@/components/ui/Reveal'
import { IntroVideo } from '@/components/ui/IntroVideo'
import { useClock } from '@/hooks/useClock'
import { HERO_METRICS, SITE_CONFIG } from '@/lib/constants'

/**
 * The fold is a positioning statement, not a name. A recruiter decides in
 * seconds; the first thing they read is what the job is and the scale it runs
 * at. The name is still the first words of the h1 for search and for screen
 * readers, set small above the statement.
 *
 * The map behind it is the fixed BackboneScene, mounted in the layout.
 */
export function Hero() {
  const clock = useClock('Asia/Jakarta')

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] flex-col justify-end pt-20 sm:pt-24"
    >
      {/* Legibility scrim under the text column only; the right side stays
          clear so the map reads. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(95deg, rgba(5,7,11,0.92) 0%, rgba(5,7,11,0.7) 38%, rgba(5,7,11,0) 66%), linear-gradient(to top, var(--color-canvas) 0%, rgba(5,7,11,0) 34%)',
        }}
      />

      <div className="container relative flex flex-1 flex-col justify-center">
        <Reveal className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="flex items-center gap-2.5">
            <span className="pulse-dot" aria-hidden />
            <span className="text-sm font-semibold text-signal">
              Open to lead and manager roles
            </span>
          </span>
          <span className="t-meta">{SITE_CONFIG.location}</span>
          <span className="t-meta">{clock ? `${clock} WIB` : 'WIB, GMT+7'}</span>
        </Reveal>

        <h1>
          <Reveal as="span" className="mb-4 block text-lg font-semibold text-ink-2 sm:text-xl">
            Faris Maulana
            <span className="text-ink-3">, AI Engineering Manager</span>
          </Reveal>
          <span className="t-display block max-w-[15ch] text-ink">
            <RevealLines
              lines={[
                'I build the',
                'AI function',
                <>
                  on a <span className="text-signal">25,000 km</span>
                </>,
                'backbone.',
              ]}
              stagger={95}
              delay={80}
            />
          </span>
        </h1>

        <Reveal
          as="p"
          delay={420}
          className="t-lead mt-7 max-w-[52ch]"
        >
          Manager of AI Engineering at {SITE_CONFIG.company}. I own the
          function, the data platform and the agent layer, from an empty org
          chart to production, fully on-premise.
        </Reveal>

        <Reveal delay={500} className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
          <a href="#contact" className="btn btn-primary">
            Start a conversation
            <ArrowUpRight size={15} />
          </a>
          <IntroVideo />
          <a
            href={SITE_CONFIG.cvPath}
            download
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-2 transition-colors hover:text-ink"
          >
            <Download size={15} />
            <span className="link-draw text-current">CV, PDF</span>
          </a>
        </Reveal>
      </div>

      <div className="container relative pb-8 sm:pb-10">
        <p className="t-label mb-3 opacity-80 lg:absolute lg:right-[var(--gutter)] lg:-top-1 lg:mb-0 lg:-translate-y-full lg:text-right">
          Natural Earth land data. Routes are stylised, not a network map.
        </p>
        <Reveal delay={620} className="border-t border-line-2 pt-6">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-7 lg:grid-cols-4">
            {HERO_METRICS.map(metric => (
              <div key={metric.label} className="flex min-w-0 flex-col-reverse">
                <dt className="t-label mt-2 max-w-[26ch]">{metric.label}</dt>
                <dd className="wide text-3xl font-extrabold leading-none tracking-tight text-ink tnum sm:text-4xl">
                  {metric.value}
                  {metric.unit ? (
                    <span className="ml-1 text-base font-semibold text-ink-3">{metric.unit}</span>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  )
}
