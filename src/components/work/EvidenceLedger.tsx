import Link from 'next/link'
import { ArrowUpRight, CircleAlert, Code2, Database, Eye, Play, Terminal } from 'lucide-react'
import {
  DATA_EXPOSURE_LABELS,
  EVIDENCE_LEVEL_LABELS,
  LIFECYCLE_LABELS,
  type EvidenceArtifact,
  type ProjectEvidence,
} from '@/lib/evidence'

function ArtifactLink({ artifact, currentRoute }: { artifact: EvidenceArtifact; currentRoute: string }) {
  if (artifact.location.type === 'external') {
    return (
      <a href={artifact.location.url} target="_blank" rel="noopener noreferrer" className="link-draw inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink">
        Open pinned artifact <ArrowUpRight size={15} aria-hidden />
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    )
  }

  if (artifact.location.route === currentRoute) {
    return <span className="inline-flex min-h-11 items-center text-sm text-ink-3">Recorded on this page</span>
  }

  return (
    <Link href={artifact.location.route} className="link-draw inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink">
      Open local artifact <ArrowUpRight size={15} aria-hidden />
    </Link>
  )
}

function verificationCopy(artifact: EvidenceArtifact): string {
  const verification = artifact.verification
  if (verification.method === 'artifact-inspection') return `Artifact inspected ${verification.inspectedAt}; not rerun here`
  if (verification.method === 'local-run') return `Executed locally ${verification.observedAt}`
  return 'Reference only; no execution result attached'
}

export function EvidenceLedger({ evidence, currentRoute }: { evidence: ProjectEvidence; currentRoute: string }) {
  return (
    <section id="evidence" className="scroll-mt-28 border-y border-line py-14" aria-labelledby="evidence-title">
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="kicker">Public evidence ledger</p>
          <h2 id="evidence-title" className="t-h3 mt-5">Inspect the artifact.<br />Read its boundary.</h2>
          <p className="t-body mt-5 text-base">{evidence.summary}</p>
        </div>
        <dl className="grid self-start border border-line sm:grid-cols-3 lg:col-span-8">
          <div className="border-b border-line p-5 sm:border-b-0 sm:border-r">
            <dt className="t-meta">Lifecycle</dt>
            <dd className="mt-2 text-sm font-semibold text-ink">{LIFECYCLE_LABELS[evidence.lifecycle]}</dd>
          </div>
          <div className="border-b border-line p-5 sm:border-b-0 sm:border-r">
            <dt className="t-meta">Strongest evidence</dt>
            <dd className="mt-2 text-sm font-semibold text-ink">{EVIDENCE_LEVEL_LABELS[evidence.evidenceLevel]}</dd>
          </div>
          <div className="p-5">
            <dt className="t-meta inline-flex items-center gap-2"><Database size={13} aria-hidden /> Data exposure</dt>
            <dd className="mt-2 text-sm font-semibold text-ink">{DATA_EXPOSURE_LABELS[evidence.dataExposure]}</dd>
          </div>
        </dl>
      </div>

      <p className="mt-8 flex max-w-4xl gap-3 border-l border-data pl-4 text-sm text-ink-2">
        <CircleAlert size={17} className="mt-0.5 shrink-0 text-data" aria-hidden />
        <span><strong className="text-ink">Data boundary:</strong> {evidence.dataBoundary}</span>
      </p>

      <ol className="mt-10 border-t border-line">
        {evidence.artifacts.map((artifact, index) => (
          <li key={artifact.id} className="grid gap-6 border-b border-line py-7 lg:grid-cols-12 lg:gap-8">
            <div className="flex gap-4 lg:col-span-4">
              <span className="t-meta mt-1 text-signal">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <p className="t-meta text-ink-3">{artifact.kind.replaceAll('-', ' ')}</p>
                <h3 className="mt-2 font-display text-xl font-semibold text-ink">{artifact.title}</h3>
                <p className="t-meta mt-3">{DATA_EXPOSURE_LABELS[artifact.dataExposure]}</p>
              </div>
            </div>
            <div className="space-y-4 lg:col-span-5">
              <p className="flex gap-3 text-sm text-ink-2"><Eye size={16} className="mt-0.5 shrink-0 text-agent" aria-hidden />{verificationCopy(artifact)}</p>
              <p className="flex gap-3 text-sm text-ink-2"><CircleAlert size={16} className="mt-0.5 shrink-0 text-signal" aria-hidden />{artifact.resultBoundary}</p>
              {artifact.commitLabel ? <p className="t-meta">Revision: {artifact.sourceRevision?.slice(0, 12)} / {artifact.commitLabel}</p> : null}
              {artifact.reproductionCommand ? (
                <div className="overflow-hidden border border-line bg-canvas-2">
                  <p className="t-meta flex items-center gap-2 border-b border-line px-3 py-2"><Terminal size={13} aria-hidden /> Reproduce in the source repository</p>
                  <code className="block overflow-x-auto whitespace-pre-wrap break-all p-3 font-mono text-xs text-ink-2">{artifact.reproductionCommand}</code>
                </div>
              ) : null}
              {artifact.verification.method === 'local-run' && artifact.reproductionCommand !== artifact.verification.command ? (
                <p className="flex gap-2 text-xs text-ink-3"><Play size={14} className="shrink-0" aria-hidden /> Observed command: <code className="break-all font-mono">{artifact.verification.command}</code></p>
              ) : null}
            </div>
            <div className="flex items-start lg:col-span-3 lg:justify-end"><ArtifactLink artifact={artifact} currentRoute={currentRoute} /></div>
          </li>
        ))}
      </ol>

      <div className="mt-10 grid gap-6 border-l-2 border-signal bg-canvas-2 p-6 sm:p-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="t-meta inline-flex items-center gap-2 text-signal"><Code2 size={15} aria-hidden /> Next evidence</p>
          <h3 className="mt-3 font-display text-2xl font-semibold text-ink">Not available yet.</h3>
        </div>
        <ul className="space-y-3 lg:col-span-8">
          {evidence.nextEvidence.map(item => <li key={item} className="flex gap-3 text-sm text-ink-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 bg-signal" aria-hidden />{item}</li>)}
        </ul>
      </div>
    </section>
  )
}
