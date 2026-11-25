export const SCENARIO_IDS = [
  'fiber-cut',
  'progressive-degradation',
  'alert-storm',
  'missing-telemetry',
  'prompt-injection',
  'approval-binding',
] as const

export type ScenarioId = (typeof SCENARIO_IDS)[number]
export type HealthStatus = 'nominal' | 'degraded' | 'fault' | 'unknown'
export type ServiceStatus = HealthStatus | 'down' | 'rerouted'
export type IncidentSeverity = 'info' | 'warning' | 'critical' | 'unknown'
export type EvidenceQuality = 'current' | 'duplicate' | 'stale' | 'missing' | 'contradictory' | 'untrusted'
export type EvidenceSource = 'optical-monitor' | 'otdr' | 'nms' | 'ticket' | 'runbook' | 'maintenance-registry'
export type ToolName = 'transport.reroute' | 'transport.isolate' | 'alerts.correlate' | 'field.inspect'
export type ControlledAction = 'reroute-service' | 'isolate-link' | 'correlate-alerts' | 'inspect-path'
export type OperatorDecision = 'approve' | 'reject'
export type RunOutcome = 'contained' | 'monitoring' | 'awaiting-evidence' | 'blocked' | 'rejected'

export type NodeId = 'jkt-a' | 'jkt-b' | 'bdg-a' | 'sby-a' | 'sby-b' | 'dps-a'
export type LinkId = 'core-west' | 'metro-south' | 'central-span' | 'south-span' | 'east-span' | 'island-span'
export type ServiceId = 'svc-critical' | 'svc-backup' | 'svc-control'

export interface Scope {
  readonly id: string
  readonly name: string
}

export interface JsonInputProperty {
  readonly type: 'string'
  readonly description: string
}

export interface ToolSpec {
  readonly name: ToolName
  readonly action: ControlledAction
  readonly description: string
  readonly inputSchema: {
    readonly type: 'object'
    readonly required: readonly string[]
    readonly properties: Readonly<Record<string, JsonInputProperty>>
    readonly additionalProperties: false
  }
}

export interface NodeState {
  readonly id: NodeId
  readonly label: string
  readonly location: string
  readonly x: number
  readonly y: number
  readonly status: HealthStatus
}

export interface LinkState {
  readonly id: LinkId
  readonly label: string
  readonly from: NodeId
  readonly to: NodeId
  readonly status: HealthStatus
  readonly attenuationDb: number | null
  readonly osnrDb: number | null
}

export interface ServiceState {
  readonly id: ServiceId
  readonly label: string
  readonly path: readonly LinkId[]
  readonly status: ServiceStatus
}

export interface TopologySnapshot {
  readonly nodes: Readonly<Record<NodeId, NodeState>>
  readonly links: Readonly<Record<LinkId, LinkState>>
  readonly services: Readonly<Record<ServiceId, ServiceState>>
}

export interface NodeUpdate {
  readonly id: NodeId
  readonly status: HealthStatus
}

export interface LinkUpdate {
  readonly id: LinkId
  readonly status?: HealthStatus
  readonly attenuationDb?: number | null
  readonly osnrDb?: number | null
}

export interface ServiceUpdate {
  readonly id: ServiceId
  readonly status: ServiceStatus
}

export interface TopologyPatch {
  readonly nodes?: readonly NodeUpdate[]
  readonly links?: readonly LinkUpdate[]
  readonly services?: readonly ServiceUpdate[]
}

export interface OpticalReading {
  readonly linkId: LinkId
  readonly attenuationDb: number | null
  readonly osnrDb: number | null
}

export interface EvidenceRecord {
  readonly id: string
  readonly source: EvidenceSource
  readonly quality: EvidenceQuality
  readonly observedAtTick: number
  readonly receivedAtTick: number
  readonly summary: string
  readonly detail: string
  readonly targetIds: readonly string[]
  readonly readings?: readonly OpticalReading[]
}

export interface ActionProposal {
  readonly id: string
  readonly runId: string
  readonly tool: ToolName
  readonly action: ControlledAction
  readonly target: string
  readonly rationale: string
  readonly requestedAtTick: number
  readonly expiresAtTick: number
  readonly requiredEvidenceIds: readonly string[]
  readonly source: 'reference-policy' | 'untrusted-artifact'
}

export interface ApprovalArtifact {
  readonly id: string
  readonly kind: 'maintenance-approval'
  readonly runId: string
  readonly action: ControlledAction
  readonly target: string
  readonly validFromTick: number
  readonly validUntilTick: number
  readonly issuer: 'maintenance-controller'
  readonly verified: boolean
  readonly statement: string
}

export type PolicyCode =
  | 'approved'
  | 'operator-rejected'
  | 'proposal-run-mismatch'
  | 'proposal-not-ready'
  | 'proposal-expired'
  | 'approval-not-found'
  | 'approval-unverified'
  | 'approval-run-mismatch'
  | 'approval-target-mismatch'
  | 'approval-action-mismatch'
  | 'approval-not-yet-valid'
  | 'approval-expired'

export interface PolicyEvaluation {
  readonly allowed: boolean
  readonly code: PolicyCode
  readonly summary: string
  readonly approvalId: string | null
  readonly runId: string
  readonly action: ControlledAction
  readonly target: string
  readonly evaluatedAtTick: number
}

export interface AppliedAction {
  readonly id: string
  readonly proposalId: string
  readonly runId: string
  readonly tool: ToolName
  readonly action: ControlledAction
  readonly target: string
  readonly result: 'simulated'
  readonly detail: string
}

export interface RunCreatedPayload {
  readonly synopsis: string
  readonly initialTopology: TopologySnapshot
}

export interface ObservationRecordedPayload {
  readonly evidence: readonly EvidenceRecord[]
  readonly patch: TopologyPatch
}

export interface IncidentDetectedPayload {
  readonly severity: IncidentSeverity
  readonly affectedNodeIds: readonly NodeId[]
  readonly affectedLinkIds: readonly LinkId[]
  readonly affectedServiceIds: readonly ServiceId[]
  readonly evidenceIds: readonly string[]
}

export interface AssessmentRecordedPayload {
  readonly finding: string
  readonly evidenceIds: readonly string[]
}

export interface DecisionProposedPayload {
  readonly proposal: ActionProposal
  readonly approvals: readonly ApprovalArtifact[]
}

export interface PolicyEvaluatedPayload {
  readonly evaluation: PolicyEvaluation
}

export interface ActionAppliedPayload {
  readonly record: AppliedAction
  readonly patch: TopologyPatch
}

export interface RunCompletedPayload {
  readonly outcome: RunOutcome
  readonly summary: string
}

interface EventMetadata {
  readonly id: string
  readonly index: number
  readonly tick: number
  readonly title: string
  readonly detail: string
}

export type RunEvent =
  | (EventMetadata & { readonly kind: 'run.created'; readonly payload: RunCreatedPayload })
  | (EventMetadata & { readonly kind: 'observation.recorded'; readonly payload: ObservationRecordedPayload })
  | (EventMetadata & { readonly kind: 'incident.detected'; readonly payload: IncidentDetectedPayload })
  | (EventMetadata & { readonly kind: 'assessment.recorded'; readonly payload: AssessmentRecordedPayload })
  | (EventMetadata & { readonly kind: 'decision.proposed'; readonly payload: DecisionProposedPayload })
  | (EventMetadata & { readonly kind: 'policy.evaluated'; readonly payload: PolicyEvaluatedPayload })
  | (EventMetadata & { readonly kind: 'action.applied'; readonly payload: ActionAppliedPayload })
  | (EventMetadata & { readonly kind: 'run.completed'; readonly payload: RunCompletedPayload })

export type ScenarioEventDraft = {
  [Kind in RunEvent['kind']]: Omit<Extract<RunEvent, { kind: Kind }>, 'id' | 'index'>
}[RunEvent['kind']]

export interface RunParent {
  readonly runId: string
  readonly decisionEventIndex: number
  readonly decision: OperatorDecision
  readonly approvalId: string | null
}

export interface SimulationRun {
  readonly schemaVersion: 1
  readonly id: string
  readonly scenarioId: ScenarioId
  readonly seed: number
  readonly traceType: 'deterministic-reference'
  readonly parent: RunParent | null
  readonly events: readonly RunEvent[]
}

export type ReplayPhase = 'initialized' | 'observing' | 'incident' | 'assessing' | 'awaiting-decision' | 'resolved' | 'complete'

export interface ReplaySnapshot {
  readonly runId: string
  readonly scenarioId: ScenarioId
  readonly seed: number
  readonly eventIndex: number
  readonly tick: number
  readonly phase: ReplayPhase
  readonly topology: TopologySnapshot
  readonly evidence: readonly EvidenceRecord[]
  readonly incident: IncidentDetectedPayload | null
  readonly assessment: AssessmentRecordedPayload | null
  readonly proposal: ActionProposal | null
  readonly approvals: readonly ApprovalArtifact[]
  readonly decisionEventIndex: number | null
  readonly evaluation: PolicyEvaluation | null
  readonly appliedActions: readonly AppliedAction[]
  readonly completion: RunCompletedPayload | null
}

export interface ReplayExport {
  readonly schema: 'simpul.replay.v1'
  readonly traceType: 'deterministic-reference'
  readonly notice: string
  readonly run: SimulationRun
}
