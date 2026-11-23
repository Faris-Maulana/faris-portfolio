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
    decision: 'Use the proof of concept to test the interaction model, not to claim production readiness.',
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
      'Faithfulness and answer relevance identify grounding failures.',
      'Retrieval diversity exposes repetitive or narrow context selection.',
      'Failure cases drive changes to chunking, retrieval and reranking rather than prompt wording alone.',
    ],
    decision: 'Treat evaluation as part of the system, not a dashboard added after the demo.',
    limitations: [
      'The reference corpus is small and domain-specific; its results should not be generalised to client workloads.',
      'Heuristic evaluation complements, but does not replace, reviewed task-specific ground truth.',
    ],
    evidenceLabel: 'Public reference implementation is linked from the GitHub archive when available.',
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
    evidenceLabel: 'Shipped application workflow; confidential business records are excluded.',
  },
}
