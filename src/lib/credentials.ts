/**
 * Credentials are checked into the repo and served from /public rather than
 * fetched from Supabase.
 *
 * They change perhaps twice a year, they are the same for every visitor, and
 * they must render even if the database is unreachable, three properties that
 * make a static module strictly better than a network round-trip here.
 */

export type CredentialTrack = 'ai' | 'data' | 'engineering' | 'security'

export interface Credential {
  title: string
  issuer: string
  year: string
  track: CredentialTrack
  /** Path under /public, or an external verification URL. */
  file?: string
  href?: string
  /** Surfaced first and given a larger card. */
  featured?: boolean
  note?: string
}

export const TRACK_META: Record<
  CredentialTrack,
  { label: string; color: string }
> = {
  ai: { label: 'AI / LLM', color: 'var(--color-agent)' },
  data: { label: 'Data & BI', color: 'var(--color-data)' },
  engineering: { label: 'Engineering', color: 'var(--color-signal)' },
  security: { label: 'Security', color: 'var(--color-threat)' },
}

export const CREDENTIALS: Credential[] = [
  {
    title: 'B.Sc. Computer Science, Cum Laude',
    issuer: 'Universitas Pancasila, Jakarta',
    year: '2024',
    track: 'engineering',
    file: '/certificates/universitas-pancasila-ijazah.pdf',
    featured: true,
    note: 'GPA 3.78 of 4.00. Accreditation Unggul. Identifiers redacted',
  },
  {
    title: 'Academic Transcript',
    issuer: 'Universitas Pancasila, Jakarta',
    year: '2024',
    track: 'engineering',
    file: '/certificates/universitas-pancasila-transcript.pdf',
    note: 'Full course record. Identifiers redacted',
  },
  {
    title: 'Master Consultant, AI Engineer',
    issuer: 'iMerit Technology',
    year: '2025',
    track: 'ai',
    featured: true,
    note: 'Enterprise LLM engagements. Fine-tuning, RLHF, and evaluation',
  },
  {
    title: 'Certificate of Competence, Lead Programmer',
    issuer: 'BNSP · LSP Universitas Pancasila',
    year: '2022',
    track: 'engineering',
    file: '/certificates/bnsp-lead-programmer.pdf',
    featured: true,
    note: 'National competency standard, valid through Nov 2027',
  },
  {
    title: 'AI Strategy & Implementation',
    issuer: 'Telkom Indonesia Advanced Program',
    year: '2023',
    track: 'ai',
    featured: true,
    note: 'AI product roadmap for the largest telco in Indonesia',
  },
  {
    title: 'Type A AI Data Contributor, Empirical LLM Evaluation',
    issuer: 'T-bench / Terminal-Bench',
    year: '2025',
    track: 'ai',
    featured: true,
    note: 'Agentic benchmark authoring and evaluation',
  },
  {
    title: 'Claude Code in Action',
    issuer: 'Anthropic',
    year: '2026',
    track: 'ai',
    file: '/certificates/anthropic-claude-code-in-action.pdf',
  },
  {
    title: 'Claude 101',
    issuer: 'Anthropic',
    year: '2026',
    track: 'ai',
    file: '/certificates/anthropic-claude-101.pdf',
  },
  {
    title: 'Introduction to Claude Cowork',
    issuer: 'Anthropic',
    year: '2026',
    track: 'ai',
    file: '/certificates/anthropic-claude-cowork.pdf',
  },
  {
    title: 'Machine Learning, Deep Learning & Bayesian Learning',
    issuer: 'Professional Training',
    year: '2023',
    track: 'ai',
    file: '/certificates/ml-dl-bayesian-learning.jpg',
  },
  {
    title: 'Machine Learning, Basic to Advanced',
    issuer: 'Professional Training',
    year: '2023',
    track: 'ai',
    file: '/certificates/ml-basic-to-advanced.jpg',
  },
  {
    title: 'Data for Breakfast, Asia Pacific',
    issuer: 'Snowflake',
    year: '2026',
    track: 'data',
    file: '/certificates/snowflake-data-for-breakfast-apac.pdf',
  },
  {
    title: 'Business Intelligence Fundamentals',
    issuer: 'Professional Training',
    year: '2022',
    track: 'data',
    file: '/certificates/business-intelligence-fundamental.png',
  },
  {
    title: 'Introduction to Data Analytics',
    issuer: 'Professional Training',
    year: '2022',
    track: 'data',
    file: '/certificates/introduction-data-analytics.pdf',
  },
  {
    title: 'Data Science Fundamentals',
    issuer: 'Dicoding',
    year: '2022',
    track: 'data',
    file: '/certificates/dicoding-data-science.pdf',
  },
  {
    title: 'Data Visualization Fundamentals',
    issuer: 'Dicoding',
    year: '2022',
    track: 'data',
    file: '/certificates/dicoding-data-visualization.pdf',
  },
  {
    title: 'Structured Query Language (SQL)',
    issuer: 'Dicoding',
    year: '2022',
    track: 'data',
    file: '/certificates/dicoding-sql.pdf',
  },
  {
    title: 'Data Cleaning',
    issuer: 'Professional Training',
    year: '2022',
    track: 'data',
    file: '/certificates/data-cleaning.pdf',
  },
  {
    title: 'Data Visualization',
    issuer: 'Professional Training',
    year: '2022',
    track: 'data',
    file: '/certificates/data-visualization.pdf',
  },
  {
    title: 'Google Cloud Fundamentals',
    issuer: 'Dicoding',
    year: '2022',
    track: 'engineering',
    file: '/certificates/dicoding-google-cloud.pdf',
  },
  {
    title: 'Python Programming',
    issuer: 'Dicoding',
    year: '2021',
    track: 'engineering',
    file: '/certificates/dicoding-python.pdf',
  },
  {
    title: 'Python',
    issuer: 'Professional Training',
    year: '2021',
    track: 'engineering',
    file: '/certificates/python.pdf',
  },
  {
    title: 'Smart Contract Security Research',
    issuer: 'Sherlock · Code4rena · Immunefi',
    year: '2024+',
    track: 'security',
    note: 'Active auditor. Reentrancy, access control, arithmetic overflow',
  },
]

export const CREDENTIAL_TRACKS = ['ai', 'data', 'engineering', 'security'] as const
