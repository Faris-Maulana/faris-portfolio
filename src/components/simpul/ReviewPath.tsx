'use client'

import { CornerDownRight, RotateCcw } from 'lucide-react'
import type { RunEvent } from '@/lib/simpul'
import styles from './simpul.module.css'

const STAGES = [
  { label: 'Incident', kind: 'incident.detected' },
  { label: 'Evidence', kind: 'assessment.recorded' },
  { label: 'Proposal', kind: 'decision.proposed' },
  { label: 'Policy', kind: 'policy.evaluated' },
  { label: 'Outcome', kind: 'run.completed' },
] as const satisfies readonly { label: string; kind: RunEvent['kind'] }[]

export function ReviewPath({ events, eventIndex, onSeek }: {
  readonly events: readonly RunEvent[]
  readonly eventIndex: number
  readonly onSeek: (index: number) => void
}) {
  const current = events[eventIndex]
  const proposalIndex = events.findIndex(event => event.kind === 'decision.proposed')

  return (
    <section id="current-event" className={styles.reviewPanel} aria-labelledby="simpul-review-heading">
      <div className={styles.reviewHeader}>
        <div><span className={styles.eyebrow}>Guided review / cursor {eventIndex + 1} of {events.length}</span><h2 id="simpul-review-heading">Review path</h2></div>
        <div className={styles.reviewActions} role="group" aria-label="Guided review shortcuts">
          <button type="button" className={styles.textButton} onClick={() => onSeek(0)} disabled={eventIndex === 0}><RotateCcw size={14} aria-hidden />Review from start</button>
          <button type="button" className={styles.textButton} onClick={() => onSeek(proposalIndex)} disabled={proposalIndex < 0 || eventIndex === proposalIndex}><CornerDownRight size={14} aria-hidden />Jump to proposal</button>
        </div>
      </div>

      <div className={styles.reviewBody}>
        <ol className={styles.reviewStages} aria-label="Incident review stages">
          {STAGES.map(stage => {
            const index = events.findIndex(event => event.kind === stage.kind)
            return (
              <li key={stage.kind}>
                <button
                  type="button"
                  onClick={() => onSeek(index)}
                  disabled={index < 0}
                  aria-current={index === eventIndex ? 'step' : undefined}
                  aria-label={`Seek ${stage.label} review stage`}
                >
                  <span className={styles.reviewStageDot} aria-hidden />{stage.label}
                </button>
              </li>
            )
          })}
        </ol>
        <div className={styles.currentEventSummary}>
          <span className={styles.eventType}>{current.kind} / T+{current.tick}m</span>
          <h3>{current.title}</h3>
          <p className={styles.eventDetail}>{current.detail}</p>
        </div>
      </div>
    </section>
  )
}
