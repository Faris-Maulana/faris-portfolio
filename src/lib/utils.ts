import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }).format(new Date(date))
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length).trimEnd() + '...'
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Unified session id, shared by both analytics and chat
// Key: 'faris_portfolio_sid'
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return ''
  const KEY = 'faris_portfolio_sid'
  const existing = localStorage.getItem(KEY)
  if (existing) return existing
  const id = crypto.randomUUID()
  localStorage.setItem(KEY, id)
  return id
}

// Keep old name for backwards compatibility
export function generateSessionId(): string {
  return getOrCreateSessionId()
}

// Extract email from any text string
export function extractEmail(text: string): string | null {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
  return match ? match[0].toLowerCase() : null
}

// Detect intent from message text
export function detectIntent(text: string): 'hiring' | 'collaboration' | 'technical' | 'general' {
  const t = text.toLowerCase()
  if (/(hire|job|position|role|recruit|salary|offer|opportunity|work with you|join)/i.test(t)) return 'hiring'
  if (/(collaborate|partner|project|build together|consult|freelance)/i.test(t)) return 'collaboration'
  if (/(how|what|why|explain|code|implement|architecture|stack|api|model|llm|rag)/i.test(t)) return 'technical'
  return 'general'
}
