import { z } from 'zod'
import snapshot from '../data/github-repos.json'

export interface Repo {
  name: string
  description: string | null
  html_url: string
  homepage: string | null
  language: string | null
  topics: string[]
  stargazers_count: number
  /** Kept false for compatibility with the previous archive row component. */
  private: false
  fork: boolean
  created_at: string
  pushed_at: string
}

/** Legacy exports remain while the Work UI moves to one curated collection. */
export type Tier = 'applied' | 'practice' | 'foundations'

export const TIER_META: Record<Tier, { label: string; blurb: string }> = {
  applied: {
    label: 'Applied',
    blurb: 'Selected public projects',
  },
  practice: {
    label: 'Machine learning practice',
    blurb: 'Earlier practice repositories',
  },
  foundations: {
    label: 'Foundations',
    blurb: 'Earlier coursework',
  },
}

export const tierOf: (repo: Repo) => Tier = () => 'applied'

export const LANGUAGE_COLOR: Record<string, string> = {
  Python: 'var(--color-signal)',
  TypeScript: 'var(--color-data)',
  JavaScript: 'var(--color-cred)',
  'Jupyter Notebook': 'var(--color-agent)',
  HTML: 'var(--color-threat)',
  CSS: 'var(--color-data)',
  Java: 'var(--color-cred)',
  'C++': 'var(--color-agent)',
}

const GITHUB_USER = 'Faris-Maulana'
const GITHUB_TIMEOUT_MS = 8_000

export const CURATED_REPOS = [
  'rag-system',
  'faris-portfolio',
  'wealth-advisor-agents',
  'ottodot-trial-booking',
] as const

const githubDate = z
  .string()
  .max(40)
  .regex(/^\d{4}-\d{2}-\d{2}(?:T|$)/, 'Invalid date')
  .refine(value => !Number.isNaN(Date.parse(value)), 'Invalid date')

const githubRepoSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).nullable(),
  html_url: z.url(),
  homepage: z.string().max(500).nullable().optional(),
  language: z.string().max(100).nullable(),
  topics: z.array(z.string().max(50)).max(30).default([]),
  stargazers_count: z.number().int().nonnegative().default(0),
  private: z.boolean().default(false),
  fork: z.boolean().default(false),
  archived: z.boolean().default(false),
  created_at: githubDate,
  pushed_at: githubDate,
})

function publicHomepage(value: string | undefined | null): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null
  } catch {
    return null
  }
}

/**
 * Validates external data and returns only explicitly selected public projects,
 * in editorial order. Unlisted, private, archived, and malformed entries are
 * discarded rather than being promoted by recent activity.
 */
export function curateRepos(raw: unknown): Repo[] {
  if (!Array.isArray(raw)) return []

  const selected = new Map<string, Repo>()
  for (const item of raw) {
    const parsed = githubRepoSchema.safeParse(item)
    if (!parsed.success || parsed.data.private || parsed.data.archived) continue

    const repo = parsed.data
    const index = CURATED_REPOS.findIndex(
      name => name.toLowerCase() === repo.name.toLowerCase()
    )
    if (index < 0) continue

    const name = CURATED_REPOS[index]
    const key = name.toLowerCase()
    if (selected.has(key)) continue

    selected.set(key, {
      name,
      description: repo.description?.trim() || null,
      html_url: `https://github.com/${GITHUB_USER}/${name}`,
      homepage: publicHomepage(repo.homepage),
      language: repo.language,
      topics: repo.topics,
      stargazers_count: repo.stargazers_count,
      private: false,
      fork: repo.fork,
      created_at: repo.created_at.slice(0, 10),
      pushed_at: repo.pushed_at.slice(0, 10),
    })
  }

  return CURATED_REPOS.map(name => selected.get(name.toLowerCase())).filter(
    (repo): repo is Repo => Boolean(repo)
  )
}

export const REPO_SNAPSHOT = curateRepos(snapshot)

/** Hourly ISR with the committed curated snapshot as the failure floor. */
export async function getRepos(): Promise<Repo[]> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&type=owner`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(GITHUB_TIMEOUT_MS),
      }
    )
    if (!res.ok) return REPO_SNAPSHOT

    const data: unknown = await res.json()
    const repos = curateRepos(data)
    return repos.length > 0 ? repos : REPO_SNAPSHOT
  } catch {
    return REPO_SNAPSHOT
  }
}

export const GITHUB_PROFILE = `https://github.com/${GITHUB_USER}`
