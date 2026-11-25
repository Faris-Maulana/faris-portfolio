import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, CircleAlert } from 'lucide-react'
import { CASE_STUDIES, SITE_CONFIG } from '@/lib/constants'
import { CASE_STUDY_DETAILS } from '@/lib/case-study-details'
import { PROJECT_EVIDENCE } from '@/lib/evidence-content'
import { DATA_EXPOSURE_LABELS, EVIDENCE_LEVEL_LABELS } from '@/lib/evidence'
import { SITE_URL } from '@/lib/site'
import { EvidenceLedger } from '@/components/work/EvidenceLedger'
import { TrackedLink } from '@/components/analytics/TrackedLink'

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
    openGraph: {
      type: 'article',
      url: `/work/${study.id}`,
      title: study.title,
      description: study.problem,
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Faris Maulana, AI Engineering Manager' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: study.title,
      description: study.problem,
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Faris Maulana, AI Engineering Manager' }],
    },
  }
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const index = CASE_STUDIES.findIndex(item => item.id === slug)
  const study = CASE_STUDIES[index]
  if (!study) notFound()
  const detail = CASE_STUDY_DETAILS[study.id]
  const evidence = PROJECT_EVIDENCE.find(item => item.id === study.id)
  if (!detail || !evidence) notFound()
  const next = CASE_STUDIES[(index + 1) % CASE_STUDIES.length]
  const caseStudyJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: study.title,
    description: study.problem,
    inLanguage: 'en',
    isAccessibleForFree: true,
    mainEntityOfPage: new URL(`/work/${study.id}`, SITE_URL).toString(),
    author: { '@type': 'Person', name: SITE_CONFIG.name, url: SITE_URL },
    keywords: study.stack.join(', '),
    citation: evidence.artifacts.flatMap(artifact => artifact.location.type === 'external' ? [artifact.location.url] : []),
  }

  return (
    <article className="atlas-grid pb-24 pt-32 sm:pt-40">
      <div className="container">
        <Link href="/#work" className="link-draw inline-flex items-center gap-2 text-sm font-semibold"><ArrowLeft size={16} aria-hidden /> Back to selected work</Link>

        <header className="grid gap-10 border-b border-line pb-14 pt-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="flex flex-wrap gap-4"><span className="t-meta text-signal">Public case study</span><span className="t-meta">{study.status} / {study.year}</span></div>
            <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.25rem,12vw,3rem)] font-semibold leading-none tracking-tight text-ink sm:text-7xl wide">{study.title}</h1>
            <p className="t-lead mt-8 max-w-3xl">{study.problem}</p>
          </div>
          <div className="border-l border-line pl-6 lg:col-span-4 lg:mt-16">
            <dl className="space-y-5">
              <div><dt className="t-meta mb-2">Organisation</dt><dd className="text-ink">{study.org}</dd></div>
              <div><dt className="t-meta mb-2">My role</dt><dd className="text-sm text-ink-2">{detail.role}</dd></div>
              <div><dt className="t-meta mb-2">Current maturity</dt><dd className="text-signal">{study.status}</dd></div>
              <div><dt className="t-meta mb-2">Strongest public proof</dt><dd className="text-sm text-ink-2">{EVIDENCE_LEVEL_LABELS[evidence.evidenceLevel]} / {evidence.artifacts.length} recorded {evidence.artifacts.length === 1 ? 'artifact' : 'artifacts'}</dd></div>
              <div><dt className="t-meta mb-2">Data exposure</dt><dd className="text-sm text-ink-2">{DATA_EXPOSURE_LABELS[evidence.dataExposure]}</dd></div>
            </dl>
            <a href="#evidence" className="link-draw mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-signal">Inspect the public evidence</a>
          </div>
        </header>

        <nav className="case-study-section-nav" aria-label="On this page">
          <a href="#architecture-title">System boundary</a>
          <a href="#evaluation-title">Evaluation</a>
          <a href="#limitations-title">Limits</a>
          <a href="#evidence">Evidence ledger</a>
        </nav>

        <section className="grid scroll-mt-36 gap-10 border-b border-line py-14 lg:grid-cols-12" aria-labelledby="architecture-title">
          <div className="lg:col-span-4"><p className="kicker">System boundary</p><h2 id="architecture-title" className="t-h3 mt-5">Architecture as a sequence of controls.</h2></div>
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
          <section aria-labelledby="evaluation-title" className="scroll-mt-36">
            <p className="kicker">Evaluation</p>
            <h2 id="evaluation-title" className="t-h3 mt-5">Define how the system fails.</h2>
            <ul className="mt-7 space-y-5">
              {detail.evaluation.map(item => <li key={item} className="flex gap-3 text-ink-2"><Check className="mt-1 shrink-0 text-data" size={18} aria-hidden /><span>{item}</span></li>)}
            </ul>
          </section>
          <section aria-labelledby="limitations-title" className="scroll-mt-36">
            <p className="kicker text-threat">Limits</p>
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

        <p className="my-6 flex gap-3 text-sm text-ink-3"><CircleAlert size={17} className="mt-0.5 shrink-0" aria-hidden />{detail.evidenceLabel}</p>

        <EvidenceLedger evidence={evidence} currentRoute={`/work/${study.id}`} />

        <section className="case-conversion lg:grid-cols-12 lg:items-center" aria-labelledby="case-contact-title">
          <div className="lg:col-span-8">
            <p className="kicker">Continue the review</p>
            <h2 id="case-contact-title" className="mt-5">Discuss the control model behind {study.title}.</h2>
            <p className="mt-4">Bring the operating context, the failure mode and the decision that needs evidence. No sales sequence or generic capability pitch.</p>
          </div>
          <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
            <TrackedLink href="/#contact" event={{ name: 'case_contact_click', caseId: study.id }} className="btn btn-primary">Discuss this system <ArrowRight size={16} aria-hidden /></TrackedLink>
            <TrackedLink href={`mailto:${SITE_CONFIG.email}?subject=${encodeURIComponent(`Architecture review: ${study.title}`)}`} event={{ name: 'case_email_click', caseId: study.id }} className="btn btn-ghost">Email the brief</TrackedLink>
          </div>
        </section>

        <nav className="mt-10 flex items-center justify-between gap-6 border-t border-line pt-8" aria-label="Case study navigation">
          <Link href="/#work" className="text-sm text-ink-2 hover:text-signal">All case studies</Link>
          <Link href={`/work/${next.id}`} className="group text-right">
            <span className="t-meta">Next case</span>
            <span className="mt-2 flex items-center gap-3 font-display text-lg font-semibold text-ink group-hover:text-signal">{next.title}<ArrowRight size={18} aria-hidden /></span>
          </Link>
        </nav>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(caseStudyJsonLd).replaceAll('<', '\\u003c') }} />
      </div>
    </article>
  )
}
