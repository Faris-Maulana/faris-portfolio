import type {
  EditorialRepository,
  EvidenceContent,
  ProjectEvidence,
  ResearchMethodNote,
} from './evidence'

const INSPECTED_AT = '2026-11-25'

const REVISION = {
  rag: '90e16d5d52b20f670cc3a0dd4fcf8a0db5a35427',
  wealth: '16cbe678197b8976fa40533dcf85ea8fe5fa1d22',
  ottodot: 'd30ae63cb9d162e4d985f95e095826ed275e5ea1',
  portfolio: 'de6bc222fab87fe38921017c80504679e21084ee',
} as const

function githubBlob(repository: string, revision: string, path: string): string {
  return `https://github.com/Faris-Maulana/${repository}/blob/${revision}/${path}`
}

export const EVIDENCE_REGISTRY = [
  {
    id: 'text2sql',
    title: 'Enterprise Text-to-SQL platform',
    lifecycle: 'in-development',
    evidenceLevel: 'prose-only',
    dataExposure: 'private',
    summary:
      'Governed Text-to-SQL architecture over operational telecom data. Implementation remains in development; no public execution result is claimed.',
    dataBoundary:
      'Operational schemas, query records and model outputs stay private. The public artifact is an implementation-level abstraction.',
    artifacts: [
      {
        id: 'text2sql-architecture',
        kind: 'architecture',
        title: 'Controlled Text-to-SQL architecture',
        location: { type: 'internal', route: '/work/text2sql' },
        dataExposure: 'redacted',
        verification: { method: 'artifact-inspection', inspectedAt: INSPECTED_AT },
        resultBoundary:
          'Architectural prose only; not an execution trace, test result or deployment confirmation.',
      },
    ],
    nextEvidence: [
      'Publish an approved synthetic question set and pinned validation test source without exposing operational schemas.',
      'Attach a timestamped, reproducible execution trace only after running the controlled path against approved data.',
    ],
  },
  {
    id: 'noc-agent',
    title: 'NOC monitoring agent',
    lifecycle: 'proof-of-concept',
    evidenceLevel: 'prose-only',
    dataExposure: 'private',
    summary:
      'Proof-of-concept interaction and alert architecture. This registry does not promote it to an internal deployment or publish operational data.',
    dataBoundary:
      'Incident records, telemetry, network topology and alert destinations are excluded from public artifacts.',
    artifacts: [
      {
        id: 'noc-agent-architecture',
        kind: 'architecture',
        title: 'NOC query and alert boundaries',
        location: { type: 'internal', route: '/work/noc-agent' },
        dataExposure: 'redacted',
        verification: { method: 'artifact-inspection', inspectedAt: INSPECTED_AT },
        resultBoundary:
          'The linked case study describes a proof of concept; it does not provide test output, production telemetry or an operational outcome.',
      },
    ],
    nextEvidence: [
      'Add sanitized query-validation and alert-policy test source with a fixed synthetic telemetry fixture.',
      'Record a bounded local execution trace after authorization, failure handling and observability checks are implemented.',
    ],
  },
  {
    id: 'rag-eval',
    title: 'RAG evaluation framework',
    lifecycle: 'public-reference-implementation',
    evidenceLevel: 'committed-results',
    dataExposure: 'public',
    summary:
      'Public reference implementation with retrieval test source and a committed retrieval-only report. Inspecting those files is not a fresh local evaluation.',
    dataBoundary:
      'The reference corpus uses public Wikipedia material. The committed report does not represent client workloads or unpublished generation evaluation.',
    artifacts: [
      {
        id: 'rag-evaluation-test-source',
        kind: 'test-source',
        title: 'Retrieval evaluation unit tests',
        location: {
          type: 'external',
          url: githubBlob('rag-system', REVISION.rag, 'tests/test_evaluate.py'),
        },
        dataExposure: 'public',
        verification: { method: 'artifact-inspection', inspectedAt: INSPECTED_AT },
        reproductionCommand: 'make test',
        sourceRevision: REVISION.rag,
        commitLabel: 'main at remote inspection',
        resultBoundary:
          'Public test source was inspected at the pinned revision; no pytest run was performed in this workspace.',
      },
      {
        id: 'rag-retrieval-report',
        kind: 'observed-result',
        title: 'Committed retrieval-only evaluation report',
        location: {
          type: 'external',
          url: githubBlob('rag-system', REVISION.rag, 'results/retrieval_report.json'),
        },
        dataExposure: 'public',
        verification: { method: 'artifact-inspection', inspectedAt: INSPECTED_AT },
        reproductionCommand: 'make eval-retrieval',
        sourceRevision: REVISION.rag,
        commitLabel: 'main at remote inspection',
        resultBoundary:
          'Committed lexical context-precision output inspected remotely; not generation scores, external validation or a fresh local run.',
      },
    ],
    nextEvidence: [
      'Preserve generation evaluation output with a pinned input snapshot before making generation-quality claims.',
    ],
  },
  {
    id: 'appraisal',
    title: 'Maritime performance appraisal',
    lifecycle: 'internally-deployed',
    evidenceLevel: 'prose-only',
    dataExposure: 'private',
    summary:
      'Internally deployed appraisal workflow described through public architecture and limits. Personnel records, test artifacts and organizational outcomes remain unpublished.',
    dataBoundary:
      'Personnel records, scores and internal audit events are private; only the workflow boundary and control model are public.',
    artifacts: [
      {
        id: 'appraisal-workflow-architecture',
        kind: 'architecture',
        title: 'Parallel appraisal workflow architecture',
        location: { type: 'internal', route: '/work/appraisal' },
        dataExposure: 'redacted',
        verification: { method: 'artifact-inspection', inspectedAt: INSPECTED_AT },
        resultBoundary:
          'Architecture and workflow prose only; no browser-test output, deployment record or measured organizational outcome is attached.',
      },
    ],
    nextEvidence: [
      'Publish synthetic-role browser test source and a committed result without personnel or scoring records.',
      'Leave organizational impact unquantified unless a reviewable outcome artifact and its measurement boundary are available.',
    ],
  },
  {
    id: 'wealth-advisor',
    title: 'Wealth Advisor multi-agent reference',
    lifecycle: 'public-reference-implementation',
    evidenceLevel: 'interactive-demo',
    dataExposure: 'synthetic',
    summary:
      'Public synthetic-data multi-agent reference implementation with test source, committed traces and a browser demo; not a production financial advisory deployment.',
    dataBoundary:
      'Client scenarios, integrations and outputs in the public repository are synthetic or mocked. No real client financial record is used as evidence.',
    artifacts: [
      {
        id: 'wealth-orchestrator-test-source',
        kind: 'test-source',
        title: 'Orchestrator and human-review test source',
        location: {
          type: 'external',
          url: githubBlob(
            'wealth-advisor-agents',
            REVISION.wealth,
            'tests/test_orchestrator.py',
          ),
        },
        dataExposure: 'synthetic',
        verification: { method: 'artifact-inspection', inspectedAt: INSPECTED_AT },
        reproductionCommand: 'make test',
        sourceRevision: REVISION.wealth,
        commitLabel: 'main at remote inspection',
        resultBoundary:
          'Test source was inspected at the pinned revision; it was not executed for this registry.',
      },
      {
        id: 'wealth-sample-execution-trace',
        kind: 'execution-trace',
        title: 'Committed synthetic sample execution trace',
        location: {
          type: 'external',
          url: githubBlob(
            'wealth-advisor-agents',
            REVISION.wealth,
            'samples/output/run_log.jsonl',
          ),
        },
        dataExposure: 'synthetic',
        verification: { method: 'artifact-inspection', inspectedAt: INSPECTED_AT },
        sourceRevision: REVISION.wealth,
        commitLabel: 'main at remote inspection',
        resultBoundary:
          'Committed mock-run logs inspected remotely; sample identifiers, timestamps and timings are not fresh local observations.',
      },
      {
        id: 'wealth-browser-demo',
        kind: 'live-demo',
        title: 'Synthetic browser demo',
        location: {
          type: 'external',
          url: 'https://faris-maulana.github.io/wealth-advisor-agents/',
        },
        dataExposure: 'synthetic',
        verification: { method: 'artifact-inspection', inspectedAt: INSPECTED_AT },
        resultBoundary:
          'The public demo document and controls were inspected; no end-to-end browser workflow was executed during registry creation.',
      },
    ],
    nextEvidence: [
      'Exercise the published browser workflow and record a fresh local-run artifact before claiming an end-to-end verification.',
    ],
  },
  {
    id: 'ottodot',
    title: 'Ottodot trial booking',
    lifecycle: 'public-reference-implementation',
    evidenceLevel: 'test-source',
    dataExposure: 'synthetic',
    summary:
      'Public trial-booking implementation with concurrency test source. No local test run, live public demo or production payment outcome is claimed here.',
    dataBoundary:
      'The repository models seed scenarios and a mock payment gateway; public tests do not establish real payment-provider behavior.',
    artifacts: [
      {
        id: 'ottodot-concurrency-test-source',
        kind: 'test-source',
        title: 'Concurrent booking and payment tests',
        location: {
          type: 'external',
          url: githubBlob(
            'ottodot-trial-booking',
            REVISION.ottodot,
            'tests/concurrency.test.ts',
          ),
        },
        dataExposure: 'synthetic',
        verification: { method: 'artifact-inspection', inspectedAt: INSPECTED_AT },
        reproductionCommand: 'npm run setup && npm test',
        sourceRevision: REVISION.ottodot,
        commitLabel: 'main at remote inspection',
        resultBoundary:
          'Concurrency and payment test code was inspected at the pinned revision; it requires Postgres and was not run in this workspace.',
      },
    ],
    nextEvidence: [
      'Run the committed suite against a configured Postgres service and retain the resulting output before upgrading to committed results.',
    ],
  },
  {
    id: 'simpul',
    title: 'SIMPUL',
    lifecycle: 'public-reference-implementation',
    evidenceLevel: 'interactive-demo',
    dataExposure: 'synthetic',
    summary:
      'The local interactive reference executes six seeded incident scenarios with deterministic replay, counterfactual branches and typed authorization envelopes. Six focused Playwright workflows passed on 25 November 2026.',
    dataBoundary:
      'Every node, service, optical reading, ticket, approval and incident is synthetic. No private topology, live telemetry, provider request or production command path is connected.',
    artifacts: [
      {
        id: 'simpul-local-interactive-run',
        kind: 'live-demo',
        title: 'SIMPUL local browser execution',
        location: { type: 'internal', route: '/simpul' },
        dataExposure: 'synthetic',
        verification: {
          method: 'local-run',
          command: 'PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers npx playwright test tests/e2e/simpul.spec.ts',
          observedAt: '2026-11-25T03:49:09Z',
        },
        reproductionCommand: 'PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers npx playwright test tests/e2e/simpul.spec.ts',
        resultBoundary:
          'Six browser workflows passed locally. They verify deterministic reference behavior, keyboard interaction, mobile layout, replay export and automated accessibility checks; they do not measure live-model quality, optical fidelity or production outcomes.',
      },
    ],
    nextEvidence: [
      'Add model-backed runs only with a versioned dataset, selected model, prompt revision, raw traces and reproducible evaluation report before publishing model-quality comparisons.',
      'Attach release commit provenance and a persisted verification report to the next deployable release.',
    ],
  },
  {
    id: 'portfolio',
    title: 'Faris portfolio',
    lifecycle: 'public-reference-implementation',
    evidenceLevel: 'interactive-demo',
    dataExposure: 'redacted',
    summary:
      'The public site and pinned unit-test source are inspectable; this registry records inspection, not a fresh full-site verification run.',
    dataBoundary:
      'Public pages deliberately redact document identifiers, operational metadata and private case-study records where required.',
    artifacts: [
      {
        id: 'portfolio-site-test-source',
        kind: 'test-source',
        title: 'Site URL unit-test source',
        location: {
          type: 'external',
          url: githubBlob(
            'faris-portfolio',
            REVISION.portfolio,
            'tests/unit/site.test.ts',
          ),
        },
        dataExposure: 'public',
        verification: { method: 'artifact-inspection', inspectedAt: INSPECTED_AT },
        reproductionCommand: 'npm test -- tests/unit/site.test.ts',
        sourceRevision: REVISION.portfolio,
        commitLabel: 'main at remote inspection',
        resultBoundary:
          'Pinned unit-test source was inspected; the registry does not represent it as a fresh test outcome.',
      },
      {
        id: 'portfolio-public-homepage',
        kind: 'live-demo',
        title: 'Public portfolio homepage',
        location: {
          type: 'external',
          url: 'https://faris-portfolio-red.vercel.app/',
        },
        dataExposure: 'redacted',
        verification: { method: 'artifact-inspection', inspectedAt: INSPECTED_AT },
        resultBoundary:
          'The homepage document was inspected remotely; this was not a fresh local build or full browser interaction run.',
      },
    ],
    nextEvidence: [
      'Run the complete verification suite against the integrated tree before recording a release-wide result.',
    ],
  },
  {
    id: 'web3-security',
    title: 'Web3 security research',
    lifecycle: 'proof-of-concept',
    evidenceLevel: 'prose-only',
    dataExposure: 'public',
    summary:
      'Adversarial review methods are public prose. No external triage or contest outcome is represented by this entry.',
    dataBoundary:
      'Only public methodology is included. Target code, exploit details and decision records require explicit publishable artifacts.',
    artifacts: [
      {
        id: 'web3-review-methodology',
        kind: 'architecture',
        title: 'Adversarial review methodology',
        location: { type: 'internal', route: '/#research' },
        dataExposure: 'public',
        verification: { method: 'artifact-inspection', inspectedAt: INSPECTED_AT },
        resultBoundary:
          'Method prose only; no externally adjudicated finding or reproducible security outcome is attached.',
      },
    ],
    nextEvidence: [
      'Publish a redacted, reproducible proof of concept with a pinned target revision before describing a security finding.',
      'Link the relevant public decision artifact before recording any external review outcome.',
    ],
  },
] as const satisfies readonly ProjectEvidence[]

export const PUBLIC_REPOSITORY_MANIFEST: readonly EditorialRepository[] = [
  {
    name: 'rag-system',
    repositoryUrl: 'https://github.com/Faris-Maulana/rag-system',
    description:
      'Readable RAG reference covering dense retrieval, reranking and retrieval-only evaluation over public Wikipedia material.',
    primaryCaseStudyId: 'rag-eval',
    lastInspectedAt: INSPECTED_AT,
  },
  {
    name: 'wealth-advisor-agents',
    repositoryUrl: 'https://github.com/Faris-Maulana/wealth-advisor-agents',
    description:
      'Synthetic-data multi-agent advisory workflow with tool contracts, human review and an inspectable browser demo.',
    primaryCaseStudyId: 'wealth-advisor',
    lastInspectedAt: INSPECTED_AT,
    demoUrl: 'https://faris-maulana.github.io/wealth-advisor-agents/',
  },
  {
    name: 'ottodot-trial-booking',
    repositoryUrl: 'https://github.com/Faris-Maulana/ottodot-trial-booking',
    description:
      'Trial-booking slice focused on database constraints, concurrent seat allocation and mock payment handling.',
    primaryCaseStudyId: 'ottodot',
    lastInspectedAt: INSPECTED_AT,
  },
  {
    name: 'faris-portfolio',
    repositoryUrl: 'https://github.com/Faris-Maulana/faris-portfolio',
    description:
      'Source for this portfolio, including public case-study prose, interactive components and unit/browser test source.',
    primaryCaseStudyId: 'portfolio',
    lastInspectedAt: INSPECTED_AT,
    homepageUrl: 'https://faris-portfolio-red.vercel.app/',
  },
] as const satisfies readonly EditorialRepository[]

export const RESEARCH_METHODS = [
  {
    id: 'fleet-economics',
    title: 'Fleet economics association study',
    method: 'PCA + OLS with robust standard errors',
    question:
      'Which operational and compliance signals are associated with TCE yield in the available ERP history?',
    inferenceBoundary: 'Associational only; observational coefficients do not establish causality.',
    dataExposure: 'private',
    evidenceBoundary:
      'Private ERP records and original model artifacts are not published; no coefficient or outcome precision is asserted.',
  },
  {
    id: 'enterprise-churn',
    title: 'Enterprise churn risk framing',
    method: 'Survival analysis + regularized classification',
    question:
      'How can account behaviour inform retention prioritisation without reducing churn to one opaque score?',
    inferenceBoundary:
      'Risk framing, not reproduced historical performance; cohort definitions, censoring and calibration require the original study.',
    dataExposure: 'private',
    evidenceBoundary:
      'Enterprise account records and model outputs are unpublished, so no historical performance figure is carried into this registry.',
  },
  {
    id: 'triage-decision-cost',
    title: 'Triage decision-cost analysis',
    method: 'Regression + confusion-matrix costing',
    question:
      'Which operating threshold balances intake efficiency against the administrative cost of false positives?',
    inferenceBoundary:
      'Decision-cost framing for a specific task, not a universal optimum or a published operating curve.',
    dataExposure: 'private',
    evidenceBoundary:
      'Patient data and verifiable operating curves are not published; threshold selection remains methodological prose.',
  },
  {
    id: 'learning-mode-efficacy',
    title: 'Learning-mode efficacy study',
    method: 'Mixed-effects logistic regression',
    question:
      'How do learning mode and platform responsiveness relate to observed learning outcomes across groups?',
    inferenceBoundary:
      'Grouped observational analysis; effects are not transferable product benchmarks without the original design and artifacts.',
    dataExposure: 'private',
    evidenceBoundary:
      'Learner records and original study artifacts are not published; effect sizes and operational cutoffs are intentionally absent.',
  },
] as const satisfies readonly ResearchMethodNote[]

export const EVIDENCE_CONTENT = {
  projects: EVIDENCE_REGISTRY,
  repositories: PUBLIC_REPOSITORY_MANIFEST,
  researchMethods: RESEARCH_METHODS,
} as const satisfies EvidenceContent

/** Semantic alias for consumers that render project evidence rather than the full content bundle. */
export const PROJECT_EVIDENCE = EVIDENCE_REGISTRY
