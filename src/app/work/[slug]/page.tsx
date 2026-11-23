import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, CircleAlert } from 'lucide-react'
import { CASE_STUDIES } from '@/lib/constants'
import { CASE_STUDY_DETAILS } from '@/lib/case-study-details'

export function generateStaticParams() {
  return CASE_STUDIES.map(study => ({ slug: study.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const study = CASE_STUDIES.find(item => item.id === slug)
  if (!study) return {}
  return {
    title: study.title,
    description: study.problem,
    alternates: { canonical: `/work/${study.id}` },
  }
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const index = CASE_STUDIES.findIndex(item => item.id === slug)
  const study = CASE_STUDIES[index]
  if (!study) notFound()
  const detail = CASE_STUDY_DETAILS[study.id]
  const next = CASE_STUDIES[(index + 1) % CASE_STUDIES.length]

  return (
    <article className="atlas-grid pb-24 pt-32 sm:pt-40">
      <div className="container">
        <Link href="/#work" className="link-draw inline-flex items-center gap-2 text-sm font-semibold"><ArrowLeft size={16} aria-hidden /> Back to selected work</Link>

        <header className="grid gap-10 border-b border-line pb-14 pt-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="flex flex-wrap gap-4"><span className="t-meta text-signal">Case study / 0{index + 1}</span><span className="t-meta">{study.status} / {study.year}</span></div>
            <h1 className="mt-6 max-w-4xl font-display text-5xl font-semibold leading-none tracking-tight text-ink sm:text-7xl wide">{study.title}</h1>
            <p className="t-lead mt-8 max-w-3xl">{study.problem}</p>
          </div>
          <dl className="space-y-5 border-l border-line pl-6 lg:col-span-4 lg:mt-16">
            <div><dt className="t-meta mb-2">Organisation</dt><dd className="text-ink">{study.org}</dd></div>
            <div><dt className="t-meta mb-2">My role</dt><dd className="text-sm text-ink-2">{detail.role}</dd></div>
            <div><dt className="t-meta mb-2">Current maturity</dt><dd className="text-signal">{study.status}</dd></div>
          </dl>
        </header>

        <section className="grid gap-10 border-b border-line py-14 lg:grid-cols-12" aria-labelledby="architecture-title">
          <div className="lg:col-span-4"><p className="kicker">01 / System boundary</p><h2 id="architecture-title" className="t-h3 mt-5">Architecture as a sequence of controls.</h2></div>
          <ol className="lg:col-span-8">
            {detail.architecture.map((step, stepIndex) => (
              <li key={step} className="grid grid-cols-[2.75rem_1fr] gap-4 border-t border-line py-5 last:border-b">
                <span className="t-meta text-signal">{String(stepIndex + 1).padStart(2, '0')}</span>
                <p className="text-ink-2">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        <div className="grid gap-12 py-14 lg:grid-cols-2 lg:gap-16">
          <section aria-labelledby="evaluation-title">
            <p className="kicker">02 / Evaluation</p>
            <h2 id="evaluation-title" className="t-h3 mt-5">Define how the system fails.</h2>
            <ul className="mt-7 space-y-5">
              {detail.evaluation.map(item => <li key={item} className="flex gap-3 text-ink-2"><Check className="mt-1 shrink-0 text-data" size={18} aria-hidden /><span>{item}</span></li>)}
            </ul>
          </section>
          <section aria-labelledby="limitations-title">
            <p className="kicker text-threat">03 / Limits</p>
            <h2 id="limitations-title" className="t-h3 mt-5">What this case does not prove.</h2>
            <ul className="mt-7 space-y-5">
              {detail.limitations.map(item => <li key={item} className="flex gap-3 text-ink-2"><CircleAlert className="mt-1 shrink-0 text-threat" size={18} aria-hidden /><span>{item}</span></li>)}
            </ul>
          </section>
        </div>

        <section className="panel corner-mark p-6 sm:p-9" aria-labelledby="decision-title">
          <p className="t-meta text-signal">Engineering decision</p>
          <h2 id="decision-title" className="mt-4 max-w-4xl font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">{detail.decision}</h2>
          <p className="t-body mt-6 max-w-3xl text-base">{study.approach}</p>
          <ul className="mt-7 flex flex-wrap gap-2" aria-label="Technology stack">{study.stack.map(item => <li key={item} className="chip">{item}</li>)}</ul>
        </section>

        <p className="mt-6 flex gap-3 text-sm text-ink-3"><CircleAlert size={17} className="mt-0.5 shrink-0" aria-hidden />{detail.evidenceLabel}</p>

        <nav className="mt-16 flex items-center justify-between gap-6 border-t border-line pt-8" aria-label="Case study navigation">
          <Link href="/#work" className="text-sm text-ink-2 hover:text-signal">All case studies</Link>
          <Link href={`/work/${next.id}`} className="group text-right">
            <span className="t-meta">Next case</span>
            <span className="mt-2 flex items-center gap-3 font-display text-lg font-semibold text-ink group-hover:text-signal">{next.title}<ArrowRight size={18} aria-hidden /></span>
          </Link>
        </nav>
      </div>
    </article>
  )
}
