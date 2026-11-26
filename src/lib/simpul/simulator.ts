import { immutable } from './immutable'
import { authorizeProposal } from './policy'
import { applyApprovedEffect, buildScenarioScript, SCENARIOS, type ScenarioScript } from './scenarios'
import { applyTopologyPatch, createInitialTopology } from './topology'
import {
  SCENARIO_IDS,
  type ActionProposal,
  type ApprovalArtifact,
  type OperatorDecision,
  type ReplaySnapshot,
  type RunEvent,
  type ScenarioEventDraft,
  type ScenarioId,
  type SimulationRun,
  type TopologySnapshot,
} from './types'

export const DEFAULT_SCENARIO_ID: ScenarioId = 'fiber-cut'
export const DEFAULT_SEED = 4172
export const MIN_SEED = 1
export const MAX_SEED = 4_294_967_295

export type SimulationErrorCode = 'invalid-scenario' | 'invalid-seed' | 'invalid-event-index' | 'invalid-decision' | 'invalid-run'

export class SimulationError extends Error {
  readonly code: SimulationErrorCode

  constructor(code: SimulationErrorCode, message: string) {
    super(message)
    this.name = 'SimulationError'
    this.code = code
  }
}

function assertScenarioId(value: string): asserts value is ScenarioId {
  if (!(SCENARIO_IDS as readonly string[]).includes(value)) {
    throw new SimulationError('invalid-scenario', `Unknown SIMPUL scenario: ${value}`)
  }
}

function assertSeed(seed: number): void {
  if (!Number.isSafeInteger(seed) || seed < MIN_SEED || seed > MAX_SEED) {
    throw new SimulationError('invalid-seed', `Seed must be an integer from ${MIN_SEED} through ${MAX_SEED}.`)
  }
}

function assertDecisionIndex(run: SimulationRun, eventIndex: number): void {
  if (!Number.isInteger(eventIndex) || eventIndex < 0 || eventIndex >= run.events.length) {
    throw new SimulationError('invalid-event-index', `Decision event index must be between 0 and ${Math.max(0, run.events.length - 1)}.`)
  }
}

function rootRunId(scenarioId: ScenarioId, seed: number): string {
  return `simpul-${scenarioId}-${seed.toString(16).padStart(8, '0')}`
}

function branchRunId(run: SimulationRun, eventIndex: number, decision: OperatorDecision, approvalId: string | undefined): string {
  const source = `${run.id}|${eventIndex}|${decision}|${approvalId ?? 'none'}`
  let hash = 0x811c9dc5
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return `${run.id}-cf-${(hash >>> 0).toString(16).padStart(8, '0')}`
}

function eventId(runId: string, index: number): string {
  return `${runId}:e${index.toString().padStart(2, '0')}`
}

function stampEvent(runId: string, index: number, draft: ScenarioEventDraft): RunEvent {
  return immutable({ ...draft, id: eventId(runId, index), index }) as RunEvent
}

function proposalFromTemplate(runId: string, script: ScenarioScript): ActionProposal {
  return immutable({
    id: `${runId}:proposal`,
    runId,
    ...script.decision,
  })
}

function approvalsForRun(runId: string, script: ScenarioScript): readonly ApprovalArtifact[] {
  return script.approvals.map(template => immutable({
    ...template,
    kind: 'maintenance-approval' as const,
    runId,
    issuer: 'maintenance-controller' as const,
  }))
}

function proposalEvent(runId: string, index: number, script: ScenarioScript): RunEvent {
  const proposal = proposalFromTemplate(runId, script)
  return stampEvent(runId, index, {
    kind: 'decision.proposed',
    tick: proposal.requestedAtTick,
    title: 'Typed action proposed',
    detail: `${proposal.tool} requests ${proposal.action} on ${proposal.target}. Review requires an exact authorization envelope.`,
    payload: { proposal, approvals: approvalsForRun(runId, script) },
  })
}

function finalizeRun(
  runId: string,
  scenarioId: ScenarioId,
  seed: number,
  parent: SimulationRun['parent'],
  prefix: readonly RunEvent[],
  script: ScenarioScript,
  decision: OperatorDecision,
  approvalId: string | undefined,
): SimulationRun {
  const events = [...prefix]
  const proposed = proposalEvent(runId, events.length, script)
  events.push(proposed)
  if (proposed.kind !== 'decision.proposed') throw new SimulationError('invalid-run', 'Decision event construction failed.')

  const { proposal, approvals } = proposed.payload
  const approval = approvals.find(candidate => candidate.id === approvalId)
  const evaluation = authorizeProposal(proposal, approval, {
    expectedRunId: runId,
    atTick: proposal.requestedAtTick,
    operatorDecision: decision,
  })

  events.push(stampEvent(runId, events.length, {
    kind: 'policy.evaluated',
    tick: proposal.requestedAtTick,
    title: evaluation.allowed ? 'Policy authorized proposal' : 'Policy denied proposal',
    detail: evaluation.summary,
    payload: { evaluation },
  }))

  if (evaluation.allowed) {
    const actionIndex = events.length
    const record = applyApprovedEffect(
      runId,
      proposal.id,
      proposal.tool,
      proposal.action,
      proposal.target,
      eventId(runId, actionIndex),
      script.approvedEffect,
    )
    events.push(stampEvent(runId, actionIndex, {
      kind: 'action.applied',
      tick: proposal.requestedAtTick + 1,
      title: 'Bounded synthetic action applied',
      detail: script.approvedEffect.detail,
      payload: { record, patch: script.approvedEffect.patch },
    }))
  }

  const completion = evaluation.allowed
    ? script.approvedEffect.completion
    : {
        outcome: decision === 'reject' ? 'rejected' as const : 'blocked' as const,
        summary: decision === 'reject'
          ? 'No synthetic action was applied in this operator-rejected branch.'
          : 'No synthetic action was applied because the authorization envelope failed closed.',
      }

  events.push(stampEvent(runId, events.length, {
    kind: 'run.completed',
    tick: proposal.requestedAtTick + (evaluation.allowed ? 2 : 1),
    title: 'Reference trace complete',
    detail: completion.summary,
    payload: completion,
  }))

  return immutable({
    schemaVersion: 1,
    id: runId,
    scenarioId,
    seed,
    traceType: 'deterministic-reference',
    parent,
    events,
  })
}

export function createRun(scenarioId: ScenarioId = DEFAULT_SCENARIO_ID, seed: number = DEFAULT_SEED): SimulationRun {
  assertScenarioId(scenarioId)
  assertSeed(seed)
  const definition = SCENARIOS.find(scenario => scenario.id === scenarioId)
  if (!definition) throw new SimulationError('invalid-scenario', `Unknown SIMPUL scenario: ${scenarioId}`)

  const runId = rootRunId(scenarioId, seed)
  const script = buildScenarioScript(scenarioId, seed)
  const initialTopology = createInitialTopology()
  const events: RunEvent[] = [stampEvent(runId, 0, {
    kind: 'run.created',
    tick: 0,
    title: 'Deterministic run created',
    detail: `Scenario ${definition.name}, seed ${seed}. Synthetic reference execution only.`,
    payload: { synopsis: definition.synopsis, initialTopology },
  })]

  for (const draft of script.steps) events.push(stampEvent(runId, events.length, draft))

  return finalizeRun(runId, scenarioId, seed, null, events, script, script.defaultDecision, script.defaultApprovalId)
}

export interface BranchOptions {
  readonly decision: OperatorDecision
  readonly approvalId?: string
}

export function branchRun(run: SimulationRun, decisionEventIndex: number, options: BranchOptions): SimulationRun {
  if (!run || !Array.isArray(run.events) || run.events.length === 0) {
    throw new SimulationError('invalid-run', 'A populated simulation run is required.')
  }
  assertDecisionIndex(run, decisionEventIndex)
  if (options.decision !== 'approve' && options.decision !== 'reject') {
    throw new SimulationError('invalid-decision', 'Branch decision must be approve or reject.')
  }
  const sourceDecision = run.events[decisionEventIndex]
  if (sourceDecision.kind !== 'decision.proposed') {
    throw new SimulationError('invalid-decision', 'Branches can start only at a decision.proposed event.')
  }

  const nextId = branchRunId(run, decisionEventIndex, options.decision, options.approvalId)
  const script = buildScenarioScript(run.scenarioId, run.seed)
  const prefix = run.events.slice(0, decisionEventIndex)
  return finalizeRun(nextId, run.scenarioId, run.seed, {
    runId: run.id,
    decisionEventIndex,
    decision: options.decision,
    approvalId: options.approvalId ?? null,
  }, prefix, script, options.decision, options.approvalId)
}

export function replayRun(run: SimulationRun, eventIndex?: number): ReplaySnapshot {
  if (!run || !Array.isArray(run.events) || run.events.length === 0) {
    throw new SimulationError('invalid-run', 'A populated simulation run is required.')
  }
  const targetIndex = eventIndex ?? run.events.length - 1
  assertDecisionIndex(run, targetIndex)

  let topology: TopologySnapshot | null = null
  let phase: ReplaySnapshot['phase'] = 'initialized'
  let evidence: ReplaySnapshot['evidence'] = []
  let incident: ReplaySnapshot['incident'] = null
  let assessment: ReplaySnapshot['assessment'] = null
  let proposal: ReplaySnapshot['proposal'] = null
  let approvals: ReplaySnapshot['approvals'] = []
  let decisionEventIndex: number | null = null
  let evaluation: ReplaySnapshot['evaluation'] = null
  let appliedActions: ReplaySnapshot['appliedActions'] = []
  let completion: ReplaySnapshot['completion'] = null

  for (let index = 0; index <= targetIndex; index += 1) {
    const event = run.events[index]
    if (event.index !== index) throw new SimulationError('invalid-run', `Event index mismatch at ${index}.`)

    switch (event.kind) {
      case 'run.created':
        topology = event.payload.initialTopology
        phase = 'initialized'
        break
      case 'observation.recorded':
        if (!topology) throw new SimulationError('invalid-run', 'Observation arrived before run creation.')
        evidence = [...evidence, ...event.payload.evidence]
        topology = applyTopologyPatch(topology, event.payload.patch)
        phase = 'observing'
        break
      case 'incident.detected':
        incident = event.payload
        phase = 'incident'
        break
      case 'assessment.recorded':
        assessment = event.payload
        phase = 'assessing'
        break
      case 'decision.proposed':
        proposal = event.payload.proposal
        approvals = event.payload.approvals
        decisionEventIndex = event.index
        phase = 'awaiting-decision'
        break
      case 'policy.evaluated':
        evaluation = event.payload.evaluation
        phase = 'resolved'
        break
      case 'action.applied':
        if (!topology) throw new SimulationError('invalid-run', 'Action arrived before run creation.')
        appliedActions = [...appliedActions, event.payload.record]
        topology = applyTopologyPatch(topology, event.payload.patch)
        phase = 'resolved'
        break
      case 'run.completed':
        completion = event.payload
        phase = 'complete'
        break
    }
  }

  if (!topology) throw new SimulationError('invalid-run', 'Run creation event is missing.')

  return immutable({
    runId: run.id,
    scenarioId: run.scenarioId,
    seed: run.seed,
    eventIndex: targetIndex,
    tick: run.events[targetIndex].tick,
    phase,
    topology,
    evidence,
    incident,
    assessment,
    proposal,
    approvals,
    decisionEventIndex,
    evaluation,
    appliedActions,
    completion,
  })
}
