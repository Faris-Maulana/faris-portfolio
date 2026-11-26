import { describe, expect, it } from 'vitest'
import { branchRun, createRun, MAX_SEED, MIN_SEED, replayRun, SimulationError } from '@/lib/simpul'
import type { OperatorDecision, ScenarioId, SimulationRun } from '@/lib/simpul'

function decisionIndex(run: ReturnType<typeof createRun>): number {
  return run.events.findIndex(event => event.kind === 'decision.proposed')
}

describe('SIMPUL event replay and branching', () => {
  it('reconstructs state at every event without carrying forward future evidence', () => {
    const run = createRun('progressive-degradation', 91)

    for (const event of run.events) {
      const snapshot = replayRun(run, event.index)
      expect(snapshot.eventIndex).toBe(event.index)
      expect(snapshot.tick).toBe(event.tick)
      expect(snapshot.runId).toBe(run.id)
      const futureObservations = run.events.slice(event.index + 1).filter(candidate => candidate.kind === 'observation.recorded').length
      const includedObservations = run.events.slice(0, event.index + 1).filter(candidate => candidate.kind === 'observation.recorded').length
      const allObservations = futureObservations + includedObservations
      expect(snapshot.evidence.length).toBeLessThanOrEqual(run.events.filter(candidate => candidate.kind === 'observation.recorded').flatMap(candidate => candidate.kind === 'observation.recorded' ? candidate.payload.evidence : []).length)
      expect(allObservations).toBe(run.events.filter(candidate => candidate.kind === 'observation.recorded').length)
    }
    expect(replayRun(run, 0).evidence).toHaveLength(0)
    expect(replayRun(run, 0).proposal).toBeNull()
  })

  it('produces the same snapshot on repeated access and after unrelated branches', () => {
    const run = createRun('fiber-cut')
    const index = decisionIndex(run)
    const before = replayRun(run, index + 2)
    branchRun(run, index, { decision: 'reject' })
    const after = replayRun(run, index + 2)

    expect(JSON.stringify(after)).toBe(JSON.stringify(before))
    expect(Object.isFrozen(before.evidence)).toBe(true)
    expect(Object.isFrozen(before.proposal)).toBe(true)
  })

  it('branches at a decision while keeping the original run and prefix immutable', () => {
    const original = createRun('fiber-cut', 72)
    const originalJson = JSON.stringify(original)
    const index = decisionIndex(original)
    const branch = branchRun(original, index, { decision: 'reject' })

    expect(JSON.stringify(original)).toBe(originalJson)
    expect(branch.id).not.toBe(original.id)
    expect(branch.parent).toEqual({ runId: original.id, decisionEventIndex: index, decision: 'reject', approvalId: null })
    expect(branch.events.slice(0, index)).toEqual(original.events.slice(0, index))
    expect(replayRun(branch).evaluation?.code).toBe('operator-rejected')
    expect(replayRun(branch).appliedActions).toHaveLength(0)
    expect(original.events[index].id).not.toBe(branch.events[index].id)
  })

  it('rebinds the branch proposal and every candidate approval to the new run', () => {
    const original = createRun('approval-binding')
    const index = decisionIndex(original)
    const branch = branchRun(original, index, { decision: 'approve', approvalId: 'maint-valid' })
    const decision = branch.events[index]
    if (decision.kind !== 'decision.proposed') throw new Error('Expected proposal')

    expect(decision.payload.proposal.runId).toBe(branch.id)
    expect(new Set(decision.payload.approvals.map(approval => approval.runId))).toEqual(new Set([branch.id]))
    expect(original.events[index]).not.toBe(branch.events[index])
    expect(replayRun(original).evaluation?.code).toBe('approved')
  })

  it('creates deterministic and independent sibling branches', () => {
    const original = createRun('approval-binding')
    const index = decisionIndex(original)
    const first = branchRun(original, index, { decision: 'approve', approvalId: 'maint-expired' })
    const repeated = branchRun(original, index, { decision: 'approve', approvalId: 'maint-expired' })
    const other = branchRun(original, index, { decision: 'approve', approvalId: 'maint-valid' })

    expect(JSON.stringify(first)).toBe(JSON.stringify(repeated))
    expect(first.id).not.toBe(other.id)
    expect(first.events).not.toBe(other.events)
    expect(original.id).not.toBe(first.id)
  })

  it('deeply freezes event records and blocks mutation attempts', () => {
    const run = createRun('prompt-injection')
    const created = run.events[0]
    if (created.kind !== 'run.created') throw new Error('Expected run creation')
    const decision = run.events[decisionIndex(run)]
    if (decision.kind !== 'decision.proposed') throw new Error('Expected proposal')

    expect(Object.isFrozen(created.payload.initialTopology.nodes['jkt-a'])).toBe(true)
    expect(Object.isFrozen(decision.payload.approvals[0])).toBe(true)
    expect(Reflect.set(decision.payload.approvals[0], 'verified', true)).toBe(false)
    expect(decision.payload.approvals[0].verified).toBe(false)
    expect(Reflect.set(run, 'scenarioId', 'approval-binding')).toBe(false)
    expect(run.scenarioId).toBe('prompt-injection')
  })

  it('rejects replay indices outside the recorded event bounds', () => {
    const run = createRun()
    for (const index of [-1, run.events.length, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => replayRun(run, index)).toThrowError(SimulationError)
    }
  })

  it('rejects missing and empty runs with simulator errors instead of property access failures', () => {
    expect(() => replayRun(undefined as unknown as SimulationRun)).toThrowError(SimulationError)
    expect(() => replayRun({ ...createRun(), events: [] })).toThrowError(SimulationError)
    expect(() => branchRun(undefined as unknown as SimulationRun, 0, { decision: 'approve' })).toThrowError(SimulationError)
  })

  it('rejects invalid branch positions and decisions', () => {
    const run = createRun()
    expect(() => branchRun(run, 0, { decision: 'approve' })).toThrow('Branches can start only')
    expect(() => branchRun(run, -1, { decision: 'approve' })).toThrowError(SimulationError)
    expect(() => branchRun(run, decisionIndex(run), { decision: 'execute' as OperatorDecision })).toThrow('approve or reject')
  })

  it('validates scenario and seed boundaries at run creation', () => {
    expect(createRun('fiber-cut', MIN_SEED).seed).toBe(MIN_SEED)
    expect(createRun('fiber-cut', MAX_SEED).seed).toBe(MAX_SEED)
    for (const seed of [0, -1, MAX_SEED + 1, 1.2, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => createRun('fiber-cut', seed)).toThrowError(SimulationError)
    }
    expect(() => createRun('not-a-scenario' as ScenarioId)).toThrow('Unknown SIMPUL scenario')
  })
})
