import { immutable } from './immutable'
import type { ActionProposal, ApprovalArtifact, OperatorDecision, PolicyCode, PolicyEvaluation } from './types'

interface AuthorizationContext {
  readonly expectedRunId: string
  readonly atTick: number
  readonly operatorDecision: OperatorDecision
}

const REASONS: Readonly<Record<PolicyCode, string>> = {
  approved: 'Approval binds the exact action, target, run and active window.',
  'operator-rejected': 'The reference operator rejected this branch.',
  'proposal-run-mismatch': 'The proposal belongs to a different run.',
  'proposal-not-ready': 'The proposal is not ready for review at this tick.',
  'proposal-expired': 'The proposal review window has expired.',
  'approval-not-found': 'No approval artifact was supplied.',
  'approval-unverified': 'Artifact text is not authority. The approval envelope is not verified.',
  'approval-run-mismatch': 'The approval is bound to a different run.',
  'approval-target-mismatch': 'The approval is bound to a different target.',
  'approval-action-mismatch': 'The approval is bound to a different action.',
  'approval-not-yet-valid': 'The approval window has not started.',
  'approval-expired': 'The approval window has expired.',
}

function denial(code: Exclude<PolicyCode, 'approved'>, proposal: ActionProposal, context: AuthorizationContext, approvalId: string | null): PolicyEvaluation {
  return immutable({
    allowed: false,
    code,
    summary: REASONS[code],
    approvalId,
    runId: context.expectedRunId,
    action: proposal.action,
    target: proposal.target,
    evaluatedAtTick: context.atTick,
  })
}

/**
 * Authority comes only from the typed approval envelope. Evidence and artifact
 * prose are deliberately not parameters, so no statement can grant permission.
 * Approval windows are half open: start tick included, end tick excluded.
 */
export function authorizeProposal(
  proposal: ActionProposal,
  approval: ApprovalArtifact | undefined,
  context: AuthorizationContext,
): PolicyEvaluation {
  const approvalId = approval?.id ?? null

  if (context.operatorDecision === 'reject') return denial('operator-rejected', proposal, context, approvalId)
  if (proposal.runId !== context.expectedRunId) return denial('proposal-run-mismatch', proposal, context, approvalId)
  if (context.atTick < proposal.requestedAtTick) return denial('proposal-not-ready', proposal, context, approvalId)
  if (context.atTick >= proposal.expiresAtTick) return denial('proposal-expired', proposal, context, approvalId)
  if (!approval) return denial('approval-not-found', proposal, context, null)
  if (!approval.verified) return denial('approval-unverified', proposal, context, approval.id)
  if (approval.runId !== context.expectedRunId) return denial('approval-run-mismatch', proposal, context, approval.id)
  if (approval.target !== proposal.target) return denial('approval-target-mismatch', proposal, context, approval.id)
  if (approval.action !== proposal.action) return denial('approval-action-mismatch', proposal, context, approval.id)
  if (context.atTick < approval.validFromTick) return denial('approval-not-yet-valid', proposal, context, approval.id)
  if (context.atTick >= approval.validUntilTick) return denial('approval-expired', proposal, context, approval.id)

  return immutable({
    allowed: true,
    code: 'approved',
    summary: REASONS.approved,
    approvalId: approval.id,
    runId: context.expectedRunId,
    action: proposal.action,
    target: proposal.target,
    evaluatedAtTick: context.atTick,
  })
}
