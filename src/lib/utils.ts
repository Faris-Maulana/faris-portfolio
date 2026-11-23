import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

let volatileSessionId = ''

/** Correlation only, never proof of identity or notification deduplication. */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return ''
  const key = 'faris_portfolio_sid'
  try {
    const existing = window.localStorage.getItem(key)
    if (existing && existing.length <= 100 && /^[\w:.-]+$/.test(existing)) return existing
  } catch { /* Blocked storage falls back to a per-page identifier. */ }

  if (!volatileSessionId) volatileSessionId = window.crypto.randomUUID()
  try { window.localStorage.setItem(key, volatileSessionId) } catch { /* Chat works without persistence. */ }
  return volatileSessionId
}

export function extractEmail(text: string): string | null {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
  return match ? match[0].toLowerCase() : null
}

export function detectIntent(text: string): 'hiring' | 'collaboration' | 'technical' | 'general' {
  const value = text.toLowerCase()
  if (/(hire|job|position|role|recruit|salary|offer|opportunity|work with you|join)/i.test(value)) return 'hiring'
  if (/(collaborate|partner|project|build together|consult|freelance)/i.test(value)) return 'collaboration'
  if (/(how|what|why|explain|code|implement|architecture|stack|api|model|llm|rag)/i.test(value)) return 'technical'
  return 'general'
}
