import Link from 'next/link'
import { ArrowUpRight, CheckCircle2, FlaskConical, GitBranch, Hammer, Library, Play, Star } from 'lucide-react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { CaseStudyExplorer } from '@/components/work/CaseStudyExplorer'
import { CASE_STUDIES, SITE_CONFIG, type CaseStatus } from '@/lib/constants'
import { PROJECT_EVIDENCE } from '@/lib/evidence-content'

const STATUS: Record<CaseStatus, { icon: typeof Hammer; className: string }> = {
  'In development': { icon: Hammer, className: 'text-signal border-signal/40' },
  'Proof of concept': { icon: FlaskConical, className: 'text-cred border-cred/40' },
  'Public reference': { icon: Library, className: 'text-agent border-agent/40' },
  'Internally deployed': { icon: CheckCircle2, className: 'text-data border-data/40' },
}

export interface ArchiveRepo {
  name: string
  description: string | null
  html_url: string
  homepage: string | null
  language: string | null
  stargazers_count: number
  pushed_at: string
}

const PROVING_GROUND_STAGES = ['Simulate', 'Propose', 'Verify', 'Authorize', 'Replay', 'Branch']

export function Work({ repos }: { repos: ArchiveRepo[] }) {
  const flagship = CASE_STUDIES.find(study => study.id === 'simpul') ?? CASE_STUDIES[0]
  const supporting = CASE_STUDIES.filter(study => study.id !== flagship.id)

  return (
    <section id="work" className="section section-mineral">
      <div className="container">
        <SectionHeader
          label="Selected work"
          meta={`${CASE_STUDIES.length} cases / evidence before adjectives`}
          title={['Inspectable systems.', <span key="2" className="text-ink-3">Boundaries included.</span>]}
          lead="Run the public implementations, inspect the test sources and read the unresolved work. A reference implementation, a proof of concept and an internal deployment are different claims."
        />

        <article id={flagship.id} className="panel corner-mark mt-16 scroll-mt-24 overflow-hidden">
          <div className="grid lg:grid-cols-12">
            <div className="p-6 sm:p-9 lg:col-span-7 lg:p-12">
              <div className="flex flex-wrap items-center gap-4">
                <span className={`inline-flex items-center gap-2 border px-2.5 py-1 font-mono text-xs ${STATUS[flagship.status].className}`}>
                  {(() => { const Icon = STATUS[flagship.status].icon; return <Icon size={13} aria-hidden /> })()}
                  {flagship.status}
                </span>
                <span className="t-meta">Flagship / {flagship.year}</span>
              </div>
              <h3 className="mt-7 max-w-xl font-display text-4xl font-semibold leading-none tracking-tight text-ink sm:text-5xl wide">{flagship.title}</h3>
              <p className="t-body mt-6 max-w-2xl">{flagship.problem}</p>
              <div className="mt-8 grid gap-6 border-t border-line pt-7 sm:grid-cols-2">
                <div><h4 className="t-meta mb-3 text-signal">System</h4><p className="text-sm text-ink-2">{flagship.approach}</p></div>
                <div><h4 className="t-meta mb-3 text-signal">Evidence boundary</h4><p className="text-sm text-ink-2">{flagship.outcome}</p></div>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/simpul" className="btn btn-primary">Open proving ground <Play size={16} aria-hidden /></Link>
                <Link href={`/work/${flagship.id}`} className="btn btn-ghost">Read case study <ArrowUpRight size={17} aria-hidden /></Link>
              </div>
            </div>
            <div className="atlas-grid flex flex-col justify-center border-t border-line p-6 sm:p-9 lg:col-span-5 lg:border-l lg:border-t-0">
              <p className="t-meta text-agent">Deterministic control path</p>
              <ol className="mt-7">
                {PROVING_GROUND_STAGES.map((stage, index) => (
                  <li key={stage} className="relative flex items-center gap-4 pb-6 last:pb-0">
                    {index < PROVING_GROUND_STAGES.length - 1 ? <span className="absolute bottom-0 left-[0.9375rem] top-8 w-px bg-line-2" aria-hidden /> : null}
                    <span className="relative z-10 flex h-8 w-8 items-center justify-center border border-agent/50 bg-canvas font-mono text-xs text-agent">{index + 1}</span>
                    <span className="font-display text-lg font-semibold text-ink">{stage}</span>
                    {stage === 'Verify' ? <span className="ml-auto t-meta text-signal">Hard boundary</span> : null}
                  </li>
                ))}
              </ol>
              <p className="mt-8 border-t border-line pt-5 text-xs text-ink-3">Every visible state comes from the public simulator. Reference traces are not presented as observed model performance.</p>
            </div>
          </div>
        </article>

        <CaseStudyExplorer studies={supporting} evidence={PROJECT_EVIDENCE} />

        <details className="group mt-16 border-y border-line py-6">
          <summary className="flex cursor-pointer list-none flex-wrap items-center gap-4">
            <GitBranch size={20} className="text-signal" aria-hidden />
            <span className="font-display text-xl font-semibold">Curated public source archive</span>
            <span className="t-meta">{repos.length} repositories</span>
            <span className="ml-auto text-sm text-ink-2 group-open:hidden">Inspect code</span>
            <span className="ml-auto hidden text-sm text-ink-2 group-open:inline">Close archive</span>
          </summary>
          <div className="pt-8">
            <p className="t-body mb-6 max-w-2xl text-base">Editorial descriptions remain available when GitHub metadata is unavailable. Stars and update dates are supplemental, not evidence of system quality.</p>
            {repos.length ? (
              <ul className="grid gap-px border border-line bg-line md:grid-cols-2">
                {repos.map(repo => (
                  <li key={repo.name} className="bg-canvas-2 p-5">
                    <div className="flex items-start gap-4">
                      <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="link-draw flex-1 font-display text-lg font-semibold">{repo.name}<span className="sr-only"> on GitHub (opens in a new tab)</span></a>
                      <ArrowUpRight size={16} className="text-ink-3" aria-hidden />
                    </div>
                    <p className="mt-3 min-h-12 text-sm text-ink-2">{repo.description ?? 'No editorial description supplied.'}</p>
                    <div className="t-meta mt-5 flex flex-wrap gap-x-5 gap-y-2">
                      <span>{repo.language ?? 'Mixed source'}</span>
                      <span className="inline-flex items-center gap-1"><Star size={12} aria-hidden /> {repo.stargazers_count} stars</span>
                      <span>Last repository push {repo.pushed_at}</span>
                    </div>
                    {repo.homepage ? (
                      <a href={repo.homepage} target="_blank" rel="noopener noreferrer" className="link-draw mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold">Open public demo or site <ArrowUpRight size={14} aria-hidden /><span className="sr-only"> (opens in a new tab)</span></a>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : <p className="panel p-6 text-ink-2">Curated repositories are temporarily unavailable. <a href={SITE_CONFIG.github} className="text-link">Open GitHub directly</a>.</p>}
            <a href={SITE_CONFIG.github} target="_blank" rel="noopener noreferrer" className="link-draw mt-7 inline-flex items-center gap-2 text-sm font-semibold">Full public GitHub profile <ArrowUpRight size={15} aria-hidden /></a>
          </div>
        </details>
      </div>
    </section>
  )
}
