export const PROJECT_LIFECYCLES = [
  'in-development',
  'proof-of-concept',
  'internally-deployed',
  'public-reference-implementation',
] as const

export const EVIDENCE_LEVELS = [
  'prose-only',
  'test-source',
  'committed-results',
  'interactive-demo',
  'externally-verified-outcome',
] as const

export const DATA_EXPOSURES = ['public', 'synthetic', 'redacted', 'private'] as const

export const ARTIFACT_KINDS = [
  'observed-result',
  'test-source',
  'live-demo',
  'execution-trace',
  'screenshot',
  'architecture',
  'external-verification',
] as const

export const PROJECT_IDS = [
  'text2sql',
  'noc-agent',
  'rag-eval',
  'appraisal',
  'wealth-advisor',
  'ottodot',
  'simpul',
  'portfolio',
  'web3-security',
] as const

export const PUBLIC_REPOSITORY_NAMES = [
  'rag-system',
  'wealth-advisor-agents',
  'ottodot-trial-booking',
  'faris-portfolio',
] as const

export type ProjectLifecycle = (typeof PROJECT_LIFECYCLES)[number]
export type EvidenceLevel = (typeof EVIDENCE_LEVELS)[number]
export type DataExposure = (typeof DATA_EXPOSURES)[number]
export type EvidenceArtifactKind = (typeof ARTIFACT_KINDS)[number]
export type ProjectId = (typeof PROJECT_IDS)[number]
export type PublicRepositoryName = (typeof PUBLIC_REPOSITORY_NAMES)[number]
export type EvidenceFilter = 'all' | 'interactive' | 'test-artifacts' | 'private-boundary'

export const LIFECYCLE_LABELS: Record<ProjectLifecycle, string> = {
  'in-development': 'In development',
  'proof-of-concept': 'Proof of concept',
  'internally-deployed': 'Internally deployed',
  'public-reference-implementation': 'Public reference implementation',
}

export const EVIDENCE_LEVEL_LABELS: Record<EvidenceLevel, string> = {
  'prose-only': 'Prose only',
  'test-source': 'Test source',
  'committed-results': 'Committed results',
  'interactive-demo': 'Interactive demo',
  'externally-verified-outcome': 'Externally verified outcome',
}

export const DATA_EXPOSURE_LABELS: Record<DataExposure, string> = {
  public: 'Public data',
  synthetic: 'Synthetic data',
  redacted: 'Redacted data',
  private: 'Private data',
}

export type EvidenceArtifactLocation =
  | { type: 'external'; url: string }
  | { type: 'internal'; route: string }

/**
 * Inspection is not execution. A local run must carry its actual command and
 * observation time instead of borrowing a repository's reproduction command.
 */
export type ArtifactVerification =
  | { method: 'artifact-inspection'; inspectedAt: string }
  | { method: 'local-run'; command: string; observedAt: string }
  | { method: 'reference-only' }

export interface EvidenceArtifact {
  id: string
  kind: EvidenceArtifactKind
  title: string
  location: EvidenceArtifactLocation
  dataExposure: DataExposure
  verification: ArtifactVerification
  reproductionCommand?: string
  /** Full immutable Git commit when the artifact is revision-pinned. */
  sourceRevision?: string
  /** Human-readable branch, release or commit context; never a substitute for a revision. */
  commitLabel?: string
  /** What this artifact does not prove, including whether it was merely inspected. */
  resultBoundary?: string
  /** Observation time supplied by the artifact or an actual local run, if known. */
  observedAt?: string
}

export interface ProjectEvidence {
  id: ProjectId
  title: string
  lifecycle: ProjectLifecycle
  evidenceLevel: EvidenceLevel
  dataExposure: DataExposure
  summary: string
  dataBoundary: string
  artifacts: readonly EvidenceArtifact[]
  /** Future work is prose explicitly separated from evidence that exists now. */
  nextEvidence: readonly string[]
}

export interface EditorialRepository {
  name: PublicRepositoryName
  repositoryUrl: string
  description: string
  primaryCaseStudyId: ProjectId
  lastInspectedAt: string
  demoUrl?: string
  homepageUrl?: string
}

export interface ResearchMethodNote {
  id: string
  title: string
  method: string
  question: string
  inferenceBoundary: string
  dataExposure: DataExposure
  evidenceBoundary: string
}

export interface EvidenceContent {
  projects: readonly ProjectEvidence[]
  repositories: readonly EditorialRepository[]
  researchMethods: readonly ResearchMethodNote[]
}

const EVIDENCE_RANK: Record<EvidenceLevel, number> = {
  'prose-only': 0,
  'test-source': 1,
  'committed-results': 2,
  'interactive-demo': 3,
  'externally-verified-outcome': 4,
}

const ARTIFACT_EVIDENCE_LEVEL: Record<EvidenceArtifactKind, EvidenceLevel> = {
  architecture: 'prose-only',
  'test-source': 'test-source',
  'observed-result': 'committed-results',
  'execution-trace': 'committed-results',
  screenshot: 'committed-results',
  'live-demo': 'interactive-demo',
  'external-verification': 'externally-verified-outcome',
}

const REVISION_PINNED_KINDS = new Set<EvidenceArtifactKind>([
  'test-source',
  'observed-result',
  'execution-trace',
  'screenshot',
])

const FULL_GIT_REVISION = /^[0-9a-f]{40}$/
const ISO_DATE_OR_TIME = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/

export function strongestEvidenceLevel(artifacts: readonly EvidenceArtifact[]): EvidenceLevel {
  return artifacts.reduce<EvidenceLevel>((strongest, artifact) => {
    const candidate = ARTIFACT_EVIDENCE_LEVEL[artifact.kind]
    return EVIDENCE_RANK[candidate] > EVIDENCE_RANK[strongest] ? candidate : strongest
  }, 'prose-only')
}

export function matchesEvidenceFilter(project: ProjectEvidence, filter: EvidenceFilter): boolean {
  if (filter === 'all') return true
  if (filter === 'interactive') return project.artifacts.some(artifact => artifact.kind === 'live-demo')
  if (filter === 'test-artifacts') {
    return project.artifacts.some(artifact => ['test-source', 'observed-result', 'execution-trace'].includes(artifact.kind))
  }
  return project.dataExposure === 'private'
}

export function isSafeExternalUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password
  } catch {
    return false
  }
}

export function isValidInternalRoute(value: string): boolean {
  if (!value.startsWith('/') || value.startsWith('//') || /[\s\\]/.test(value)) return false
  try {
    const base = 'https://evidence.invalid'
    return new URL(value, base).origin === base
  } catch {
    return false
  }
}

function isIsoDateOrTime(value: string): boolean {
  return ISO_DATE_OR_TIME.test(value) && !Number.isNaN(Date.parse(value))
}

function duplicateValues(values: readonly string[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value)
    seen.add(value)
  }
  return [...duplicates]
}

function validateArtifact(projectId: string, artifact: EvidenceArtifact): string[] {
  const errors: string[] = []
  const path = `${projectId}/${artifact.id}`

  if (!artifact.resultBoundary?.trim()) errors.push(`${path}: result boundary is required`)

  if (artifact.location.type === 'external') {
    const { url } = artifact.location
    if (!isSafeExternalUrl(url)) errors.push(`${path}: external artifact must use a safe HTTPS URL`)
    if (artifact.dataExposure === 'private') errors.push(`${path}: private data cannot use an external artifact`)
    if (
      artifact.sourceRevision &&
      isSafeExternalUrl(url) &&
      new URL(url).hostname === 'github.com' &&
      !new URL(url).pathname.includes(artifact.sourceRevision)
    ) {
      errors.push(`${path}: GitHub artifact URL must contain its source revision`)
    }
  } else if (!isValidInternalRoute(artifact.location.route)) {
    errors.push(`${path}: invalid internal route`)
  }

  if (artifact.sourceRevision && !FULL_GIT_REVISION.test(artifact.sourceRevision)) {
    errors.push(`${path}: source revision must be a full lowercase Git commit`)
  }
  if (REVISION_PINNED_KINDS.has(artifact.kind) && !artifact.sourceRevision) {
    errors.push(`${path}: ${artifact.kind} requires a pinned source revision`)
  }
  if (artifact.observedAt && !isIsoDateOrTime(artifact.observedAt)) {
    errors.push(`${path}: invalid observation timestamp`)
  }

  const verification = artifact.verification
  if (verification.method === 'artifact-inspection' && !isIsoDateOrTime(verification.inspectedAt)) {
    errors.push(`${path}: invalid inspection timestamp`)
  }
  if (verification.method === 'local-run') {
    if (!verification.command.trim()) errors.push(`${path}: local run command is required`)
    if (!isIsoDateOrTime(verification.observedAt)) errors.push(`${path}: invalid local run timestamp`)
  }
  if (verification.method === 'reference-only' && artifact.kind !== 'architecture') {
    errors.push(`${path}: reference-only entries cannot support ${artifact.kind}`)
  }

  return errors
}

/** Runtime policy checks for registry additions that types alone cannot enforce. */
export function validateEvidenceContent(content: EvidenceContent): string[] {
  const errors: string[] = []

  for (const id of duplicateValues(content.projects.map(project => project.id))) {
    errors.push(`projects: duplicate id ${id}`)
  }
  for (const id of PROJECT_IDS) {
    if (!content.projects.some(project => project.id === id)) errors.push(`projects: missing ${id}`)
  }

  const artifacts = content.projects.flatMap(project => project.artifacts)
  for (const id of duplicateValues(artifacts.map(artifact => artifact.id))) {
    errors.push(`artifacts: duplicate id ${id}`)
  }

  for (const project of content.projects) {
    const derivedLevel = strongestEvidenceLevel(project.artifacts)
    if (derivedLevel !== project.evidenceLevel) {
      errors.push(`${project.id}: declared ${project.evidenceLevel}, artifacts support ${derivedLevel}`)
    }
    for (const artifact of project.artifacts) errors.push(...validateArtifact(project.id, artifact))
  }

  for (const name of duplicateValues(content.repositories.map(repository => repository.name))) {
    errors.push(`repositories: duplicate id ${name}`)
  }
  for (const name of PUBLIC_REPOSITORY_NAMES) {
    if (!content.repositories.some(repository => repository.name === name)) {
      errors.push(`repositories: missing ${name}`)
    }
  }

  const caseStudyIds = new Set(content.projects.map(project => project.id))
  for (const repository of content.repositories) {
    if (!isSafeExternalUrl(repository.repositoryUrl)) {
      errors.push(`${repository.name}: unsafe repository URL`)
    }
    if (repository.demoUrl && !isSafeExternalUrl(repository.demoUrl)) {
      errors.push(`${repository.name}: unsafe demo URL`)
    }
    if (repository.homepageUrl && !isSafeExternalUrl(repository.homepageUrl)) {
      errors.push(`${repository.name}: unsafe homepage URL`)
    }
    if (!caseStudyIds.has(repository.primaryCaseStudyId)) {
      errors.push(`${repository.name}: unknown primary case study`)
    }
    if (!isIsoDateOrTime(repository.lastInspectedAt)) {
      errors.push(`${repository.name}: invalid inspection timestamp`)
    }
  }

  for (const id of duplicateValues(content.researchMethods.map(note => note.id))) {
    errors.push(`research methods: duplicate id ${id}`)
  }

  return errors
}
