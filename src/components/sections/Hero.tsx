'use client'

import { ArrowDown, ArrowUpRight, Download } from 'lucide-react'
import { useClock } from '@/hooks/useClock'
import { HERO_METRICS, SITE_CONFIG } from '@/lib/constants'
import { StaticAtlas } from '@/components/canvas/StaticAtlas'

export function Hero() {
  const clock = useClock('Asia/Jakarta')

  return (
    <section id="hero" className="atlas-grid relative min-h-[100svh] overflow-hidden border-b border-line">
      <div className="hero-ambient pointer-events-none absolute inset-0" aria-hidden />
      <span className="atlas-coordinate absolute right-4 top-28 hidden xl:block" aria-hidden>06.2088 S / 106.8456 E</span>

      <div className="container relative flex min-h-[100svh] flex-col pb-8 pt-28 sm:pt-32">
        <div className="grid flex-1 items-center gap-12 py-10 lg:grid-cols-12 lg:gap-10 lg:py-14">
          <div className="lg:col-span-7">
            <div className="mb-7 flex flex-wrap items-center gap-x-6 gap-y-3">
              <span className="inline-flex items-center gap-3 text-sm text-ink">
                <span className="status-dot" aria-hidden />
                {SITE_CONFIG.availability.status}
              </span>
              <span className="t-meta">{SITE_CONFIG.location} <span className="tnum">{clock}</span></span>
            </div>

            <h1 className="hero-title t-display max-w-[13ch]">
              <span className="mb-5 block font-body text-sm font-semibold normal-case tracking-normal text-ink-2">
                {SITE_CONFIG.name} / {SITE_CONFIG.role}
              </span>
              Accountable <span className="text-signal">AI systems.</span>
            </h1>
            <p className="t-lead mt-8 max-w-2xl lg:ml-[16.666%]">
              I build the data foundations, evaluation controls and operating models that let AI survive real infrastructure, not just the demo.
            </p>

            <div className="mt-9 flex flex-wrap gap-3 lg:ml-[16.666%]">
              <a href="#work" className="btn btn-primary">Inspect the systems <ArrowDown size={17} aria-hidden /></a>
              <a href={SITE_CONFIG.cvPath} download className="btn btn-ghost">
                <Download size={17} aria-hidden /> Executive CV
              </a>
            </div>
          </div>

          <aside className="relative lg:col-span-5" aria-label="Infrastructure explorer and current technical mandate">
            <StaticAtlas />
            <div className="panel corner-mark relative z-10 mt-5 p-5 sm:p-6">
              <p className="t-meta text-signal">Current mandate / 2026</p>
              <p className="t-h3 mt-3">One backbone.<br />Three ownership layers.</p>
              <dl className="mandate-scope mt-5 border-t border-line">
                <div><dt>Function</dt><dd>AI engineering function</dd></div>
                <div><dt>Platform</dt><dd>Governed data platform</dd></div>
                <div><dt>Agents</dt><dd>Controlled agent layer</dd></div>
              </dl>
              <a href="#leadership" className="link-draw mt-6 inline-flex items-center gap-2 text-sm font-semibold">Read the mandate <ArrowUpRight size={15} aria-hidden /></a>
            </div>
          </aside>
        </div>

        <dl className="hero-metrics grid border-y border-line sm:grid-cols-3">
          {HERO_METRICS.map((metric, i) => (
            <div key={metric.label} className={`py-5 sm:px-6 ${i > 0 ? 'border-t border-line sm:border-l sm:border-t-0' : ''}`}>
              <dt className="order-2 mt-2 text-sm text-ink-2">{metric.label}</dt>
              <dd className="font-display text-3xl font-semibold tracking-tight text-ink wide">
                {metric.value}<span className="ml-2 font-body text-sm font-normal tracking-normal text-signal">{metric.unit}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
