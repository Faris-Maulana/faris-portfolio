import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

let volatileSessionId = ''
const SESSION_ID_KEY = 'faris_portfolio_sid'

/** Per-tab correlation only, never proof of identity or notification deduplication. */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return ''
  try { window.localStorage.removeItem(SESSION_ID_KEY) } catch { /* Legacy storage can be blocked. */ }
  try {
    const existing = window.sessionStorage.getItem(SESSION_ID_KEY)
    if (existing && existing.length <= 100 && /^[\w:.-]+$/.test(existing)) return existing
  } catch { /* Blocked storage falls back to a per-page identifier. */ }

  if (!volatileSessionId) volatileSessionId = window.crypto.randomUUID()
  try { window.sessionStorage.setItem(SESSION_ID_KEY, volatileSessionId) } catch { /* Chat works without persistence. */ }
  return volatileSessionId
}

export function clearSessionId() {
  volatileSessionId = ''
  if (typeof window === 'undefined') return
  try { window.sessionStorage.removeItem(SESSION_ID_KEY) } catch { /* No persistent copy is available. */ }
  try { window.localStorage.removeItem(SESSION_ID_KEY) } catch { /* Legacy storage can be blocked. */ }
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
