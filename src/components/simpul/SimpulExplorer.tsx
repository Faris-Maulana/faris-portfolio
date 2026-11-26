'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, Play, ShieldAlert } from 'lucide-react'
import {
  branchRun,
  createReplayExport,
  createRun,
  MAX_SEED,
  MIN_SEED,
  replayRun,
  SCENARIOS,
  type OperatorDecision,
  type ScenarioId,
  type SimulationRun,
} from '@/lib/simpul'
import { DecisionPanel } from './DecisionPanel'
import { EvidenceRail } from './EvidenceRail'
import { NetworkTopology, type TopologySelection } from './NetworkTopology'
import { ReviewPath } from './ReviewPath'
import { TransportTimeline } from './TransportTimeline'
import { trackPortfolioEvent } from '@/lib/analytics'
import styles from './simpul.module.css'

export function SimpulExplorer({ initialRun }: { readonly initialRun: SimulationRun }) {
  const [run, setRun] = useState(initialRun)
  const [lineage, setLineage] = useState<SimulationRun[]>([])
  const [selectedScenario, setSelectedScenario] = useState<ScenarioId>(initialRun.scenarioId)
  const [seed, setSeed] = useState(String(initialRun.seed))
  const [eventIndex, setEventIndex] = useState(initialRun.events.length - 1)
  const [isPlaying, setPlaying] = useState(false)
  const [selection, setSelection] = useState<TopologySelection>({ kind: 'service', id: 'svc-critical' })
  const [formError, setFormError] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState('Deterministic reference trace loaded.')
  const snapshot = replayRun(run, eventIndex)
  const definition = SCENARIOS.find(scenario => scenario.id === run.scenarioId) ?? SCENARIOS[0]
  const currentEvent = run.events[eventIndex]
  const lastIndex = run.events.length - 1

  useEffect(() => {
    if (!isPlaying) return
    const timer = window.setTimeout(() => {
      if (eventIndex >= lastIndex) {
        setPlaying(false)
      } else {
        setEventIndex(index => Math.min(index + 1, lastIndex))
      }
    }, eventIndex >= lastIndex ? 0 : 900)
    return () => window.clearTimeout(timer)
  }, [eventIndex, isPlaying, lastIndex])

  const seek = (nextIndex: number) => {
    setPlaying(false)
    setEventIndex(Math.max(0, Math.min(nextIndex, lastIndex)))
  }

  const togglePlay = () => {
    if (isPlaying) {
      setPlaying(false)
      return
    }
    if (eventIndex >= lastIndex) setEventIndex(0)
    setPlaying(true)
  }

  const startRun = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPlaying(false)
    setFormError(null)
    try {
      const next = createRun(selectedScenario, Number(seed))
      setRun(next)
      setLineage([])
      setEventIndex(next.events.length - 1)
      setSelection({ kind: 'service', id: 'svc-critical' })
      setAnnouncement(`Created ${next.id} with ${next.events.length} immutable events.`)
      trackPortfolioEvent({ name: 'simpul_run_created', scenario: next.scenarioId })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'The deterministic run could not be created.')
    }
  }

  const createBranch = (decision: OperatorDecision, approvalId?: string) => {
    if (snapshot.decisionEventIndex === null) return
    setPlaying(false)
    try {
      const next = branchRun(run, snapshot.decisionEventIndex, {
        decision,
        ...(approvalId ? { approvalId } : {}),
      })
      setLineage(parents => [...parents, run])
      setRun(next)
      setEventIndex(next.events.length - 1)
      setAnnouncement(`Created counterfactual branch ${next.id}. Original run preserved.`)
    } catch (error) {
      setAnnouncement(error instanceof Error ? error.message : 'The counterfactual branch could not be created.')
    }
  }

  const returnToParent = () => {
    const parent = lineage.at(-1)
    if (!parent) return
    setRun(parent)
    setLineage(parents => parents.slice(0, -1))
    setEventIndex(parent.events.length - 1)
    setPlaying(false)
    setAnnouncement(`Restored parent run ${parent.id}.`)
  }

  const exportReplay = () => {
    const blob = new Blob([JSON.stringify(createReplayExport(run), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${run.id}.replay.json`
    document.body.append(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
    setAnnouncement(`Replay JSON exported for ${run.id}.`)
    trackPortfolioEvent({ name: 'simpul_replay_exported', scenario: run.scenarioId })
  }

  return (
    <div className={`simpul-scope ${styles.shell}`} data-simpul>
      <header className={styles.hero}>
        <div>
          <Link href="/" className={styles.backLink}><ArrowLeft size={15} aria-hidden />Portfolio</Link>
          <p className={styles.overline}>SIMPUL / FLIGHT RECORDER / SYNTHETIC ONLY</p>
          <h1>SIMPUL</h1>
          <p className={styles.heroLead}>A replayable proving ground for AI-controlled synthetic fiber infrastructure.</p>
        </div>
        <div className={styles.heroBrief}>
          <span className={styles.instrumentLabel}>Local deterministic instrument</span>
          <p>Exercise evidence quality, typed tool proposals and authorization boundaries. Scrub every event, inspect the network at that cursor, then branch a decision without rewriting history.</p>
          <p className={styles.scopeNotice}><ShieldAlert size={17} aria-hidden />No live model, production telemetry, production control, sign up or API key. Reference traces are deterministic, not measured model outcomes.</p>
        </div>
      </header>

      <form className={styles.runBar} onSubmit={startRun} aria-label="Create deterministic run">
        <label className={styles.scenarioField}>
          <span>Scenario</span>
          <select value={selectedScenario} onChange={event => setSelectedScenario(event.currentTarget.value as ScenarioId)}>
            {SCENARIOS.map(scenario => <option key={scenario.id} value={scenario.id}>{scenario.name}</option>)}
          </select>
        </label>
        <label className={styles.seedField}>
          <span>Seed</span>
          <input type="number" min={MIN_SEED} max={MAX_SEED} step="1" required value={seed} onChange={event => setSeed(event.currentTarget.value)} />
        </label>
        <button type="submit" className={`${styles.button} ${styles.actionButton}`}><Play size={16} aria-hidden />Create deterministic run</button>
        <p className={styles.runBarNote}>Same scenario and seed, same event log. Execution stays in this browser.</p>
      </form>
      {formError ? <p className={styles.formError} role="alert">{formError}</p> : null}

      <section className={styles.recorder} aria-labelledby="simpul-recorder-heading">
        <header className={styles.recorderHeader}>
          <div>
            <span className={styles.eyebrow}>Active recording / {definition.shortName}</span>
            <h2 id="simpul-recorder-heading">{definition.name}</h2>
            <p>{definition.synopsis}</p>
            <p className={styles.objective}><strong>Review objective:</strong> {definition.learningObjective}</p>
          </div>
          <div className={styles.runIdentity}>
            <span className={styles.referenceLabel}>Deterministic reference run</span>
            <code>{run.id}</code>
            <span>Seed {run.seed} / {run.events.length} events</span>
            {run.parent ? <span>Branch of {run.parent.runId}</span> : <span>Root run / immutable source</span>}
          </div>
        </header>

        <nav className={styles.recorderNav} aria-label="Recorder sections">
          <a href="#current-event">Current event</a>
          <a href="#network-topology">Topology</a>
          <a href="#evidence-rail">Evidence</a>
          <a href="#policy-gate">Policy gate</a>
        </nav>

        <ReviewPath events={run.events} eventIndex={eventIndex} onSeek={seek} />

        <div className={styles.workspace}>
          <div className={styles.primaryColumn}>
            <NetworkTopology snapshot={snapshot} selection={selection} onSelect={setSelection} />
            <TransportTimeline run={run} eventIndex={eventIndex} isPlaying={isPlaying} onSeek={seek} onTogglePlay={togglePlay} />
          </div>
          <EvidenceRail evidence={snapshot.evidence} />
        </div>

        <div className={styles.lowerGrid}>
          <section className={styles.eventInspector} aria-labelledby="simpul-event-inspector-heading">
            <div className={styles.panelHeader}>
              <div><span className={styles.eyebrow}>Selection / immutable record</span><h2 id="simpul-event-inspector-heading">Event inspector</h2></div>
              <span className={styles.countLabel}>E{(eventIndex + 1).toString().padStart(2, '0')}</span>
            </div>
            <div className={styles.eventInspectorBody}>
              <dl className={`${styles.facts} ${styles.eventFacts}`}>
                <div><dt>Event ID</dt><dd className={styles.breakable}>{currentEvent.id}</dd></div>
                <div><dt>Tick</dt><dd>T+{currentEvent.tick}m</dd></div>
                <div><dt>Index</dt><dd>{currentEvent.index}</dd></div>
                <div><dt>Evidence loaded</dt><dd>{snapshot.evidence.length} records at cursor</dd></div>
                <div><dt>Actions applied</dt><dd>{snapshot.appliedActions.length} at cursor</dd></div>
              </dl>
              <details className={styles.schemaDetails}>
                <summary>Inspect immutable event payload</summary>
                <pre>{JSON.stringify(currentEvent.payload, null, 2)}</pre>
              </details>
            </div>
          </section>

          <DecisionPanel
            key={`${run.id}:${snapshot.decisionEventIndex ?? 'none'}`}
            snapshot={snapshot}
            hasParent={lineage.length > 0}
            onBranch={createBranch}
            onReturnToParent={returnToParent}
          />
        </div>

        <footer className={styles.recorderFooter}>
          <div>
            <span className={styles.eyebrow}>Trace boundary</span>
            <p>Actions update synthetic replay state only. No external simulator or service, model provider, production telemetry or production-control request is connected. Run and replay-export analytics record only scenario identifiers; shared navigation and assistant controls emit separate, privacy-bounded interaction counts.</p>
          </div>
          <button type="button" className={`${styles.button} ${styles.secondaryButton}`} onClick={exportReplay}><Download size={16} aria-hidden />Export replay JSON</button>
        </footer>
      </section>

      <p className={styles.srOnly} role="status" aria-live="polite">{announcement}</p>
      <aside className={styles.methodNote} aria-label="Method and evaluation scope">
        <span className={styles.eyebrow}>Method note</span>
        <p>The local TypeScript event store is the execution engine. Typed tools and proposals are data contracts for this reference controller. Baseline comparisons and model quality scores are excluded because no live model run is measured here.</p>
      </aside>
    </div>
  )
}
