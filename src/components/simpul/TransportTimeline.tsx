'use client'

import { Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react'
import styles from './simpul.module.css'
import type { SimulationRun } from '@/lib/simpul'

interface TransportTimelineProps {
  readonly run: SimulationRun
  readonly eventIndex: number
  readonly isPlaying: boolean
  readonly onSeek: (index: number) => void
  readonly onTogglePlay: () => void
}

export function TransportTimeline({ run, eventIndex, isPlaying, onSeek, onTogglePlay }: TransportTimelineProps) {
  const lastIndex = run.events.length - 1
  const current = run.events[eventIndex]

  return (
    <section className={styles.transport} aria-labelledby="simpul-transport-heading">
      <div className={styles.transportHead}>
        <div><span className={styles.eyebrow}>Flight recorder transport</span><h2 id="simpul-transport-heading">Event scrubber</h2></div>
        <output className={styles.cursorOutput} aria-live="polite" data-testid="simpul-cursor">Event {eventIndex + 1} of {run.events.length}</output>
      </div>
      <div className={styles.transportControls}>
        <div className={styles.transportButtons} role="group" aria-label="Replay transport controls">
          <button type="button" className={styles.iconButton} onClick={() => onSeek(0)} disabled={eventIndex === 0} aria-label="Restart replay" title="Restart replay"><RotateCcw size={16} aria-hidden /></button>
          <button type="button" className={styles.iconButton} onClick={() => onSeek(eventIndex - 1)} disabled={eventIndex === 0} aria-label="Previous event" title="Previous event"><SkipBack size={16} aria-hidden /></button>
          <button type="button" className={`${styles.iconButton} ${styles.playButton}`} onClick={onTogglePlay} aria-label={isPlaying ? 'Pause replay' : 'Play replay'}>{isPlaying ? <Pause size={17} aria-hidden /> : <Play size={17} aria-hidden />}</button>
          <button type="button" className={styles.iconButton} onClick={() => onSeek(eventIndex + 1)} disabled={eventIndex === lastIndex} aria-label="Next event" title="Next event"><SkipForward size={16} aria-hidden /></button>
        </div>
        <label className={styles.scrubberLabel}>
          <span className={styles.srOnly}>Replay event cursor</span>
          <input
            type="range"
            min="0"
            max={lastIndex}
            step="1"
            value={eventIndex}
            onChange={event => onSeek(Number(event.currentTarget.value))}
            aria-valuetext={`Event ${eventIndex + 1} of ${run.events.length}: ${current.title}`}
            className={styles.scrubber}
          />
        </label>
        <span className={styles.tickReadout}>T+{current.tick}m</span>
      </div>
      <ol className={styles.eventTrack} aria-label="Recorded events">
        {run.events.map((event, index) => (
          <li key={event.id} className={index === eventIndex ? styles.currentEvent : ''}>
            <button
              type="button"
              onClick={() => onSeek(index)}
              aria-current={index === eventIndex ? 'step' : undefined}
              aria-label={`${(index + 1).toString().padStart(2, '0')} ${event.title} ${event.kind} T+${event.tick}m`}
            >
              <span className={styles.eventIndex}>{(index + 1).toString().padStart(2, '0')}</span>{' '}
              <span><strong>{event.title}</strong>{' '}<span className={styles.eventKind}>{event.kind}</span></span>{' '}
              <span className={styles.eventTick}>T+{event.tick}m</span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  )
}
