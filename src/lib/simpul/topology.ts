import { immutable } from './immutable'
import type { LinkId, NodeId, ServiceId, TopologyPatch, TopologySnapshot } from './types'

const NODES = {
  'jkt-a': { id: 'jkt-a', label: 'JKT-A', location: 'West landing', x: 90, y: 180, status: 'nominal' },
  'jkt-b': { id: 'jkt-b', label: 'JKT-B', location: 'West core', x: 260, y: 75, status: 'nominal' },
  'bdg-a': { id: 'bdg-a', label: 'BDG-A', location: 'South transit', x: 275, y: 275, status: 'nominal' },
  'sby-a': { id: 'sby-a', label: 'SBY-A', location: 'East core', x: 510, y: 105, status: 'nominal' },
  'sby-b': { id: 'sby-b', label: 'SBY-B', location: 'East transit', x: 545, y: 265, status: 'nominal' },
  'dps-a': { id: 'dps-a', label: 'DPS-A', location: 'Island landing', x: 760, y: 175, status: 'nominal' },
} as const

const LINKS = {
  'core-west': { id: 'core-west', label: 'CW-01', from: 'jkt-a', to: 'jkt-b', status: 'nominal', attenuationDb: null, osnrDb: null },
  'metro-south': { id: 'metro-south', label: 'MS-02', from: 'jkt-a', to: 'bdg-a', status: 'nominal', attenuationDb: null, osnrDb: null },
  'central-span': { id: 'central-span', label: 'CS-07', from: 'jkt-b', to: 'sby-a', status: 'nominal', attenuationDb: null, osnrDb: null },
  'south-span': { id: 'south-span', label: 'SS-04', from: 'bdg-a', to: 'sby-b', status: 'nominal', attenuationDb: null, osnrDb: null },
  'east-span': { id: 'east-span', label: 'ES-03', from: 'sby-a', to: 'sby-b', status: 'nominal', attenuationDb: null, osnrDb: null },
  'island-span': { id: 'island-span', label: 'IS-09', from: 'sby-b', to: 'dps-a', status: 'nominal', attenuationDb: null, osnrDb: null },
} as const

const SERVICES = {
  'svc-critical': { id: 'svc-critical', label: 'Critical transport', path: ['core-west', 'central-span', 'east-span', 'island-span'], status: 'nominal' },
  'svc-backup': { id: 'svc-backup', label: 'Protected transport', path: ['metro-south', 'south-span', 'island-span'], status: 'nominal' },
  'svc-control': { id: 'svc-control', label: 'Management plane', path: ['central-span', 'east-span'], status: 'nominal' },
} as const

export function createInitialTopology(): TopologySnapshot {
  return immutable({ nodes: NODES, links: LINKS, services: SERVICES })
}

/** Applies an event patch without mutating the preceding replay snapshot. */
export function applyTopologyPatch(topology: TopologySnapshot, patch: TopologyPatch): TopologySnapshot {
  const nodes = { ...topology.nodes }
  const links = { ...topology.links }
  const services = { ...topology.services }

  for (const update of patch.nodes ?? []) {
    nodes[update.id] = { ...nodes[update.id], status: update.status }
  }
  for (const update of patch.links ?? []) {
    links[update.id] = { ...links[update.id], ...update }
  }
  for (const update of patch.services ?? []) {
    services[update.id] = { ...services[update.id], status: update.status }
  }

  return immutable({ nodes, links, services })
}

export const NETWORK_IDS = immutable({
  nodes: Object.keys(NODES) as NodeId[],
  links: Object.keys(LINKS) as LinkId[],
  services: Object.keys(SERVICES) as ServiceId[],
})
