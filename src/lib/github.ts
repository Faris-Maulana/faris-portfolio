import snapshot from '@/data/github-repos.json'

export interface Repo {
  name: string
  description: string | null
  html_url: string
  homepage: string | null
  language: string | null
  topics: string[]
  stargazers_count: number
  private: boolean
  fork: boolean
  created_at: string
  pushed_at: string
}

/**
 * Repos are tiered rather than dumped in one flat list.
 *
 * The account spans six years, from first-year coursework to production AI
 * work. Presenting a 2020 HTML assignment beside a RAG pipeline reads as
 * inflation and drags the whole page down to the level of its weakest item, so
 * the tier drives both ordering and how much space each card gets.
 */
export type Tier = 'applied' | 'practice' | 'foundations'

export const TIER_META: Record<Tier, { label: string; blurb: string }> = {
  applied: {
    label: 'Applied',
    blurb: 'Production systems and working tools',
  },
  practice: {
    label: 'Machine learning practice',
    blurb: 'CNN, VGG, YOLO, and classical ML notebooks from 2021',
  },
  foundations: {
    label: 'Foundations',
    blurb: 'Coursework and first builds, 2020 to 2021',
  },
}

const PRACTICE_HINTS = [
  'classification',
  'object-detection',
  'opencv',
  'machine-learning',
  'training-data',
  'ai_dengan_python',
  'klasifikasi',
]

export function tierOf(repo: Repo): Tier {
  const year = Number(repo.pushed_at.slice(0, 4))
  if (year >= 2022) return 'applied'

  const name = repo.name.toLowerCase()
  if (
    repo.language === 'Jupyter Notebook' ||
    PRACTICE_HINTS.some(hint => name.includes(hint))
  ) {
    return 'practice'
  }
  return 'foundations'
}

/** Language → the accent token used for its dot. */
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

function normalise(raw: unknown[]): Repo[] {
  return raw
    .map(item => item as Record<string, unknown>)
    // The profile README repo shares the account name and is not a project.
    .filter(r => !r.archived && r.name !== GITHUB_USER)
    .map(r => ({
      name: String(r.name),
      description: (r.description as string | null) ?? null,
      html_url: String(r.html_url),
      homepage: (r.homepage as string) || null,
      language: (r.language as string | null) ?? null,
      topics: (r.topics as string[]) ?? [],
      stargazers_count: Number(r.stargazers_count ?? 0),
      private: Boolean(r.private),
      fork: Boolean(r.fork),
      created_at: String(r.created_at).slice(0, 10),
      pushed_at: String(r.pushed_at).slice(0, 10),
    }))
    .sort((a, b) => b.pushed_at.localeCompare(a.pushed_at))
}

/**
 * Live repo list with a committed snapshot as the floor.
 *
 * Two endpoints, chosen by whether a token is configured:
 *
 *   GITHUB_TOKEN set    /user/repos      public + private, 5,000 req/hour
 *   no token            /users/:u/repos  public only, 60 req/hour
 *
 * Private repositories are invisible to the unauthenticated API, so without a
 * token the archive can only ever show what GitHub shows a stranger. Set
 * GITHUB_TOKEN in the deployment environment (a fine-grained token with
 * read-only "Metadata" access is enough) and the private work appears on its
 * own with no code change.
 *
 * A failed fetch falls back to the committed snapshot rather than rendering an
 * empty section, so the page is never worse than the last commit.
 */
export async function getRepos(): Promise<Repo[]> {
  const token = process.env.GITHUB_TOKEN

  const url = token
    ? 'https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner'
    : `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated&type=all`

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      next: { revalidate: 3600 },
    })
    if (!res.ok) throw new Error(`GitHub responded ${res.status}`)

    const data = (await res.json()) as unknown[]
    if (!Array.isArray(data) || data.length === 0) throw new Error('Empty payload')

    const repos = normalise(data)
    // A token that resolves to the wrong account would silently replace the
    // archive with someone else's work.
    return repos.length >= snapshot.length ? repos : (snapshot as Repo[])
  } catch {
    return snapshot as Repo[]
  }
}

export const REPO_SNAPSHOT = snapshot as Repo[]
export const GITHUB_PROFILE = `https://github.com/${GITHUB_USER}`
