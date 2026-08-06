'use client'

import { ArrowDownRight, ArrowUpRight, Download } from 'lucide-react'
import { SignalField } from '@/components/canvas/SignalField'
import { Reveal, RevealLines } from '@/components/ui/Reveal'
import { GithubIcon, LinkedinIcon } from '@/components/ui/Icons'
import { useClock } from '@/hooks/useClock'
import { HERO_METRICS, SITE_CONFIG } from '@/lib/constants'

export function Hero() {
  const clock = useClock('Asia/Jakarta')

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden pt-28"
    >
      {/* The one WebGL moment. Anchored right and masked so it frames the
          headline instead of competing with it, the previous full-bleed scene
          put moving geometry directly behind every line of text. */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <SignalField
          className="absolute inset-y-[-10%] right-[-18%] left-[8%] md:left-[26%]"
          intensity={1}
        />
        {/* Legibility scrim: darkens the canvas under the text column only. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(100deg, var(--color-canvas) 6%, rgba(7,8,10,0.82) 34%, rgba(7,8,10,0.28) 62%, rgba(7,8,10,0.55) 100%)',
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-56"
          style={{
            background:
              'linear-gradient(to top, var(--color-canvas), transparent)',
          }}
        />
      </div>

      <div className="container relative flex flex-1 flex-col justify-center">
        {/* ── Status line ─────────────────────────────────────────────── */}
        <Reveal className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="flex items-center gap-2.5">
            <span className="pulse-dot" aria-hidden />
            <span className="t-label text-signal">Available for work</span>
          </span>
          <span className="hidden h-3 w-px bg-line-2 sm:block" aria-hidden />
          <span className="t-label">{SITE_CONFIG.location}</span>
          <span className="hidden h-3 w-px bg-line-2 sm:block" aria-hidden />
          <span className="t-label tnum tabular-nums">
            {clock ? `${clock} GMT+7` : 'GMT+7'}
          </span>
        </Reveal>

        {/* ── Name ────────────────────────────────────────────────────────
            Solid ink, no background-clip. Gradient text renders as a hole in
            the page the moment anything creates a stacking context above it, which is exactly how this headline disappeared before. */}
        <h1 className="t-display text-ink">
          <span className="sr-only">Faris Maulana</span>
          <span aria-hidden>
            <RevealLines
              lines={[
                'FARIS',
                <>
                  MAULANA
                  <span className="ml-3 inline-block h-[0.14em] w-[0.14em] translate-y-[-0.08em] rounded-full bg-signal align-middle" />
                </>,
              ]}
              stagger={110}
            />
          </span>
        </h1>

        {/* ── Positioning statement ───────────────────────────────────── */}
        <Reveal
          as="p"
          delay={340}
          className="t-lead mt-7 max-w-[46ch] text-balance"
        >
          {SITE_CONFIG.role} at a{' '}
          <span className="text-ink">25,000&nbsp;km DWDM fiber backbone</span>{' '}
          operator. I build the AI function, the data platform, and the agent
          layer <span className="t-serif text-signal">from zero</span>.
        </Reveal>

        <Reveal
          as="p"
          delay={420}
          className="mt-4 max-w-[52ch] text-sm text-ink-3"
        >
          Multi-agent LLM systems. Medallion data platforms. Smart contract
          security research.
        </Reveal>

        {/* ── Actions ─────────────────────────────────────────────────── */}
        <Reveal delay={500} className="mt-9 flex flex-wrap items-center gap-3">
          <a href="#contact" className="btn btn-primary" data-cursor="hover">
            Start a conversation
            <ArrowUpRight size={14} />
          </a>
          <a
            href={SITE_CONFIG.cvPath}
            download
            className="btn btn-ghost"
            data-cursor="hover"
          >
            <Download size={14} />
            Download CV
          </a>

          <span className="hidden h-6 w-px bg-line-2 sm:block" aria-hidden />

          <span className="flex items-center gap-1">
            {[
              { Icon: GithubIcon, href: SITE_CONFIG.github, label: 'GitHub' },
              { Icon: LinkedinIcon, href: SITE_CONFIG.linkedin, label: 'LinkedIn' },
            ].map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                data-cursor="hover"
                className="flex h-11 w-11 items-center justify-center rounded-full text-ink-3 transition-colors duration-300 hover:text-ink"
              >
                <Icon size={16} />
              </a>
            ))}
          </span>
        </Reveal>
      </div>

      {/* ── Metric ledger ─────────────────────────────────────────────── */}
      <div className="container relative pb-10">
        <Reveal delay={620} className="border-t border-line pt-7">
          {/* Value before label: the labels wrap to different heights, and a
              label-first order would push each number to its own baseline. */}
          <dl className="grid grid-cols-2 gap-x-6 gap-y-7 md:grid-cols-4">
            {HERO_METRICS.map(metric => (
              <div key={metric.label} className="min-w-0">
                <dd className="font-display text-2xl font-extrabold leading-none tracking-tight text-ink tnum sm:text-3xl">
                  {metric.value}
                  {metric.unit ? (
                    <span className="ml-1 text-base font-medium text-ink-3">
                      {metric.unit}
                    </span>
                  ) : null}
                </dd>
                <dt className="t-label mt-2.5 leading-relaxed">
                  {metric.label}
                </dt>
              </div>
            ))}
          </dl>
        </Reveal>

        <a
          href="#about"
          data-cursor="hover"
          aria-label="Scroll to about"
          className="mt-8 inline-flex items-center gap-2 text-ink-4 transition-colors duration-300 hover:text-signal"
        >
          <span className="t-label">Scroll</span>
          <ArrowDownRight size={13} className="animate-bounce" />
        </a>
      </div>
    </section>
  )
}
