'use client'

import { useState } from 'react'
import { GitBranch, ShieldCheck, ShieldX } from 'lucide-react'
import styles from './simpul.module.css'
import { TOOL_CATALOG, type OperatorDecision, type ReplaySnapshot } from '@/lib/simpul'

interface DecisionPanelProps {
  readonly snapshot: ReplaySnapshot
  readonly hasParent: boolean
  readonly onBranch: (decision: OperatorDecision, approvalId?: string) => void
  readonly onReturnToParent: () => void
}

export function DecisionPanel({ snapshot, hasParent, onBranch, onReturnToParent }: DecisionPanelProps) {
  const [approvalId, setApprovalId] = useState(snapshot.approvals[0]?.id ?? '')
  const proposal = snapshot.proposal
  const selectedApproval = snapshot.approvals.find(approval => approval.id === approvalId) ?? snapshot.approvals[0]

  return (
    <section id="policy-gate" className={styles.decisionPanel} aria-labelledby="simpul-decision-heading">
      <div className={styles.panelHeader}>
        <div><span className={styles.eyebrow}>Counterfactual control</span><h2 id="simpul-decision-heading">Policy gate</h2></div>
        {snapshot.evaluation ? (
          <span className={`${styles.policyState} ${snapshot.evaluation.allowed ? styles.policyAllowed : styles.policyDenied}`}>
            {snapshot.evaluation.allowed ? <ShieldCheck size={16} aria-hidden /> : <ShieldX size={16} aria-hidden />}
            {snapshot.evaluation.code}
          </span>
        ) : <span className={styles.countLabel}>Awaiting review</span>}
      </div>

      {!proposal ? (
        <div className={styles.emptyState}>
          <GitBranch size={20} aria-hidden />
          <h3>No decision at this cursor</h3>
          <p>Scrub to the proposed action or a later event to inspect its authorization envelope and branch controls.</p>
        </div>
      ) : (
        <div className={styles.decisionBody}>
          <div className={styles.proposalBlock}>
            <span className={styles.eyebrow}>Typed proposal / {proposal.source.replaceAll('-', ' ')}</span>
            <h3>{proposal.action} <span>on {proposal.target}</span></h3>
            <p>{proposal.rationale}</p>
            <dl className={styles.facts}>
              <div><dt>Tool</dt><dd>{proposal.tool}</dd></div>
              <div><dt>Run</dt><dd className={styles.breakable}>{proposal.runId}</dd></div>
              <div><dt>Review tick</dt><dd>T+{proposal.requestedAtTick}m</dd></div>
              <div><dt>Expires</dt><dd>At T+{proposal.expiresAtTick}m, end excluded</dd></div>
            </dl>
            <details className={styles.schemaDetails}>
              <summary>Inspect tool input schema</summary>
              <pre>{JSON.stringify(TOOL_CATALOG[proposal.tool].inputSchema, null, 2)}</pre>
            </details>
          </div>

          <div className={styles.approvalControl}>
            <label htmlFor="simpul-approval">Approval artifact</label>
            <select id="simpul-approval" value={selectedApproval?.id ?? ''} onChange={event => setApprovalId(event.currentTarget.value)}>
              {snapshot.approvals.map(approval => <option key={approval.id} value={approval.id}>{approval.id}</option>)}
            </select>
          </div>

          {selectedApproval ? (
            <div className={styles.approvalEnvelope}>
              <dl className={styles.facts}>
                <div><dt>Envelope</dt><dd>{selectedApproval.verified ? 'Verified in synthetic registry' : 'Unverified, fail closed'}</dd></div>
                <div><dt>Action</dt><dd>{selectedApproval.action}</dd></div>
                <div><dt>Target</dt><dd>{selectedApproval.target}</dd></div>
                <div><dt>Run</dt><dd className={styles.breakable}>{selectedApproval.runId}</dd></div>
                <div><dt>Window</dt><dd>T+{selectedApproval.validFromTick}m through before T+{selectedApproval.validUntilTick}m</dd></div>
              </dl>
              <p className={styles.artifactNotice}>Artifact statement, informational only</p>
              <pre className={styles.artifactText}>{selectedApproval.statement}</pre>
            </div>
          ) : null}

          {snapshot.evaluation ? <p className={`${styles.policyReason} ${snapshot.evaluation.allowed ? styles.policyAllowed : styles.policyDenied}`} role="status">{snapshot.evaluation.summary}</p> : null}

          <div className={styles.branchActions} role="group" aria-label="Counterfactual branch controls">
            <button type="button" className={`${styles.button} ${styles.actionButton}`} onClick={() => onBranch('approve', selectedApproval?.id)}>
              <ShieldCheck size={16} aria-hidden />Approve and branch
            </button>
            <button type="button" className={`${styles.button} ${styles.secondaryButton}`} onClick={() => onBranch('reject')}>
              <ShieldX size={16} aria-hidden />Reject and branch
            </button>
          </div>
          <p className={styles.branchNote}>Branching replays the shared prefix into a new run. The original run and its decision records are not mutated.</p>
          {hasParent ? <button type="button" className={styles.textButton} onClick={onReturnToParent}>Return to parent run</button> : null}
        </div>
      )}
    </section>
  )
}
