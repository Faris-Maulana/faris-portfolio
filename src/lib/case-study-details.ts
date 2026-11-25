export interface CaseStudyDetail {
  role: string
  architecture: string[]
  evaluation: string[]
  decision: string
  limitations: string[]
  evidenceLabel: string
}

/** Public implementation detail. No private schemas, credentials or client data. */
export const CASE_STUDY_DETAILS: Record<string, CaseStudyDetail> = {
  simpul: {
    role: 'Independent product design, deterministic simulation, policy enforcement, visualization and verification.',
    architecture: [
      'A scenario and seed create an immutable synthetic network run.',
      'Typed evidence and action proposals advance an append-only event record.',
      'A deterministic policy gate binds consequential actions to the exact run, target and approval scope.',
      'The interface reconstructs state at any event and branches without mutating the original run.',
    ],
    evaluation: [
      'Replaying a scenario and seed produces the same ordered state transitions.',
      'Proposals originating in untrusted artifacts cannot gain authority from artifact prose; stale and wrong-target approvals are denied before execution.',
      'Branching preserves the source run and makes alternative outcomes comparable.',
    ],
    decision: 'Make authorization deterministic and replay a first-class product capability before adding probabilistic planning.',
    limitations: [
      'The current reference run is deterministic, not a measured evaluation of a live language model.',
      'Synthetic topology and incident behavior do not establish production availability, recovery time or optical-model fidelity.',
    ],
    evidenceLabel: 'Interactive synthetic implementation. No private topology, operational records or production control path is used.',
  },
  'wealth-advisor': {
    role: 'Independent architecture and implementation of orchestration, tools, anomaly detection, human review and browser execution.',
    architecture: [
      'A deterministic orchestrator routes work to data, analysis and advisory agents.',
      'Least-privilege tools validate calls, apply retries or circuit breakers and expose typed failures.',
      'High-severity findings pause at a reviewer checkpoint before advice can continue.',
      'Structured traces, checkpoints and long-term memory make pause, resume and follow-up behavior inspectable.',
    ],
    evaluation: [
      'Synthetic clients exercise portfolio, transaction, compliance, missing-data and clean-record paths.',
      'Committed outputs preserve human-review transitions, CRM fallback and next-run reviewer memory.',
      'Repository tests cover tools, detectors, orchestration, memory and API behavior; those tests were inspected here, not rerun.',
    ],
    decision: 'Keep the optional model as a constrained narrator while detection, scoring and recommendations remain deterministic.',
    limitations: [
      'Detector thresholds are defaults, not calibrated against a labelled reviewer dataset.',
      'Production use requires authentication, advisor-level tenancy, secure shared persistence and stronger audit controls.',
    ],
    evidenceLabel: 'Public implementation, synthetic inputs, committed outputs and a browser demo. Not presented as a production advisory service.',
  },
  ottodot: {
    role: 'Independent backend design and implementation across the data model, payment state machine, race handling and invariant tests.',
    architecture: [
      'Authorize funds without holding a database lock or allocating a seat.',
      'Serialize final-seat allocation in a short class transaction and use compare-and-swap booking state.',
      'Capture only after allocation succeeds; void authorization and compensate if any step fails.',
      'Keep audit events append-only and enforce capacity, seat and idempotency invariants in PostgreSQL.',
    ],
    evaluation: [
      'Concurrency scenarios cover two parents and a ten-way race for one final seat.',
      'Constraint tests bypass the application and write invalid states directly to the database.',
      'Every repository test ends with global invariant checks; those tests were inspected here, not rerun.',
    ],
    decision: 'Put correctness in the database and transaction boundary instead of trusting UI seat counts or application checks alone.',
    limitations: [
      'Authentication, ownership checks and admin authorization are deliberately absent.',
      'The payment provider is mocked. Real deployment needs webhook-led state, reconciliation and scheduled hold expiry.',
    ],
    evidenceLabel: 'Public implementation and executable test sources. No claim of live payment-provider integration.',
  },
  text2sql: {
    role: 'Founding AI Engineering Manager. Architecture, platform direction, stakeholder alignment and delivery ownership.',
    architecture: [
      'Ingest operational sources into a governed medallion warehouse.',
      'Discover approved schemas and construct a query plan.',
      'Generate SQL, then validate syntax, permissions and query scope before execution.',
      'Bind results to their source and synthesise an answer with an execution trail.',
    ],
    evaluation: [
      'Golden questions across schema selection, joins, filters and ambiguous intent.',
      'Execution accuracy separated from answer fluency so a polished response cannot hide wrong SQL.',
      'Permission, malformed-query and prompt-injection regression cases before release.',
    ],
    decision: 'Govern the data and query boundary before optimising the conversational interface.',
    limitations: [
      'The platform is in development, not presented as a completed production rollout.',
      'Release metrics remain unpublished until the evaluation harness runs against representative approved questions.',
    ],
    evidenceLabel: 'Architecture described at a public, implementation-level abstraction. Internal schemas and operational records are excluded.',
  },
  'noc-agent': {
    role: 'System design and proof-of-concept implementation for conversational network operations support.',
    architecture: [
      'FastAPI exposes the interaction boundary.',
      'LangChain routes approved incident questions to ClickHouse queries.',
      'A separate alert path sends operational notifications through WhatsApp.',
    ],
    evaluation: [
      'Validate query correctness on representative NOC questions.',
      'Test alert deduplication, stale telemetry and unavailable upstream data.',
      'Require authorisation and audit coverage before production use.',
    ],
    decision: 'Use the proof of concept to test the interaction model, then move public incident simulation into SIMPUL rather than presenting two overlapping products.',
    limitations: [
      'Authorisation, alert policy, observability and integration coverage remain required production work.',
      'No operational incident data is published with this case study.',
    ],
    evidenceLabel: 'Current maturity is explicitly marked as proof of concept.',
  },
  'rag-eval': {
    role: 'Independent system design and implementation, used as a technical reference for client advisory work.',
    architecture: [
      'Chunk and ingest source material with traceable document identifiers.',
      'Retrieve candidates with a bi-encoder and rerank with a cross-encoder.',
      'Generate from retrieved context, then evaluate retrieval and answer quality separately.',
    ],
    evaluation: [
      'A committed 20-query retrieval report records dense lexical context precision of 0.543 and reranked precision of 0.612 at top 3.',
      'The metric is a keyword-overlap proxy, not RAGAS context precision; the repository reports 10 improved, 7 tied and 3 degraded queries after reranking.',
      'Generation and fine-tuning scores remain unpublished, while comparative retrieval and self-judging are explicit failure modes.',
    ],
    decision: 'Treat evaluation as part of the system, not a dashboard added after the demo.',
    limitations: [
      'The reference corpus is small and domain-specific; its results should not be generalised to client workloads.',
      'Heuristic evaluation complements, but does not replace, reviewed task-specific ground truth.',
    ],
    evidenceLabel: 'Observed values are quoted from the public repository report and were not rerun in this portfolio workspace.',
  },
  appraisal: {
    role: 'Application and workflow implementation across role permissions, state transitions and browser testing.',
    architecture: [
      'Role-based access separates appraisees, supervisors, reviewers and decision makers.',
      'Independent peer reviews proceed in parallel inside each stage.',
      'Weighted scoring and audit records make each transition reviewable.',
    ],
    evaluation: [
      'Playwright covers the critical cross-role workflow.',
      'Unauthorised transitions and incomplete stages are treated as negative test cases.',
      'Scoring and audit records are checked across the complete appraisal cycle.',
    ],
    decision: 'Model the real dependency graph instead of encoding a sequential form for a parallel process.',
    limitations: [
      'Internal personnel records and scoring data are not public.',
      'The case describes workflow architecture, not a claimed organisational outcome without supporting measurements.',
    ],
    evidenceLabel: 'Internal deployment described at architecture level; implementation tests and confidential business records are not public evidence.',
  },
}
