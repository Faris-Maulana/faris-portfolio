import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CURATED_REPOS, REPO_SNAPSHOT, curateRepos, getRepos, tierOf } from '../../src/lib/github'

const fetchMock = vi.fn<typeof fetch>()

function fixture(name: string, overrides: Record<string, unknown> = {}) {
  return {
    name,
    description: `Description for ${name}`,
    html_url: `https://github.com/Faris-Maulana/${name}`,
    homepage: null,
    language: 'TypeScript',
    topics: [],
    stargazers_count: 0,
    private: false,
    fork: false,
    archived: false,
    created_at: '2024-01-01T00:00:00Z',
    pushed_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('curateRepos', () => {
  it('validates input and uses editorial rather than activity ordering', () => {
    const repos = curateRepos([
      fixture('unlisted-new-project', { pushed_at: '2027-01-01T00:00:00Z' }),
      fixture('faris-portfolio', { pushed_at: '2020-01-01T00:00:00Z' }),
      fixture('rag-system', { pushed_at: '2026-01-01T00:00:00Z' }),
    ])

    expect(repos.map(repo => repo.name)).toEqual(['rag-system', 'faris-portfolio'])
    expect(repos.every(repo => repo.private === false)).toBe(true)
    expect(repos.every(repo => tierOf(repo) === 'applied')).toBe(true)
  })

  it('drops private, malformed, and unsafe entries', () => {
    const repos = curateRepos([
      fixture('rag-system', { private: true }),
      fixture('faris-portfolio', { homepage: 'javascript:alert(1)' }),
      { name: 'wealth-advisor-agents' },
      null,
    ])

    expect(repos).toHaveLength(1)
    expect(repos[0]).toMatchObject({ name: 'faris-portfolio', homepage: 'https://faris-portfolio-red.vercel.app/' })
    expect(curateRepos({ not: 'an array' })).toEqual([])
  })

  it('keeps trusted editorial descriptions instead of live repository prose', () => {
    const [repo] = curateRepos([fixture('rag-system', { description: 'Production-grade and flawless', homepage: 'javascript:alert(1)' })])
    expect(repo?.description).toBe('Readable RAG reference covering dense retrieval, reranking and retrieval-only evaluation over public Wikipedia material.')
    expect(repo?.homepage).toBeNull()
  })

  it('retains all supported allowlist entries when GitHub supplies them', () => {
    const repos = curateRepos(CURATED_REPOS.map(name => fixture(name)))
    expect(repos.map(repo => repo.name)).toEqual(CURATED_REPOS)
  })
})

describe('getRepos', () => {
  it('uses the hourly public endpoint without authentication', async () => {
    fetchMock.mockImplementation(async () => Response.json([fixture('rag-system')]))
    const repos = await getRepos()

    expect(repos.map(repo => repo.name)).toEqual(CURATED_REPOS)
    expect(repos.find(repo => repo.name === 'rag-system')?.pushed_at).toBe('2024-01-01')
    expect(repos.find(repo => repo.name === 'wealth-advisor-agents')?.description).toContain('Synthetic-data multi-agent')
    const [url, init] = fetchMock.mock.calls[0]!
    expect(String(url)).toContain('/users/Faris-Maulana/repos')
    expect(init).toMatchObject({ next: { revalidate: 3600 } })
    expect(new Headers(init?.headers).has('Authorization')).toBe(false)
  })

  it('falls back to the validated snapshot on network or payload failure', async () => {
    fetchMock.mockRejectedValue(new Error('offline'))
    expect(await getRepos()).toEqual(REPO_SNAPSHOT)

    fetchMock.mockImplementation(async () => Response.json([fixture('unlisted')]))
    expect(await getRepos()).toEqual(REPO_SNAPSHOT)
    expect(REPO_SNAPSHOT.map(repo => repo.name)).toEqual(CURATED_REPOS)
  })
})
