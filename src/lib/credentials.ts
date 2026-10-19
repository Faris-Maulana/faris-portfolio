/**
 * Credentials, checked into the repo.
 *
 * Inclusion rule: every entry carries evidence a stranger can check, either a
 * public verification URL, a credential ID, or the document itself under
 * /public/certificates. Anything that could only be asserted is left out,
 * however impressive. One dead verification link costs more trust than ten
 * extra badges earn.
 *
 * Sources: LinkedIn certifications (Oct 2026), the uploaded documents, and the
 * Drive portfolio where it cites a credential ID. Verify URLs were checked to
 * resolve when this file was written.
 */

export type CredentialTrack = 'ai' | 'data' | 'engineering'
export type CredentialKind = 'Degree' | 'Competency' | 'Certificate' | 'Course' | 'Attendance'

export interface Credential {
  title: string
  issuer: string
  kind: CredentialKind
  track: CredentialTrack
  /** Display date, e.g. "Mar 2026". */
  issued: string
  /** YYYY-MM. When set, the card shows valid or expired against today. */
  expires?: string
  credentialId?: string
  /** Public verification page. Preferred over `file` when both exist. */
  verify?: string
  /** Document under /public. */
  file?: string
  note?: string
  featured?: boolean
}

export const TRACK_META: Record<CredentialTrack, { label: string; color: string }> = {
  ai: { label: 'AI and LLM', color: 'var(--color-agent)' },
  data: { label: 'Data and BI', color: 'var(--color-data)' },
  engineering: { label: 'Engineering', color: 'var(--color-signal)' },
}

export const CREDENTIAL_TRACKS = ['ai', 'data', 'engineering'] as const

export const CREDENTIALS: Credential[] = [
  /* ── Formal ───────────────────────────────────────────────────────── */
  {
    title: 'Sarjana Teknik (S.T.), Informatics Engineering',
    issuer: 'Universitas Pancasila',
    kind: 'Degree',
    track: 'engineering',
    issued: 'Feb 2024',
    credentialId: '552012024000131',
    file: '/certificates/universitas-pancasila-ijazah.pdf',
    note: 'GPA 3.78 of 4.00. Program accredited Unggul. Personal identifiers redacted.',
    featured: true,
  },
  {
    title: 'Certificate of Competence, Lead Programmer',
    issuer: 'BNSP, via LSP Universitas Pancasila',
    kind: 'Competency',
    track: 'engineering',
    issued: 'Nov 2022',
    expires: '2025-11',
    credentialId: '62019 2514 6 0001233 2022',
    file: '/certificates/bnsp-lead-programmer.pdf',
    note: 'National competency standard for software development. 21 units, from architecture and code review to migration and security risk.',
    featured: true,
  },
  {
    title: 'Academic transcript',
    issuer: 'Universitas Pancasila',
    kind: 'Degree',
    track: 'engineering',
    issued: 'May 2024',
    file: '/certificates/universitas-pancasila-transcript.pdf',
    note: 'Full course record, 144 credits. Identifiers redacted.',
  },

  /* ── AI ───────────────────────────────────────────────────────────── */
  {
    title: 'Claude Academy: Claude Code 101',
    issuer: 'Anthropic',
    kind: 'Certificate',
    track: 'ai',
    issued: 'Sep 2026',
    credentialId: '63ccb459cfeaca223c1b5f37e849efd6',
    verify: 'https://academy.claude.com/verify/63ccb459cfeaca223c1b5f37e849efd6',
    featured: true,
  },
  {
    title: 'Claude Code in Action',
    issuer: 'Anthropic',
    kind: 'Certificate',
    track: 'ai',
    issued: 'Mar 2026',
    credentialId: 'aqfbcjyv6a88',
    verify: 'https://verify.skilljar.com/c/aqfbcjyv6a88',
    file: '/certificates/anthropic-claude-code-in-action.pdf',
  },
  {
    title: 'Introduction to Claude Cowork',
    issuer: 'Anthropic',
    kind: 'Certificate',
    track: 'ai',
    issued: 'Mar 2026',
    credentialId: '8ymfa9qi498a',
    verify: 'https://verify.skilljar.com/c/8ymfa9qi498a',
    file: '/certificates/anthropic-claude-cowork.pdf',
  },
  {
    title: 'Claude 101',
    issuer: 'Anthropic',
    kind: 'Certificate',
    track: 'ai',
    issued: 'Mar 2026',
    credentialId: 'qxhf6zeaqbw6',
    verify: 'https://verify.skilljar.com/c/qxhf6zeaqbw6',
    file: '/certificates/anthropic-claude-101.pdf',
  },
  {
    title: 'Machine Learning, Deep Learning and Bayesian Learning',
    issuer: 'Professional training',
    kind: 'Course',
    track: 'ai',
    issued: '2023',
    file: '/certificates/ml-dl-bayesian-learning.jpg',
  },
  {
    title: 'Machine Learning, Basic to Advanced',
    issuer: 'Professional training',
    kind: 'Course',
    track: 'ai',
    issued: '2023',
    file: '/certificates/ml-basic-to-advanced.jpg',
  },

  /* ── Data ─────────────────────────────────────────────────────────── */
  {
    title: 'Data for Breakfast, Asia Pacific',
    issuer: 'Snowflake',
    kind: 'Attendance',
    track: 'data',
    issued: 'Apr 2026',
    file: '/certificates/snowflake-data-for-breakfast-apac.pdf',
  },
  {
    title: 'Introduction to Data Analytics',
    issuer: 'Simplilearn',
    kind: 'Course',
    track: 'data',
    issued: 'Dec 2025',
    credentialId: '9517352',
    verify: 'https://simpli-web.app.link/e/LlHPZApQMYb',
    file: '/certificates/introduction-data-analytics.pdf',
  },
  {
    title: 'Business Intelligence Fundamentals',
    issuer: 'Simplilearn',
    kind: 'Course',
    track: 'data',
    issued: 'Feb 2024',
    credentialId: '4844263',
    verify: 'https://simpli-web.app.link/e/eKl87KnwRGb',
    file: '/certificates/business-intelligence-fundamental.png',
  },
  {
    title: 'Data Science Fundamentals',
    issuer: 'Dicoding Indonesia',
    kind: 'Certificate',
    track: 'data',
    issued: 'Nov 2023',
    expires: '2026-11',
    credentialId: '0LZ0QKM13Z65',
    verify: 'https://www.dicoding.com/certificates/0LZ0QKM13Z65',
    file: '/certificates/dicoding-data-science.pdf',
  },
  {
    title: 'SQL Fundamentals',
    issuer: 'Dicoding Indonesia',
    kind: 'Certificate',
    track: 'data',
    issued: 'Nov 2023',
    expires: '2026-11',
    credentialId: 'KEXL8EWR0ZG2',
    verify: 'https://www.dicoding.com/certificates/KEXL8EWR0ZG2',
    file: '/certificates/dicoding-sql.pdf',
  },
  {
    title: 'Data Visualization Fundamentals',
    issuer: 'Dicoding Indonesia',
    kind: 'Certificate',
    track: 'data',
    issued: 'Jun 2022',
    expires: '2025-06',
    credentialId: '6RPNDV9Y8Z2M',
    verify: 'https://www.dicoding.com/certificates/6RPNDV9Y8Z2M',
    file: '/certificates/dicoding-data-visualization.pdf',
  },
  {
    title: 'Data Cleaning',
    issuer: 'Kaggle Learn',
    kind: 'Course',
    track: 'data',
    issued: 'Apr 2022',
    file: '/certificates/data-cleaning.pdf',
  },
  {
    title: 'Data Visualization',
    issuer: 'Kaggle Learn',
    kind: 'Course',
    track: 'data',
    issued: 'Apr 2022',
    file: '/certificates/data-visualization.pdf',
  },

  /* ── Engineering ──────────────────────────────────────────────────── */
  {
    title: 'Google Cloud Fundamentals',
    issuer: 'Dicoding Indonesia',
    kind: 'Certificate',
    track: 'engineering',
    issued: 'May 2022',
    expires: '2025-05',
    credentialId: 'NVP7KKDQVZR0',
    verify: 'https://www.dicoding.com/certificates/NVP7KKDQVZR0',
    file: '/certificates/dicoding-google-cloud.pdf',
  },
  {
    title: 'Python Programming',
    issuer: 'Dicoding Indonesia',
    kind: 'Certificate',
    track: 'engineering',
    issued: '2021',
    file: '/certificates/dicoding-python.pdf',
  },
  {
    title: 'Python',
    issuer: 'Kaggle Learn',
    kind: 'Course',
    track: 'engineering',
    issued: 'Apr 2022',
    file: '/certificates/python.pdf',
  },
]

/** True once the month after `expires` has started. */
export function isExpired(expires: string | undefined, now = new Date()) {
  if (!expires) return false
  const [y, m] = expires.split('-').map(Number)
  return now.getFullYear() * 12 + now.getMonth() > y * 12 + (m - 1)
}
