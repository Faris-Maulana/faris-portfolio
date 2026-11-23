import { ArrowUpRight, CheckCircle2, FlaskConical, GitBranch, Hammer, Star } from 'lucide-react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Reveal } from '@/components/ui/Reveal'
import { CASE_STUDIES, SITE_CONFIG, type CaseStatus } from '@/lib/constants'

const STATUS: Record<CaseStatus, { icon: typeof Hammer; className: string }> = {
  'In development': { icon: Hammer, className: 'text-signal border-signal/40' },
  'Proof of concept': { icon: FlaskConical, className: 'text-cred border-cred/40' },
  Shipped: { icon: CheckCircle2, className: 'text-data border-data/40' },
}

export interface ArchiveRepo {
  name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  pushed_at: string
}

const GRAPH_STAGES = ['Discover', 'Plan', 'Generate', 'Validate', 'Execute', 'Explain']

export function Work({ repos }: { repos: ArchiveRepo[] }) {
  const [flagship, ...supporting] = CASE_STUDIES

  return (
    <section id="work" className="section section-mineral">
      <div className="container">
        <SectionHeader
          index="02"
          label="Selected work"
          meta={`${CASE_STUDIES.length} public case studies`}
          title={['Engineering evidence.', <span key="2" className="text-ink-3">Maturity included.</span>]}
          lead="Each case separates the problem, system boundary, evaluation and unresolved work. In development means exactly that. Proof of concept is not relabelled as production."
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
                <div><h4 className="t-meta mb-3 text-signal">Architecture</h4><p className="text-sm text-ink-2">{flagship.approach}</p></div>
                <div><h4 className="t-meta mb-3 text-signal">Current position</h4><p className="text-sm text-ink-2">{flagship.outcome}</p></div>
              </div>
              <a href={`/work/${flagship.id}`} className="btn btn-primary mt-8">Open case study <ArrowUpRight size={17} aria-hidden /></a>
            </div>
            <div className="atlas-grid flex flex-col justify-center border-t border-line p-6 sm:p-9 lg:col-span-5 lg:border-l lg:border-t-0">
              <p className="t-meta text-agent">Controlled query path</p>
              <ol className="mt-7">
                {GRAPH_STAGES.map((stage, index) => (
                  <li key={stage} className="relative flex items-center gap-4 pb-6 last:pb-0">
                    {index < GRAPH_STAGES.length - 1 ? <span className="absolute bottom-0 left-[0.9375rem] top-8 w-px bg-line-2" aria-hidden /> : null}
                    <span className="relative z-10 flex h-8 w-8 items-center justify-center border border-agent/50 bg-canvas font-mono text-xs text-agent">{index + 1}</span>
                    <span className="font-display text-lg font-semibold text-ink">{stage}</span>
                    {stage === 'Validate' ? <span className="ml-auto t-meta text-signal">Hard boundary</span> : null}
                  </li>
                ))}
              </ol>
              <p className="mt-8 border-t border-line pt-5 text-xs text-ink-3">Stage separation makes failure local and testable. Diagram is architectural, not a live execution trace.</p>
            </div>
          </div>
        </article>

        <div className="mt-8 border-t border-line">
          {supporting.map((study, index) => {
            const StatusIcon = STATUS[study.status].icon
            return (
              <Reveal key={study.id} as="article" delay={index * 50} className="group grid gap-6 border-b border-line py-8 lg:grid-cols-12 lg:items-center lg:py-10" id={study.id}>
                <div className="flex items-center gap-3 lg:col-span-3 lg:block">
                  <span className="t-meta text-ink-3 lg:block">0{index + 2} / {study.year}</span>
                  <span className={`mt-0 inline-flex items-center gap-2 border px-2 py-1 font-mono text-xs lg:mt-4 ${STATUS[study.status].className}`}><StatusIcon size={12} aria-hidden />{study.status}</span>
                </div>
                <div className="lg:col-span-6">
                  <p className="t-meta mb-2">{study.org}</p>
                  <h3 className="t-h3">{study.title}</h3>
                  <p className="t-body mt-3 text-base">{study.problem}</p>
                  <ul className="mt-4 flex flex-wrap gap-2" aria-label="Technology stack">{study.stack.slice(0, 4).map(item => <li key={item} className="chip">{item}</li>)}</ul>
                </div>
                <div className="lg:col-span-3 lg:text-right">
                  <a href={`/work/${study.id}`} className="link-draw inline-flex items-center gap-2 text-sm font-semibold">Read decisions and limits <ArrowUpRight size={16} aria-hidden /></a>
                </div>
              </Reveal>
            )
          })}
        </div>

        <details className="group mt-16 border-y border-line py-6">
          <summary className="flex cursor-pointer list-none flex-wrap items-center gap-4">
            <GitBranch size={20} className="text-signal" aria-hidden />
            <span className="font-display text-xl font-semibold">Curated public source archive</span>
            <span className="t-meta">{repos.length} repositories</span>
            <span className="ml-auto text-sm text-ink-2 group-open:hidden">Inspect code</span>
            <span className="ml-auto hidden text-sm text-ink-2 group-open:inline">Close archive</span>
          </summary>
          <div className="pt-8">
            <p className="t-body mb-6 max-w-2xl text-base">A hand-selected public list, not a recency ranking. Private repository metadata is never requested or rendered.</p>
            {repos.length ? (
              <ul className="grid gap-px border border-line bg-line md:grid-cols-2">
                {repos.map(repo => (
                  <li key={repo.name} className="bg-canvas-2 p-5">
                    <div className="flex items-start gap-4">
                      <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="link-draw flex-1 font-display text-lg font-semibold">{repo.name}<span className="sr-only"> on GitHub (opens in a new tab)</span></a>
                      <ArrowUpRight size={16} className="text-ink-3" aria-hidden />
                    </div>
                    <p className="mt-3 min-h-12 text-sm text-ink-2">{repo.description ?? 'No public repository description provided.'}</p>
                    <div className="t-meta mt-5 flex flex-wrap gap-x-5 gap-y-2">
                      <span>{repo.language ?? 'Mixed source'}</span>
                      <span className="inline-flex items-center gap-1"><Star size={12} aria-hidden /> {repo.stargazers_count} stars</span>
                      <span>Updated {repo.pushed_at}</span>
                    </div>
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
