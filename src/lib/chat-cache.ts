import type { ChatRequestMessage } from '@/lib/chat-schema'
import { getChatSources } from '@/lib/chat-sources'
import type { ChatSource } from '@/lib/chat-types'

export const CHAT_RESPONSE_CACHE_TTL_MS = 5 * 60 * 1000
const MAX_CACHE_ENTRIES = 100
const CACHE_VERSION = 'aria-public-v1'
const PRIVATE_INPUT = /(?:[\w.+-]+@[\w.-]+\.[a-z]{2,}|\b(?:email|phone|address|password|api[ -]?key|token|secret|credential|private|internal|personnel|live telemetry|my name is|my employer|i work for|i'm|i am)\b)/i
const PUBLIC_PORTFOLIO_TOPIC = /\b(?:faris|portfolio|project|case stud|leadership|engineering|architecture|evaluation|maturity|production|development|consulting|collaboration)\b/i

export interface CachedChatResponse {
  reply: string
  reasoning?: string
  model: string | null
  mode: 'model' | 'deterministic'
  sources: ChatSource[]
}

interface CacheEntry extends CachedChatResponse {
  expiresAt: number
}

const responseCache = new Map<string, CacheEntry>()

/** Public, single-turn questions only. The returned key never includes session IDs. */
export function getChatResponseCacheKey(
  messages: ChatRequestMessage[],
  activeRoute: string,
): string | null {
  if (messages.length !== 1 || messages[0]?.role !== 'user') return null
  const question = messages[0].content.normalize('NFKC')
  if (PRIVATE_INPUT.test(question)) return null

  const normalized = question
    .toLocaleLowerCase('en-US')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[?!.\s]+$/g, '')
  if (normalized.length < 4 || normalized.length > 800) return null
  if (!getChatSources(messages).length && !PUBLIC_PORTFOLIO_TOPIC.test(normalized)) return null

  return `${CACHE_VERSION}:${activeRoute}:${normalized}`
}

export function readChatResponseCache(key: string, now = Date.now()): CachedChatResponse | null {
  const entry = responseCache.get(key)
  if (!entry) return null
  if (entry.expiresAt <= now) {
    responseCache.delete(key)
    return null
  }

  responseCache.delete(key)
  responseCache.set(key, entry)
  return {
    reply: entry.reply,
    reasoning: entry.reasoning,
    model: entry.model,
    mode: entry.mode,
    sources: entry.sources,
  }
}

export function writeChatResponseCache(
  key: string,
  response: CachedChatResponse,
  now = Date.now(),
): void {
  if (!response.reply || response.reply.length > 8_000) return
  responseCache.delete(key)
  responseCache.set(key, { ...response, expiresAt: now + CHAT_RESPONSE_CACHE_TTL_MS })
  while (responseCache.size > MAX_CACHE_ENTRIES) {
    const oldest = responseCache.keys().next().value
    if (typeof oldest !== 'string') break
    responseCache.delete(oldest)
  }
}

export function clearChatResponseCache(): void {
  responseCache.clear()
}
