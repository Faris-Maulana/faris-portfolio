export type Accent = 'signal' | 'agent' | 'data' | 'cred' | 'threat'

export const ACCENTS: Record<Accent, string> = {
  signal: 'var(--color-signal)',
  agent: 'var(--color-agent)',
  data: 'var(--color-data)',
  cred: 'var(--color-cred)',
  threat: 'var(--color-threat)',
}
