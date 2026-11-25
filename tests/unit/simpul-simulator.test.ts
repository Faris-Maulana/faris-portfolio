import { describe, expect, it } from 'vitest'
import {
  branchRun,
  createReplayExport,
  createRun,
  replayRun,
  SCENARIO_IDS,
  TOOL_CATALOG,
} from '@/lib/simpul'
import type { DecisionProposedPayload, PolicyEvaluatedPayload, RunEvent } from '@/lib/simpul'

function payloadAt(run: ReturnType<typeof createRun>, kind: RunEvent['kind']): RunEvent['payload'] {
  const event = run.events.find(candidate => candidate.kind === kind)
  if (!event) throw new Error(`Missing ${kind}`)
  return event.payload
}

function decisionIndex(run: ReturnType<typeof createRun>): number {
  return run.events.findIndex(event => event.kind === 'decision.proposed')
}

describe('SIMPUL deterministic simulator', () => {
  it.each(SCENARIO_IDS)('creates a complete immutable trace for %s', scenarioId => {
    const run = createRun(scenarioId, 4172)
    const final = replayRun(run)

    expect(run.scenarioId).toBe(scenarioId)
    expect(run.traceType).toBe('deterministic-reference')
    expect(run.events.map(event => event.index)).toEqual(run.events.map((_, index) => index))
    expect(final.phase).toBe('complete')
    expect(final.completion).not.toBeNull()
    expect(final.proposal?.runId).toBe(run.id)
    expect(Object.isFrozen(run)).toBe(true)
    expect(Object.isFrozen(run.events)).toBe(true)
    expect(Object.isFrozen(final.topology)).toBe(true)
  })

  it('replays identical scenario and seed inputs byte for byte', () => {
    const first = createRun('progressive-degradation', 912833)
    const second = createRun('progressive-degradation', 912833)

    expect(JSON.stringify(first)).toBe(JSON.stringify(second))
    expect(JSON.stringify(createReplayExport(first))).toBe(JSON.stringify(createReplayExport(second)))
  })

  it("uses the seed for synthetic evidence instead of only relabeling a run", () => {
    const first = createRun('progressive-degradation', 11)
    const second = createRun('progressive-degradation', 12)
    const readings = (run: ReturnType<typeof createRun>) => run.events
      .filter(event => event.kind === 'observation.recorded')
      .flatMap(event => event.kind === 'observation.recorded' ? event.payload.evidence : [])
      .map(record => record.readings?.[0]?.attenuationDb)

    expect(first.id).not.toBe(second.id)
    expect(readings(first)).not.toEqual(readings(second))
  })

  it('models a hard cut and keeps the physical fault after service rerouting', () => {
    const run = createRun('fiber-cut')
    const final = replayRun(run)

    expect(final.topology.links['core-west'].status).toBe('fault')
    expect(final.topology.services['svc-critical'].status).toBe('rerouted')
    expect(final.appliedActions).toHaveLength(1)
    expect(final.appliedActions[0].result).toBe('simulated')
  })

  it('records ordered degradation with increasing attenuation and decreasing OSNR', () => {
    const run = createRun('progressive-degradation')
    const readings = run.events.flatMap(event => event.kind === 'observation.recorded' ? event.payload.evidence : [])
      .flatMap(record => record.readings ?? [])

    expect(readings).toHaveLength(3)
    expect(readings[0].attenuationDb!).toBeLessThan(readings[1].attenuationDb!)
    expect(readings[1].attenuationDb!).toBeLessThan(readings[2].attenuationDb!)
    expect(readings[0].osnrDb!).toBeGreaterThan(readings[2].osnrDb!)
    expect(replayRun(run).topology.links['central-span'].attenuationDb).toBe(readings[2].attenuationDb)
  })

  it('retains duplicate and stale NMS artifacts while using only current state', () => {
    const run = createRun('alert-storm', 22)
    const first = replayRun(run, 1)
    const final = replayRun(run)
    const qualities = first.evidence.map(record => record.quality)

    expect(qualities.filter(quality => quality === 'current')).toHaveLength(1)
    expect(qualities.filter(quality => quality === 'duplicate').length).toBeGreaterThanOrEqual(2)
    expect(qualities.filter(quality => quality === 'stale')).toHaveLength(2)
    expect(final.topology.links['core-west'].status).toBe('fault')
    expect(final.appliedActions[0].action).toBe('correlate-alerts')
  })

  it('keeps missing and contradictory telemetry explicitly unknown', () => {
    const run = createRun('missing-telemetry')
    const final = replayRun(run)
    const optical = final.evidence.find(record => record.id === 'optical-missing')

    expect(final.topology.links['central-span'].status).toBe('unknown')
    expect(final.topology.services['svc-critical'].status).toBe('unknown')
    expect(optical?.readings?.[0]).toEqual({ linkId: 'central-span', attenuationDb: null, osnrDb: null })
    expect(final.completion?.outcome).toBe('awaiting-evidence')
  })

  it('fails closed for indirect injection despite an explicit approval claim', () => {
    const run = createRun('prompt-injection')
    const final = replayRun(run)
    const decision = payloadAt(run, 'decision.proposed') as DecisionProposedPayload
    const policy = payloadAt(run, 'policy.evaluated') as PolicyEvaluatedPayload

    expect(final.evidence.filter(record => record.quality === 'untrusted')).toHaveLength(2)
    expect(decision.approvals[0].statement).toContain('Fully verified approval')
    expect(decision.approvals[0].verified).toBe(false)
    expect(policy.evaluation.code).toBe('approval-unverified')
    expect(final.appliedActions).toHaveLength(0)
    expect(final.completion?.outcome).toBe('blocked')
  })

  it('provides valid, expired, wrong-target and wrong-action approval variants', () => {
    const run = createRun('approval-binding')
    const decision = payloadAt(run, 'decision.proposed') as DecisionProposedPayload

    expect(decision.approvals.map(approval => approval.id)).toEqual([
      'maint-valid',
      'maint-expired',
      'maint-wrong-target',
      'maint-wrong-action',
    ])
    for (const [approvalId, code] of [
      ['maint-valid', 'approved'],
      ['maint-expired', 'approval-expired'],
      ['maint-wrong-target', 'approval-target-mismatch'],
      ['maint-wrong-action', 'approval-action-mismatch'],
    ] as const) {
      const branch = branchRun(run, decisionIndex(run), { decision: 'approve', approvalId })
      expect(replayRun(branch).evaluation?.code).toBe(code)
    }
  })

  it('exports a self-contained deterministic replay without wall-clock data', () => {
    const first = createReplayExport(createRun('fiber-cut', 33))
    const second = createReplayExport(createRun('fiber-cut', 33))

    expect(first.schema).toBe('simpul.replay.v1')
    expect(first.notice).toContain('No live model inference')
    expect(first.run.events.length).toBeGreaterThan(4)
    expect(JSON.stringify(first)).toBe(JSON.stringify(second))
    expect(JSON.stringify(first)).not.toContain('exportedAt')
  })

  it('exposes tool definitions as typed data matching every proposal', () => {
    for (const scenarioId of SCENARIO_IDS) {
      const run = createRun(scenarioId)
      const decision = payloadAt(run, 'decision.proposed') as DecisionProposedPayload
      const tool = TOOL_CATALOG[decision.proposal.tool]
      expect(tool.action).toBe(decision.proposal.action)
      expect(tool.inputSchema.required).toEqual(['runId', 'target'])
      expect(tool.inputSchema.additionalProperties).toBe(false)
    }
  })
})
