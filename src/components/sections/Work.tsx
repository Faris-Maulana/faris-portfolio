import Link from 'next/link'
import { ArrowUpRight, CheckCircle2, FlaskConical, GitBranch, Hammer, Library, Play, Star } from 'lucide-react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { CaseStudyExplorer } from '@/components/work/CaseStudyExplorer'
import { Reveal } from '@/components/ui/Reveal'
import { TiltCard } from '@/components/ui/TiltCard'
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

const STAGES = [
  { name: 'Simulate', note: 'Seeded incident' },
  { name: 'Propose', note: 'Candidate action' },
  { name: 'Verify', note: 'Hard boundary' },
  { name: 'Authorize', note: 'Human decision' },
  { name: 'Replay', note: 'Evidence trace' },
  { name: 'Branch', note: 'Counterfactual' },
]

export function Work({ repos }: { repos: ArchiveRepo[] }) {
  const flagship = CASE_STUDIES.find(study => study.id === 'simpul') ?? CASE_STUDIES[0]
  const supporting = CASE_STUDIES.filter(study => study.id !== flagship.id)
  const StatusIcon = STATUS[flagship.status].icon

  return (
    <section id="work" className="section section-mineral">
      <div className="container">
        <SectionHeader
          label="Selected work / evidence atlas"
          meta={`${CASE_STUDIES.length} cases / evidence before adjectives`}
          title={['Inspectable systems.', <span key="2" className="text-ink-3">Boundaries included.</span>]}
          lead="Run the public implementations, inspect the test sources and read the unresolved work. A reference implementation, a proof of concept and an internal deployment are different claims."
        />

        <Reveal className="flagship-wrap mt-14" data-flagship>
          <TiltCard className="flagship signal-card" max={1.1}>
            <article id={flagship.id} className="flagship-grid scroll-mt-28" data-accent="signal">
              <div className="flagship-brief">
                <div className="flex flex-wrap items-center gap-4">
                  <span className={`status-badge ${STATUS[flagship.status].className}`}><StatusIcon size={13} aria-hidden />{flagship.status}</span>
                  <span className="t-meta">Flagship / {flagship.year}</span>
                </div>
                <p className="flagship-code t-meta">FG / 01 / LOCAL DETERMINISTIC RUNTIME</p>
                <h3>{flagship.title}</h3>
                <p className="t-body mt-6 max-w-2xl">{flagship.problem}</p>
                <div className="flagship-explain">
                  <div><h4 className="t-meta mb-3 text-signal">System</h4><p>{flagship.approach}</p></div>
                  <div><h4 className="t-meta mb-3 text-signal">Evidence boundary</h4><p>{flagship.outcome}</p></div>
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/simpul" className="btn btn-primary">Open proving ground <Play size={16} aria-hidden /></Link>
                  <Link href={`/work/${flagship.id}`} className="btn btn-ghost">Read case study <ArrowUpRight size={17} aria-hidden /></Link>
                </div>
              </div>

              <div className="flagship-path atlas-grid">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="t-meta text-agent">Deterministic control path</p>
                  <span className="chip">No production connection</span>
                </div>
                <ol className="control-path">
                  {STAGES.map((stage, index) => (
                    <li key={stage.name} className={stage.name === 'Verify' ? 'is-boundary' : undefined}>
                      <span className="control-path-index">{String(index + 1).padStart(2, '0')}</span>
                      <span className="control-path-name">{stage.name}</span>
                      <span className="control-path-note">{stage.note}</span>
                    </li>
                  ))}
                </ol>
                <p className="control-path-caption">Every visible state comes from the public simulator. Reference traces are not presented as observed model performance.</p>
              </div>
            </article>
          </TiltCard>
        </Reveal>

        <CaseStudyExplorer studies={supporting} evidence={PROJECT_EVIDENCE} />

        <details className="source-archive group panel">
          <summary>
            <GitBranch size={20} className="text-signal" aria-hidden />
            <span className="font-display text-xl font-semibold">Curated public source archive</span>
            <span className="t-meta">{repos.length} repositories</span>
            <span className="source-archive-action group-open:hidden">Inspect code <ArrowUpRight size={15} aria-hidden /></span>
            <span className="source-archive-action hidden group-open:inline-flex">Close archive</span>
          </summary>
          <div className="source-archive-body">
            <p className="t-body mb-6 max-w-2xl text-base">Editorial descriptions remain available when GitHub metadata is unavailable. Stars and update dates are supplemental, not evidence of system quality.</p>
            {repos.length ? (
              <ul className="source-grid">
                {repos.map(repo => (
                  <li key={repo.name} className="source-card">
                    <div className="flex items-start gap-4">
                      <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="link-draw flex-1 font-display text-lg font-semibold">{repo.name}<span className="sr-only"> on GitHub (opens in a new tab)</span></a>
                      <ArrowUpRight size={16} className="text-ink-3" aria-hidden />
                    </div>
                    <p className="mt-3 text-sm text-ink-2">{repo.description ?? 'No editorial description supplied.'}</p>
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
            ) : <p className="border border-line p-6 text-ink-2">Curated repositories are temporarily unavailable. <a href={SITE_CONFIG.github} className="text-link">Open GitHub directly</a>.</p>}
            <a href={SITE_CONFIG.github} target="_blank" rel="noopener noreferrer" className="link-draw mt-7 inline-flex items-center gap-2 text-sm font-semibold">Full public GitHub profile <ArrowUpRight size={15} aria-hidden /></a>
          </div>
        </details>
      </div>
    </section>
  )
}
