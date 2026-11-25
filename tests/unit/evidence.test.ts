import { describe, expect, it } from 'vitest'
import {
  ARTIFACT_KINDS,
  DATA_EXPOSURE_LABELS,
  DATA_EXPOSURES,
  EVIDENCE_LEVEL_LABELS,
  EVIDENCE_LEVELS,
  LIFECYCLE_LABELS,
  PROJECT_IDS,
  PROJECT_LIFECYCLES,
  PUBLIC_REPOSITORY_NAMES,
  isSafeExternalUrl,
  isValidInternalRoute,
  matchesEvidenceFilter,
  strongestEvidenceLevel,
  validateEvidenceContent,
  type EvidenceArtifact,
  type EditorialRepository,
  type EvidenceContent,
  type ProjectEvidence,
  type ProjectId,
} from '../../src/lib/evidence'
import {
  EVIDENCE_CONTENT,
  EVIDENCE_REGISTRY as REGISTRY_DATA,
  PUBLIC_REPOSITORY_MANIFEST as REPOSITORY_DATA,
  RESEARCH_METHODS,
} from '../../src/lib/evidence-content'

const PROJECTS: readonly ProjectEvidence[] = REGISTRY_DATA
const REPOSITORIES: readonly EditorialRepository[] = REPOSITORY_DATA
const ALL_ARTIFACTS = PROJECTS.flatMap(project => project.artifacts)
const VALID_ROUTE_REFERENCES = new Set([
  '/work/text2sql',
  '/work/noc-agent',
  '/work/appraisal',
  '/simpul',
  '/#research',
])

function replaceProject(project: ProjectEvidence): EvidenceContent {
  return {
    ...EVIDENCE_CONTENT,
    projects: PROJECTS.map(current => (current.id === project.id ? project : current)),
  }
}

function changeArtifact(
  projectId: ProjectId,
  artifactId: string,
  change: (artifact: EvidenceArtifact) => EvidenceArtifact,
): ProjectEvidence {
  const project = PROJECTS.find(current => current.id === projectId)
  if (!project) throw new Error(`Unknown test project: ${projectId}`)
  return {
    ...project,
    artifacts: project.artifacts.map(artifact =>
      artifact.id === artifactId ? change(artifact) : artifact,
    ),
  }
}

function objectKeys(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(objectKeys)
  if (!value || typeof value !== 'object') return []
  return Object.entries(value).flatMap(([key, child]) => [key, ...objectKeys(child)])
}

describe('evidence registry coverage and identity', () => {
  it('covers every project, public repository and research method exactly once', () => {
    expect(PROJECTS.map(project => project.id)).toEqual(PROJECT_IDS)
    expect(new Set(PROJECTS.map(project => project.id)).size).toBe(PROJECT_IDS.length)
    expect(REPOSITORIES.map(repository => repository.name)).toEqual(
      PUBLIC_REPOSITORY_NAMES,
    )
    expect(new Set(REPOSITORIES.map(repository => repository.name)).size).toBe(
      PUBLIC_REPOSITORY_NAMES.length,
    )
    expect(RESEARCH_METHODS).toHaveLength(4)
    expect(new Set(RESEARCH_METHODS.map(note => note.id)).size).toBe(4)
    expect(new Set(ALL_ARTIFACTS.map(artifact => artifact.id)).size).toBe(ALL_ARTIFACTS.length)
    expect(validateEvidenceContent(EVIDENCE_CONTENT)).toEqual([])
  })

  it('provides a display label for every closed taxonomy value', () => {
    expect(Object.keys(LIFECYCLE_LABELS).sort()).toEqual([...PROJECT_LIFECYCLES].sort())
    expect(Object.keys(EVIDENCE_LEVEL_LABELS).sort()).toEqual([...EVIDENCE_LEVELS].sort())
    expect(Object.keys(DATA_EXPOSURE_LABELS).sort()).toEqual([...DATA_EXPOSURES].sort())
    expect(ALL_ARTIFACTS.every(artifact => ARTIFACT_KINDS.includes(artifact.kind))).toBe(true)
  })

  it('rejects duplicate project and artifact identifiers', () => {
    const firstProject = PROJECTS[0]!
    const secondProject = changeArtifact('noc-agent', 'noc-agent-architecture', artifact => ({
      ...artifact,
      id: firstProject.artifacts[0]!.id,
    }))
    const errors = validateEvidenceContent({
      ...EVIDENCE_CONTENT,
      projects: [...PROJECTS, firstProject].map(project =>
        project.id === secondProject.id ? secondProject : project,
      ),
    })

    expect(errors).toContain(`projects: duplicate id ${firstProject.id}`)
    expect(errors).toContain(`artifacts: duplicate id ${firstProject.artifacts[0]!.id}`)
  })
})

describe('evidence index filters', () => {
  it('filters only by facts present in the evidence registry', () => {
    const ids = (filter: Parameters<typeof matchesEvidenceFilter>[1]) => PROJECTS.filter(project => matchesEvidenceFilter(project, filter)).map(project => project.id)
    expect(ids('interactive')).toEqual(['wealth-advisor', 'simpul', 'portfolio'])
    expect(ids('test-artifacts')).toEqual(['rag-eval', 'wealth-advisor', 'ottodot', 'portfolio'])
    expect(ids('private-boundary')).toEqual(['text2sql', 'noc-agent', 'appraisal'])
    expect(ids('all')).toEqual(PROJECT_IDS)
  })
})

describe('evidence levels and provenance', () => {
  it('derives each declared level from the strongest attached artifact', () => {
    for (const project of PROJECTS) {
      expect(strongestEvidenceLevel(project.artifacts), project.id).toBe(project.evidenceLevel)
    }
    expect(strongestEvidenceLevel([])).toBe('prose-only')
  })

  it('requires full revision provenance for source and committed-result artifacts', () => {
    const pinnedKinds = new Set(['test-source', 'observed-result', 'execution-trace', 'screenshot'])
    for (const artifact of ALL_ARTIFACTS) {
      if (!pinnedKinds.has(artifact.kind)) continue
      expect(artifact.sourceRevision, artifact.id).toMatch(/^[0-9a-f]{40}$/)
      if (artifact.location.type === 'external') {
        expect(artifact.location.url).toContain(artifact.sourceRevision)
      }
    }
  })

  it('rejects an elevated level without a supporting external-verification artifact', () => {
    const web3 = PROJECTS.find(project => project.id === 'web3-security')!
    const errors = validateEvidenceContent(
      replaceProject({ ...web3, evidenceLevel: 'externally-verified-outcome' }),
    )
    expect(errors).toContain(
      'web3-security: declared externally-verified-outcome, artifacts support prose-only',
    )
  })

  it('keeps inspection distinct from execution and reference-only routes', () => {
    expect(ALL_ARTIFACTS.some(artifact => artifact.verification.method === 'artifact-inspection')).toBe(
      true,
    )
    const localRuns = ALL_ARTIFACTS.filter(artifact => artifact.verification.method === 'local-run')
    expect(localRuns.map(artifact => artifact.id)).toEqual(['simpul-local-interactive-run'])
    for (const artifact of localRuns) {
      if (artifact.verification.method !== 'local-run') throw new Error('Expected local run')
      expect(artifact.verification.command).toContain('playwright test tests/e2e/simpul.spec.ts')
      expect(artifact.verification.observedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
      expect(artifact.dataExposure).toBe('synthetic')
    }
    for (const artifact of ALL_ARTIFACTS) {
      if (artifact.kind !== 'architecture') {
        expect(artifact.verification.method, artifact.id).not.toBe('reference-only')
      }
    }

    const project = changeArtifact('wealth-advisor', 'wealth-browser-demo', artifact => ({
      ...artifact,
      verification: { method: 'reference-only' },
    }))
    expect(validateEvidenceContent(replaceProject(project))).toContain(
      'wealth-advisor/wealth-browser-demo: reference-only entries cannot support live-demo',
    )
  })

  it('rejects an unpinned committed result', () => {
    const project = changeArtifact('rag-eval', 'rag-retrieval-report', artifact => ({
      ...artifact,
      sourceRevision: undefined,
    }))
    expect(validateEvidenceContent(replaceProject(project))).toContain(
      'rag-eval/rag-retrieval-report: observed-result requires a pinned source revision',
    )
  })
})

describe('safe references and editorial boundaries', () => {
  it('uses safe HTTPS URLs and rejects an unsafe protocol through the validator', () => {
    for (const artifact of ALL_ARTIFACTS) {
      if (artifact.location.type === 'external') {
        expect(isSafeExternalUrl(artifact.location.url), artifact.id).toBe(true)
        expect(new URL(artifact.location.url).protocol).toBe('https:')
      }
    }
    for (const repository of REPOSITORIES) {
      expect(isSafeExternalUrl(repository.repositoryUrl)).toBe(true)
      if (repository.demoUrl) expect(isSafeExternalUrl(repository.demoUrl)).toBe(true)
      if (repository.homepageUrl) expect(isSafeExternalUrl(repository.homepageUrl)).toBe(true)
    }

    const project = changeArtifact('rag-eval', 'rag-evaluation-test-source', artifact => ({
      ...artifact,
      location: { type: 'external', url: 'javascript:alert(1)' },
    }))
    expect(validateEvidenceContent(replaceProject(project))).toContain(
      'rag-eval/rag-evaluation-test-source: external artifact must use a safe HTTPS URL',
    )
  })

  it('references only registered internal routes and rejects network-path references', () => {
    for (const artifact of ALL_ARTIFACTS) {
      if (artifact.location.type !== 'internal') continue
      expect(isValidInternalRoute(artifact.location.route), artifact.id).toBe(true)
      expect(VALID_ROUTE_REFERENCES.has(artifact.location.route), artifact.id).toBe(true)
    }

    const project = changeArtifact('text2sql', 'text2sql-architecture', artifact => ({
      ...artifact,
      location: { type: 'internal', route: '//example.com/redirect' },
    }))
    expect(validateEvidenceContent(replaceProject(project))).toContain(
      'text2sql/text2sql-architecture: invalid internal route',
    )
  })

  it('keeps planned evidence as strings outside the artifact collection', () => {
    for (const project of PROJECTS) {
      expect(project.nextEvidence.every(plan => typeof plan === 'string' && plan.trim().length > 0)).toBe(
        true,
      )
    }
    for (const id of ['text2sql', 'noc-agent', 'appraisal'] as const) {
      const project = PROJECTS.find(current => current.id === id)!
      expect(project.evidenceLevel).toBe('prose-only')
      expect(project.artifacts.every(artifact => artifact.kind === 'architecture')).toBe(true)
      expect(project.nextEvidence.length).toBeGreaterThan(0)
    }
  })

  it('does not introduce metric or target payload fields', () => {
    const forbiddenKeys = objectKeys(EVIDENCE_CONTENT).filter(key =>
      /^(?:metrics?|targets?|metricTargets|targetMetrics)$/i.test(key),
    )
    expect(forbiddenKeys).toEqual([])
  })

  it('records only the executed SIMPUL browser workflow, without model or production outcome claims', () => {
    const simpul = PROJECTS.find(project => project.id === 'simpul')!
    expect(simpul.lifecycle).toBe('public-reference-implementation')
    expect(simpul.evidenceLevel).toBe('interactive-demo')
    expect(simpul.dataExposure).toBe('synthetic')
    expect(simpul.artifacts).toHaveLength(1)
    expect(simpul.artifacts[0]).toMatchObject({
      id: 'simpul-local-interactive-run',
      kind: 'live-demo',
      location: { type: 'internal', route: '/simpul' },
      dataExposure: 'synthetic',
      verification: {
        method: 'local-run',
        observedAt: '2026-11-25T03:49:09Z',
      },
    })
    expect(simpul.artifacts[0]!.sourceRevision).toBeUndefined()
    expect(simpul.artifacts[0]!.commitLabel).toBeUndefined()
    expect(simpul.summary).not.toMatch(/live model quality|production network control/i)
    expect(simpul.nextEvidence.join(' ')).toMatch(/model-backed runs/i)
  })

  it('does not attach an external outcome to Web3 research', () => {
    const web3 = PROJECTS.find(project => project.id === 'web3-security')!
    expect(web3.evidenceLevel).toBe('prose-only')
    expect(web3.artifacts.some(artifact => artifact.kind === 'external-verification')).toBe(false)
    expect(web3.artifacts.some(artifact => artifact.kind === 'observed-result')).toBe(false)
  })

  it('limits editorial demos and homepages to the inspected destinations', () => {
    const wealth = REPOSITORIES.find(repository => repository.name === 'wealth-advisor-agents')!
    const portfolio = REPOSITORIES.find(repository => repository.name === 'faris-portfolio')!
    expect(wealth.demoUrl).toBe('https://faris-maulana.github.io/wealth-advisor-agents/')
    expect(portfolio.homepageUrl).toBe('https://faris-portfolio-red.vercel.app/')
    expect(REPOSITORIES.filter(repository => repository.demoUrl)).toHaveLength(1)
    expect(REPOSITORIES.filter(repository => repository.homepageUrl)).toHaveLength(1)
    expect(REPOSITORIES.map(repository => repository.primaryCaseStudyId)).toEqual([
      'rag-eval',
      'wealth-advisor',
      'ottodot',
      'portfolio',
    ])
  })

  it('keeps all four research notes methodological and private-data bounded', () => {
    for (const note of RESEARCH_METHODS) {
      expect(note.method.trim().length).toBeGreaterThan(0)
      expect(note.question.trim().length).toBeGreaterThan(0)
      expect(note.inferenceBoundary.trim().length).toBeGreaterThan(0)
      expect(note.evidenceBoundary.trim().length).toBeGreaterThan(0)
      expect(note.dataExposure).toBe('private')
    }
  })
})
