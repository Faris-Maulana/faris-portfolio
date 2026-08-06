'use client'

import { ArrowUpRight, MapPin } from 'lucide-react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Reveal } from '@/components/ui/Reveal'
import { EDUCATION, SITE_CONFIG } from '@/lib/constants'

/**
 * How the work is framed. Three sentences that a hiring manager can quote back
 * in a meeting, that is the job of this section, not a wall of adjectives.
 */
const PRINCIPLES = [
  {
    n: '01',
    title: 'Architecture before models',
    body: 'A multi-agent system is a distributed system first. Schema discovery, planning, generation, validation, and synthesis are separate agents because each one fails differently and needs its own guardrail.',
  },
  {
    n: '02',
    title: 'Evaluation is the product',
    body: 'Anything that cannot be measured cannot be shipped. I build the evaluator alongside the pipeline, scoring faithfulness, relevance, and retrieval diversity, rather than bolting one on after the demo lands.',
  },
  {
    n: '03',
    title: 'Sovereignty by default',
    body: 'PP 71/2019 means fully on-prem and air-gapped. Every serving decision, from vLLM and SGLang down to the hardware, gets made under that constraint instead of retrofitted to it.',
  },
]

const FACTS = [
  { k: 'Based in', v: SITE_CONFIG.location },
  { k: 'Current', v: `${SITE_CONFIG.role}, ${SITE_CONFIG.company}` },
  { k: 'Also', v: 'Master Consultant AI Engineer, iMerit Technology (US, remote)' },
  { k: 'Languages', v: 'Indonesian (native) · English (professional)' },
  { k: 'Open to', v: SITE_CONFIG.availableFor },
]

export function About() {
  return (
    <section id="about" className="section">
      <div className="container">
        <SectionHeader
          index="01"
          label="About"
          meta="Profile"
          title={['Signal out of', <span key="2" className="text-ink-3">operational noise.</span>]}
          lead={
            <>
              I lead AI Engineering at a neutral national fiber backbone
              operator. The model was never the hard part. The hard part is
              turning twenty years of undocumented network telemetry into
              something an agent can be trusted to query.
            </>
          }
        />

        <div className="mt-16 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-10">
          {/* ── Narrative ─────────────────────────────────────────────── */}
          <div className="lg:col-span-7">
            <Reveal className="space-y-5">
              <p className="t-body">
                Five years across telco, maritime, healthcare research, and
                enterprise LLM consulting taught me the same lesson every time.
                The model is rarely the bottleneck. The bottleneck is the schema
                nobody documented, the metric nobody agreed on, and the
                evaluation nobody ran.
              </p>
              <p className="t-body">
                At{' '}
                <span className="text-ink">PT Trans Indonesia Superkoridor</span>{' '}
                I am the founding AI Engineering hire. I build the function, the
                medallion data platform, and a LangGraph multi-agent Text2SQL
                layer sitting over NMS uptime, NOC logs, and billing data. All of
                it runs on-premise and air-gapped under Indonesian data
                sovereignty rules.
              </p>
              <p className="t-body">
                In parallel I run enterprise LLM engagements for{' '}
                <span className="text-ink">iMerit Technology</span> and audit
                Solidity contracts on Sherlock, Code4rena, and Immunefi. The
                security work is not a side hobby. Red-teaming a smart contract
                and red-teaming an agent are the same discipline pointed at
                different attack surfaces.
              </p>
            </Reveal>

            <div className="mt-12 space-y-px">
              {PRINCIPLES.map((p, i) => (
                <Reveal
                  key={p.n}
                  delay={i * 90}
                  className="group border-t border-line py-6 last:border-b"
                >
                  <div className="flex gap-5">
                    <span className="t-label tnum pt-1 text-signal">{p.n}</span>
                    <div className="min-w-0">
                      <h3 className="t-h3 mb-2 text-ink">{p.title}</h3>
                      <p className="t-body text-sm">{p.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* ── Fact sheet ────────────────────────────────────────────── */}
          <aside className="lg:col-span-5 lg:pl-6">
            <Reveal delay={120} className="panel ticks sticky top-24 p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <span className="t-label">Fact sheet</span>
                <span className="flex items-center gap-2">
                  <span className="pulse-dot" aria-hidden />
                  <span className="t-label text-signal">Open</span>
                </span>
              </div>

              <dl className="space-y-5">
                {FACTS.map(f => (
                  <div
                    key={f.k}
                    className="grid gap-1 border-b border-line pb-5 last:border-0 last:pb-0 sm:grid-cols-[7rem_1fr] sm:gap-4"
                  >
                    <dt className="t-label pt-[3px]">{f.k}</dt>
                    <dd className="text-sm leading-relaxed text-ink-2">{f.v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-8 border-t border-line pt-6">
                <span className="t-label mb-3 block">Education</span>
                <p className="font-display text-base font-bold text-ink">
                  {EDUCATION.degree}
                </p>
                <p className="mt-1 text-sm text-ink-2">{EDUCATION.school}</p>
                <p className="t-mono mt-2 text-ink-3">
                  {EDUCATION.graduated} · {EDUCATION.honors}
                </p>
                <ul className="mt-4 space-y-1.5">
                  {EDUCATION.extras.map(e => (
                    <li key={e} className="flex gap-2.5 text-xs text-ink-3">
                      <span
                        className="mt-[7px] h-px w-2 flex-none bg-ink-4"
                        aria-hidden
                      />
                      <span>{e}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                <a
                  href="#contact"
                  data-cursor="hover"
                  className="btn btn-primary flex-1"
                >
                  Get in touch <ArrowUpRight size={13} />
                </a>
                <a
                  href={SITE_CONFIG.quantPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="hover"
                  className="btn btn-ghost"
                >
                  Quant portfolio
                </a>
              </div>

              <p className="t-label mt-5 flex items-center gap-2">
                <MapPin size={11} aria-hidden />
                {SITE_CONFIG.timezone} · {SITE_CONFIG.responseTime}
              </p>
            </Reveal>
          </aside>
        </div>
      </div>
    </section>
  )
}
