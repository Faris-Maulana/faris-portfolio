import { ArrowUpRight, Download, FileSearch, ShieldAlert } from 'lucide-react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Reveal } from '@/components/ui/Reveal'
import { QUANT_CASE_STUDIES, SITE_CONFIG } from '@/lib/constants'
import { TrackedLink } from '@/components/analytics/TrackedLink'

export function QuantPortfolio() {
  return (
    <section id="research" className="section section-mineral">
      <div className="container">
        <SectionHeader
          label="Research and evaluation"
          meta="Methods visible / private source records excluded"
          title={['Evidence, not', <span key="2" className="text-ink-3">decorative certainty.</span>]}
          lead="The useful part of quantitative work is the question, inferential boundary and decision it informs. These notes deliberately omit performance graphics and precision that cannot be reproduced from public artifacts."
        />

        <div className="mt-12 flex items-start gap-4 border-l-2 border-cred bg-surface p-5">
          <FileSearch className="mt-1 shrink-0 text-cred" size={21} aria-hidden />
          <div>
            <h3 className="font-display font-semibold text-ink">Evidence boundary</h3>
            <p className="mt-2 text-sm text-ink-2">Private ERP, patient and enterprise records are not published. Conceptual system diagrams are labelled as diagrams; no invented series is rendered as an observed chart.</p>
            <TrackedLink href={SITE_CONFIG.quantPath} download event={{ name: 'cv_download', document: 'quantitative', placement: 'methods' }} className="link-draw mt-4 inline-flex items-center gap-2 text-sm font-semibold"><Download size={15} aria-hidden /> Download quantitative methods and evidence boundaries</TrackedLink>
          </div>
        </div>

        <div className="mt-10 border-t border-line">
          {QUANT_CASE_STUDIES.map((study, index) => (
            <Reveal key={study.title} delay={index * 45}>
              <details className="group border-b border-line" name="research-studies">
                <summary className="grid cursor-pointer list-none gap-4 py-7 md:grid-cols-12 md:items-center">
                  <span className="t-meta md:col-span-2">R{String(index + 1).padStart(2, '0')} / {study.method}</span>
                  <span className="md:col-span-6"><span className="t-h3 block">{study.title}</span><span className="mt-2 block text-sm text-ink-3">{study.company}</span></span>
                  <span className="text-sm text-ink-2 md:col-span-3">{study.question}</span>
                  <span className="font-mono text-2xl text-signal transition-transform group-open:rotate-45 md:col-span-1 md:text-right" aria-hidden>+</span>
                </summary>
                <div className="grid gap-8 pb-9 md:grid-cols-12">
                  <div className="md:col-start-3 md:col-span-5">
                    <h4 className="t-meta mb-3 text-signal">Analytical approach</h4>
                    <p className="t-body text-base">{study.approach}</p>
                    <h4 className="t-meta mb-3 mt-6 text-threat">Limit</h4>
                    <p className="text-base text-ink-2">{study.limitation}</p>
                  </div>
                  <dl className="md:col-span-4">
                    {study.evidence.map(item => <div key={item.label} className="flex items-baseline justify-between gap-4 border-t border-line py-4 last:border-b"><dt className="text-sm text-ink-3">{item.label}</dt><dd className="text-right text-sm font-semibold text-ink">{item.value}</dd></div>)}
                  </dl>
                </div>
              </details>
            </Reveal>
          ))}
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <p className="kicker text-threat">Adversarial research track</p>
            <h3 className="t-h3 mt-5 max-w-xl">Security review informs system design, not a separate personality.</h3>
            <p className="t-body mt-5 max-w-2xl">Independent Web3 security work uses the same discipline as AI evaluation: model the failure, reproduce it, bound its impact and test the mitigation.</p>
          </Reveal>
          <div className="panel p-6 lg:col-span-5">
            <ShieldAlert className="text-threat" size={25} aria-hidden />
            <ol className="mt-5 space-y-4">
              {['Map assets, actors and trust boundaries', 'Exercise invariants and adversarial state transitions', 'Write a reproducible proof of concept', 'Pair each finding with a testable mitigation'].map((step, index) => (
                <li key={step} className="flex gap-3 text-sm text-ink-2"><span className="t-meta text-threat">0{index + 1}</span>{step}</li>
              ))}
            </ol>
            <p className="mt-6 border-t border-line pt-5 text-sm text-ink-2"><strong className="text-ink">Audit outcome ledger:</strong> no individual accepted, duplicate or rejected finding is claimed here. Publication requires a dated report, immutable PoC source, mitigation test and explicit resolution status.</p>
            <a href={SITE_CONFIG.github} target="_blank" rel="noopener noreferrer" className="link-draw mt-6 inline-flex items-center gap-2 text-sm font-semibold">Inspect public research repositories <ArrowUpRight size={15} aria-hidden /></a>
          </div>
        </div>
      </div>
    </section>
  )
}
