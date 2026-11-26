'use client'

import { useId, type KeyboardEvent } from 'react'
import styles from './simpul.module.css'
import type { LinkState, NodeState, ReplaySnapshot, ServiceState } from '@/lib/simpul'

export type TopologySelection =
  | { readonly kind: 'node'; readonly id: string }
  | { readonly kind: 'link'; readonly id: string }
  | { readonly kind: 'service'; readonly id: string }

interface NetworkTopologyProps {
  readonly snapshot: ReplaySnapshot
  readonly selection: TopologySelection
  readonly onSelect: (selection: TopologySelection) => void
}

function activate(event: KeyboardEvent<SVGGElement>, callback: () => void) {
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  callback()
}

function healthClass(status: string): string {
  if (status === 'fault' || status === 'down' || status === 'degraded') return styles.affected
  if (status === 'unknown') return styles.unknown
  if (status === 'rerouted') return styles.rerouted
  return styles.nominal
}

function formatMetric(value: number | null, unit: string): string {
  return value === null ? 'Not observed' : `${value} ${unit}`
}

function SelectionInspector({ snapshot, selection }: Pick<NetworkTopologyProps, 'snapshot' | 'selection'>) {
  let title = 'No network selection'
  let status = 'Unknown'
  let rows: Array<[string, string]> = []

  if (selection.kind === 'node') {
    const node = snapshot.topology.nodes[selection.id as keyof typeof snapshot.topology.nodes] as NodeState | undefined
    if (node) {
      title = node.label
      status = node.status
      rows = [['Location', node.location], ['State', node.status]]
    }
  } else if (selection.kind === 'link') {
    const link = snapshot.topology.links[selection.id as keyof typeof snapshot.topology.links] as LinkState | undefined
    if (link) {
      title = `${link.label} / ${link.id}`
      status = link.status
      rows = [
        ['Path', `${snapshot.topology.nodes[link.from].label} to ${snapshot.topology.nodes[link.to].label}`],
        ['State', link.status],
        ['Attenuation', formatMetric(link.attenuationDb, 'dB')],
        ['OSNR', formatMetric(link.osnrDb, 'dB')],
      ]
    }
  } else {
    const service = snapshot.topology.services[selection.id as keyof typeof snapshot.topology.services] as ServiceState | undefined
    if (service) {
      title = service.label
      status = service.status
      rows = [['State', service.status], ['Path', service.path.join(' > ')]]
    }
  }

  return (
    <aside className={styles.selectionInspector} aria-label="Network selection inspector" aria-live="polite">
      <div>
        <span className={styles.eyebrow}>Inspect selection</span>
        <h3>{title}</h3>
      </div>
      <span className={`${styles.statusText} ${healthClass(status)}`}>{status}</span>
      <dl className={styles.inspectorFacts}>
        {rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
      </dl>
    </aside>
  )
}

export function NetworkTopology({ snapshot, selection, onSelect }: NetworkTopologyProps) {
  const titleId = useId()
  const descriptionId = useId()
  const nodes = Object.values(snapshot.topology.nodes)
  const links = Object.values(snapshot.topology.links)
  const services = Object.values(snapshot.topology.services)

  return (
    <figure id="network-topology" className={styles.networkPanel}>
      <figcaption className={styles.panelHeader}>
        <div><span className={styles.eyebrow}>Dominant view / synthetic topology</span><h2>Network state at T+{snapshot.tick}m</h2></div>
        <span className={styles.phaseLabel}>{snapshot.phase.replaceAll('-', ' ')}</span>
      </figcaption>
      <p className={styles.scrollHint}>Wide map: scroll horizontally to inspect every synthetic node, link and service.</p>
      <div className={styles.networkViewport} role="region" aria-label="Scrollable synthetic network topology" tabIndex={0}>
        <svg
          className={styles.networkSvg}
          viewBox="0 0 860 480"
          role="group"
          aria-labelledby={`${titleId} ${descriptionId}`}
        >
          <title id={titleId}>Interactive synthetic fiber topology</title>
          <desc id={descriptionId}>Focus a node, link or service, then press Enter to inspect its replayed state.</desc>
          <defs>
            <pattern id={`${titleId}-grid`} width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0H0V40" className={styles.mapGridLine} />
            </pattern>
          </defs>
          <rect width="860" height="480" className={styles.mapBackground} />
          <rect width="860" height="330" fill={`url(#${titleId}-grid)`} />
          <text x="26" y="38" className={styles.mapCoordinate}>WEST / SYNTHETIC TRANSIT CORE</text>
          <text x="640" y="38" className={styles.mapCoordinate}>EAST / ISLAND</text>

          <g aria-label="Fiber links">
            {links.map(link => {
              const from = snapshot.topology.nodes[link.from]
              const to = snapshot.topology.nodes[link.to]
              const isSelected = selection.kind === 'link' && selection.id === link.id
              return (
                <g
                  key={link.id}
                  className={`${styles.linkGroup} ${isSelected ? styles.selected : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${link.label}, ${link.id}, ${link.status}`}
                  aria-pressed={isSelected}
                  onClick={() => onSelect({ kind: 'link', id: link.id })}
                  onKeyDown={event => activate(event, () => onSelect({ kind: 'link', id: link.id }))}
                >
                  <title>{`${link.label}: ${link.status}. Attenuation ${formatMetric(link.attenuationDb, 'dB')}. OSNR ${formatMetric(link.osnrDb, 'dB')}.`}</title>
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} className={styles.linkHitArea} />
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} className={`${styles.linkLine} ${healthClass(link.status)}`} />
                  <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 11} className={styles.linkLabel}>{link.label}</text>
                </g>
              )
            })}
          </g>

          <g aria-label="Network nodes">
            {nodes.map(node => {
              const isSelected = selection.kind === 'node' && selection.id === node.id
              return (
                <g
                  key={node.id}
                  className={`${styles.nodeGroup} ${isSelected ? styles.selected : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${node.label} ${node.status}, ${node.location}`}
                  aria-pressed={isSelected}
                  onClick={() => onSelect({ kind: 'node', id: node.id })}
                  onKeyDown={event => activate(event, () => onSelect({ kind: 'node', id: node.id }))}
                >
                  <title>{`${node.label}: ${node.status}`}</title>
                  <rect x={node.x - 41} y={node.y - 25} width="82" height="50" className={`${styles.nodeBody} ${healthClass(node.status)}`} />
                  <text x={node.x} y={node.y - 2} className={styles.nodeLabel}>{node.label}</text>{' '}
                  <text x={node.x} y={node.y + 14} className={styles.nodeStatus}>{node.status}</text>
                </g>
              )
            })}
          </g>

          <text x="28" y="348" className={styles.mapCoordinate}>SERVICE IMPACT / CURRENT CURSOR</text>
          <g aria-label="Services">
            {services.map((service, index) => {
              const y = 365 + index * 40
              const isSelected = selection.kind === 'service' && selection.id === service.id
              return (
                <g
                  key={service.id}
                  className={`${styles.serviceGroup} ${isSelected ? styles.selected : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  onClick={() => onSelect({ kind: 'service', id: service.id })}
                  onKeyDown={event => activate(event, () => onSelect({ kind: 'service', id: service.id }))}
                >
                  <rect x="28" y={y - 5} width="804" height="39" className={styles.serviceHitArea} />
                  <rect x="28" y={y} width="804" height="29" className={`${styles.serviceBody} ${healthClass(service.status)}`} />
                  <text x="44" y={y + 19} className={styles.serviceLabel}>{service.label}</text>{' '}
                  <text x="370" y={y + 19} className={styles.servicePath}>{service.path.join(' > ')}</text>{' '}
                  <text x="790" y={y + 19} textAnchor="end" className={styles.serviceStatus}>{service.status}</text>
                </g>
              )
            })}
          </g>
        </svg>
      </div>
      <SelectionInspector snapshot={snapshot} selection={selection} />
    </figure>
  )
}
