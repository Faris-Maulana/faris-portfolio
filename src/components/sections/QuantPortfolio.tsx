'use client'

import { SectionHeader } from '@/components/ui/SectionHeader'
import { Reveal } from '@/components/ui/Reveal'
import { QUANT_CASE_STUDIES, SITE_CONFIG } from '@/lib/constants'
import { ArrowUpRight } from 'lucide-react'

const ACCENT: Record<string, string> = {
  signal: 'var(--color-signal)',
  agent: 'var(--color-agent)',
  data: 'var(--color-data)',
  cred: 'var(--color-cred)',
}

const PATHS: Record<string, string> = {
  line: 'M 2 46 L 20 34 L 38 40 L 56 22 L 74 28 L 98 12',
  survival: 'M 2 8 L 22 9 L 40 14 L 58 26 L 78 42 L 98 50',
  tradeoff: 'M 2 48 Q 30 44 50 26 Q 70 12 98 8',
  bar: 'M 2 50 L 26 40 L 50 26 L 74 18 L 98 8',
}

/**
 * Sparkline drawn with stroke-dashoffset so the line traces itself when the
 * card enters the viewport, one CSS transition instead of a per-frame JS
 * animation, and it inherits the same reveal timing as everything else.
 */
function Sparkline({ type, color }: { type: string; color: string }) {
  const d = PATHS[type] ?? PATHS.line
  return (
    <svg
      viewBox="0 0 100 56"
      preserveAspectRatio="none"
      className="h-16 w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id={`fade-${type}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.16" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L 98 56 L 2 56 Z`} fill={`url(#fade-${type})`} />
      <path
        d={d}
        pathLength={1}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className="spark-path"
      />
    </svg>
  )
}

export function QuantPortfolio() {
  return (
    <section id="research" className="section">
      <div className="container">
        <SectionHeader
          index="05"
          label="Research"
          meta="4 case studies"
          title={['Models that changed', <span key="2" className="text-ink-3">a decision.</span>]}
          lead="Applied quantitative work across maritime, telco, healthcare, and education. Every one of these produced a number someone acted on. The coefficient mattered less than what it made the business stop doing."
        />

        <div className="mt-14 grid gap-3 lg:grid-cols-2">
          {QUANT_CASE_STUDIES.map((study, i) => {
            const color = ACCENT[study.accent] ?? 'var(--color-signal)'
            return (
              <Reveal
                key={study.title}
                delay={Math.min(i, 4) * 80}
                className="panel panel-interactive flex flex-col p-6 sm:p-8"
              >
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <span
                    className="rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em]"
                    style={{ color, borderColor: `color-mix(in oklab, ${color} 32%, transparent)` }}
                  >
                    {study.method}
                  </span>
                  <span className="t-label">{study.company}</span>
                </div>

                <h3 className="font-display text-xl font-extrabold tracking-tight text-ink">
                  {study.title}
                </h3>

                <div className="my-6">
                  <Sparkline type={study.chartType} color={color} />
                </div>

                <dl className="grid grid-cols-3 gap-4 border-y border-line py-5">
                  {Object.entries(study.metrics).map(([key, value]) => (
                    <div key={key} className="min-w-0">
                      <dd
                        className="font-display text-xl font-extrabold leading-none tracking-tight tnum sm:text-2xl"
                        style={{ color }}
                      >
                        {value}
                      </dd>
                      <dt className="t-label mt-2 leading-snug">{key}</dt>
                    </div>
                  ))}
                </dl>

                <p className="mt-5 text-[13px] leading-relaxed text-ink-2">
                  {study.description}
                </p>
              </Reveal>
            )
          })}
        </div>

        <Reveal delay={140} className="mt-10">
          <a
            href={SITE_CONFIG.quantPath}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="hover"
            className="btn btn-ghost"
          >
            Full quantitative portfolio
            <ArrowUpRight size={13} />
          </a>
        </Reveal>
      </div>
    </section>
  )
}
