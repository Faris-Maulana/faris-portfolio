import Link from 'next/link'
import { ArrowDownRight, ArrowUpRight, Download, Play } from 'lucide-react'
import { CASE_STUDIES, HERO_METRICS, SITE_CONFIG } from '@/lib/constants'
import { StaticAtlas } from '@/components/canvas/StaticAtlas'
import { LocalTime } from '@/components/sections/LocalTime'
import { TrackedLink } from '@/components/analytics/TrackedLink'
import { AmbientField } from '@/components/ui/AmbientField'
import { MetricCounter } from '@/components/ui/MetricCounter'
import { Reveal } from '@/components/ui/Reveal'
import { TiltCard } from '@/components/ui/TiltCard'

const FLAGSHIP = CASE_STUDIES.find(study => study.id === 'simpul') ?? CASE_STUDIES[0]
const CONTRACT = ['Govern the source', 'Evaluate failure', 'Authorize execution', 'Preserve evidence']

export function Hero() {
  return (
    <section id="hero" className="hero-shell atlas-grid relative overflow-hidden border-b border-line">
      <AmbientField />
      <span className="atlas-coordinate absolute right-4 top-28 hidden xl:block" aria-hidden>06.2088 S / 106.8456 E</span>

      <div className="container relative pb-10 pt-28 sm:pt-32 lg:pb-14">
        <div className="hero-layout bento-grid items-start">
          <Reveal className="hero-copy">
            <div className="mb-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              <span className="inline-flex items-center gap-3 text-sm text-ink">
                <span className="status-dot" aria-hidden />
                {SITE_CONFIG.availability.status}
              </span>
              <span className="t-meta">{SITE_CONFIG.location} <LocalTime /></span>
            </div>

            <h1 className="hero-title t-display">
              <span className="hero-name mb-5 block font-body text-sm font-semibold normal-case tracking-normal text-ink-2">
                {SITE_CONFIG.name} / {SITE_CONFIG.role}
              </span>
              <span className="reveal-line"><span>Accountable</span></span>
              <span className="reveal-line text-signal"><span>AI systems.</span></span>
            </h1>

            <div className="hero-copy-footer">
              <p className="hero-lead t-lead">Governed data, evaluated models and explicit execution controls for infrastructure that cannot afford demo-only AI.</p>
              <div className="hero-cta flex flex-wrap gap-3">
                <Link href="/simpul" className="btn btn-primary">Run SIMPUL reference <Play size={16} aria-hidden /></Link>
                <TrackedLink href={SITE_CONFIG.cvPath} download event={{ name: 'cv_download', document: 'executive', placement: 'hero' }} className="btn btn-ghost">
                  <Download size={17} aria-hidden /> Executive CV
                </TrackedLink>
              </div>
            </div>
          </Reveal>

          <Reveal className="hero-instrument" delay={90}>
            <TiltCard className="signal-card atlas-card" max={1.2}>
              <span className="signal-card-topline" aria-hidden />
              <StaticAtlas />
            </TiltCard>
            <aside className="hero-proof signal-card" aria-label="Infrastructure context and flagship evidence">
              <div>
                <p className="t-meta text-signal">Flagship proof / {FLAGSHIP.status}</p>
                <p className="hero-proof-title">Synthetic incident decisions.<br />Replay every boundary.</p>
                <p className="mt-3 text-sm leading-relaxed text-ink-2">{FLAGSHIP.outcome}</p>
              </div>
              <div className="hero-proof-bottom">
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  <span className="evidence-token">Interactive browser run</span>
                  <span className="evidence-token">Synthetic only</span>
                  <span className="evidence-token">No production connection</span>
                </div>
                <Link href={`/work/${FLAGSHIP.id}`} className="link-draw inline-flex min-h-11 items-center gap-2 text-sm font-semibold">Read flagship boundaries <ArrowUpRight size={15} aria-hidden /></Link>
              </div>
            </aside>
          </Reveal>
        </div>

        <Reveal className="hero-contract panel" delay={120}>
          <div className="hero-contract-label">
            <span className="t-meta">Operating contract</span>
            <ArrowDownRight size={17} className="text-signal" aria-hidden />
          </div>
          <ol aria-label="AI engineering operating contract">
            {CONTRACT.map((item, index) => <li key={item}><span>0{index + 1}</span>{item}</li>)}
          </ol>
        </Reveal>

        <dl className="hero-metrics bento-grid">
          {HERO_METRICS.map((metric, index) => (
            <Reveal key={metric.label} className="hero-metric panel" delay={150 + index * 45}>
              <dt>{metric.label}</dt>
              <dd><span className="hero-metric-index t-meta" aria-hidden>M{String(index + 1).padStart(2, '0')}</span><MetricCounter value={metric.value} /><span>{metric.unit}</span></dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  )
}
