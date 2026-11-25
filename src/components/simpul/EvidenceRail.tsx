'use client'

import { useState } from 'react'
import { FileWarning } from 'lucide-react'
import styles from './simpul.module.css'
import type { EvidenceRecord } from '@/lib/simpul'

function formatReading(value: number | null, unit: string): string {
  return value === null ? 'Not observed' : `${value} ${unit}`
}

export function EvidenceRail({ evidence }: { readonly evidence: readonly EvidenceRecord[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = evidence.find(record => record.id === selectedId) ?? evidence.at(-1) ?? null

  return (
    <aside id="evidence-rail" className={styles.evidenceRail} aria-labelledby="simpul-evidence-heading">
      <div className={styles.panelHeader}>
        <div><span className={styles.eyebrow}>Source boundary</span><h2 id="simpul-evidence-heading">Evidence rail</h2></div>
        <span className={styles.countLabel}>{evidence.length} records</span>
      </div>

      {evidence.length === 0 ? (
        <div className={styles.emptyState}>
          <FileWarning size={20} aria-hidden />
          <h3>No evidence at this cursor</h3>
          <p>Move forward to the first observation event. Missing evidence is never rendered as a zero reading.</p>
        </div>
      ) : (
        <>
          <ol className={styles.evidenceList} aria-label="Evidence available at this cursor">
            {evidence.map((record, index) => (
              <li key={`${record.id}-${index}`}>
                <button
                  type="button"
                  className={`${styles.evidenceRow} ${selected?.id === record.id ? styles.evidenceSelected : ''}`}
                  onClick={() => setSelectedId(record.id)}
                  aria-pressed={selected?.id === record.id}
                >
                  <span className={styles.evidenceRowTop}><strong>{record.source}</strong><span>T+{record.receivedAtTick}m</span></span>
                  <span>{record.summary}</span>
                  <span className={`${styles.qualityLabel} ${record.quality === 'current' ? styles.qualityCurrent : styles.qualityQuarantined}`}>{record.quality}</span>
                </button>
              </li>
            ))}
          </ol>
          {selected ? (
            <article className={styles.evidenceDetail} aria-live="polite" aria-label={`Evidence detail: ${selected.summary}`}>
              <div className={styles.evidenceDetailHead}><span className={styles.eyebrow}>Inspect artifact</span><span>{selected.quality}</span></div>
              <h3>{selected.summary}</h3>
              {selected.quality === 'untrusted' ? <p className={styles.untrustedNotice}><FileWarning size={16} aria-hidden />Untrusted data. Display only, never instructions or authority.</p> : null}
              <pre className={styles.artifactText}>{selected.detail}</pre>
              <dl className={styles.facts}>
                <div><dt>Observed</dt><dd>T+{selected.observedAtTick}m</dd></div>
                <div><dt>Received</dt><dd>T+{selected.receivedAtTick}m</dd></div>
                <div><dt>Targets</dt><dd>{selected.targetIds.join(', ')}</dd></div>
              </dl>
              {selected.readings?.length ? (
                <div className={styles.readings}>
                  <h4>Recorded optical values</h4>
                  {selected.readings.map(reading => (
                    <div key={reading.linkId} className={styles.readingRow}>
                      <strong>{reading.linkId}</strong>
                      <span>Attenuation: {formatReading(reading.attenuationDb, 'dB')}</span>
                      <span>OSNR: {formatReading(reading.osnrDb, 'dB')}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          ) : null}
        </>
      )}
    </aside>
  )
}
