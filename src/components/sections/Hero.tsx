import Link from 'next/link'
import { ArrowUpRight, Download, Play } from 'lucide-react'
import { CASE_STUDIES, HERO_METRICS, SITE_CONFIG } from '@/lib/constants'
import { StaticAtlas } from '@/components/canvas/StaticAtlas'
import { LocalTime } from '@/components/sections/LocalTime'
import { TrackedLink } from '@/components/analytics/TrackedLink'

const FLAGSHIP = CASE_STUDIES.find(study => study.id === 'simpul') ?? CASE_STUDIES[0]

export function Hero() {
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
              <span className="t-meta">{SITE_CONFIG.location} <LocalTime /></span>
            </div>

            <h1 className="hero-title t-display max-w-[13ch]">
              <span className="hero-name mb-5 block font-body text-sm font-semibold normal-case tracking-normal text-ink-2">
                {SITE_CONFIG.name} / {SITE_CONFIG.role}
              </span>
              <span className="hero-title-line block">Accountable</span>
              <span className="hero-title-line hero-title-accent block text-signal">AI systems.</span>
            </h1>
            <p className="hero-lead t-lead mt-8 max-w-2xl lg:ml-[16.666%]">
              Governed data, evaluated models and explicit execution controls for infrastructure that cannot afford demo-only AI.
            </p>

            <div className="hero-cta mt-9 flex flex-wrap gap-3 lg:ml-[16.666%]">
              <Link href="/simpul" className="btn btn-primary">Run SIMPUL reference <Play size={16} aria-hidden /></Link>
              <TrackedLink href={SITE_CONFIG.cvPath} download event={{ name: 'cv_download', document: 'executive', placement: 'hero' }} className="btn btn-ghost">
                <Download size={17} aria-hidden /> Executive CV
              </TrackedLink>
            </div>
          </div>

          <aside className="hero-command relative lg:col-span-5" aria-label="Infrastructure context and flagship evidence">
            <StaticAtlas />
            <div className="panel corner-mark relative z-10 mt-5 p-5 sm:p-6">
              <p className="t-meta text-signal">Flagship proof / {FLAGSHIP.status}</p>
              <p className="t-h3 mt-3">Synthetic incident decisions.<br />Replay every boundary.</p>
              <p className="mt-4 text-sm leading-relaxed text-ink-2">{FLAGSHIP.outcome}</p>
              <dl className="mandate-scope mt-5 border-t border-line">
                <div><dt>Evidence</dt><dd>Interactive browser run</dd></div>
                <div><dt>Data</dt><dd>Synthetic only</dd></div>
                <div><dt>Control</dt><dd>No production connection</dd></div>
              </dl>
              <Link href={`/work/${FLAGSHIP.id}`} className="link-draw mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold">Read flagship boundaries <ArrowUpRight size={15} aria-hidden /></Link>
            </div>
          </aside>
        </div>

        <div className="hero-contract">
          <span className="t-meta">Operating contract</span>
          <ol aria-label="AI engineering operating contract">
            <li>Govern the source</li>
            <li>Evaluate failure</li>
            <li>Authorize execution</li>
            <li>Preserve evidence</li>
          </ol>
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
