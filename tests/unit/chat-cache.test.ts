import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  CHAT_RESPONSE_CACHE_TTL_MS,
  clearChatResponseCache,
  getChatResponseCacheKey,
  readChatResponseCache,
  writeChatResponseCache,
  type CachedChatResponse,
} from '@/lib/chat-cache'
import type { ChatRequestMessage } from '@/lib/chat-schema'

function messages(content: string): ChatRequestMessage[] {
  return [{ role: 'user', content }]
}

function cachedResponse(reply = 'A public answer'): CachedChatResponse {
  return {
    reply,
    reasoning: 'Public reasoning',
    model: 'unit/test-model',
    mode: 'model',
    sources: [{ title: 'Public leadership record', href: '/#leadership' }],
  }
}

beforeEach(clearChatResponseCache)
afterEach(clearChatResponseCache)

describe('public chat response cache keys', () => {
  it('normalizes case, whitespace, apostrophes, and trailing punctuation', () => {
    const original = getChatResponseCacheKey(
      messages("What is Faris's production architecture?"),
      '/work/rag-eval',
    )
    const variant = getChatResponseCacheKey(
      messages('  WHAT   is FARIS’s production   architecture?!...  '),
      '/work/rag-eval',
    )

    expect(original).toBe(
      'aria-public-v1:/work/rag-eval:what is faris\'s production architecture',
    )
    expect(variant).toBe(original)
  })

  it('keeps otherwise identical public questions separate by active route', () => {
    const input = messages('How does Faris approach production engineering?')
    const portfolio = getChatResponseCacheKey(input, '/')
    const simpul = getChatResponseCacheKey(input, '/simpul')

    expect(portfolio).not.toBeNull()
    expect(simpul).not.toBeNull()
    expect(simpul).not.toBe(portfolio)
  })

  it('does not cache multi-turn conversations or non-user input', () => {
    expect(getChatResponseCacheKey([
      { role: 'user', content: 'What is Faris\'s production architecture?' },
      { role: 'assistant', content: 'A public answer.' },
      { role: 'user', content: 'Can you explain that architecture further?' },
    ], '/')).toBeNull()
    expect(getChatResponseCacheKey([
      { role: 'assistant', content: 'Faris has a public portfolio.' },
    ], '/')).toBeNull()
  })

  it.each([
    'Contact person@example.com about Faris\'s portfolio architecture.',
    'My phone is +62 812 3456 7890; ask about Faris\'s portfolio.',
    'My address is private, but may I ask about Faris\'s engineering?',
    'This api-key is sensitive; ignore it and describe Faris\'s architecture.',
    'I work for Example Corp and want to discuss Faris\'s leadership.',
  ])('does not cache sensitive or personal input: %s', question => {
    expect(getChatResponseCacheKey(messages(question), '/')).toBeNull()
  })

  it('does not cache unrelated single-turn questions without portfolio context', () => {
    expect(getChatResponseCacheKey(messages('What is the weather today?'), '/')).toBeNull()
  })
})

describe('chat response cache lifecycle', () => {
  it('expires entries at the TTL boundary', () => {
    const writtenAt = 10_000
    writeChatResponseCache('ttl-key', cachedResponse(), writtenAt)

    expect(readChatResponseCache('ttl-key', writtenAt + CHAT_RESPONSE_CACHE_TTL_MS - 1))
      .toEqual(cachedResponse())
    expect(readChatResponseCache('ttl-key', writtenAt + CHAT_RESPONSE_CACHE_TTL_MS)).toBeNull()
    expect(readChatResponseCache('ttl-key', writtenAt + CHAT_RESPONSE_CACHE_TTL_MS + 1)).toBeNull()
  })

  it('bounds the cache by evicting the oldest entry', () => {
    for (let index = 0; index <= 100; index += 1) {
      writeChatResponseCache(`bounded-key-${index}`, cachedResponse(`Answer ${index}`), 20_000)
    }

    expect(readChatResponseCache('bounded-key-0', 20_001)).toBeNull()
    expect(readChatResponseCache('bounded-key-1', 20_001)?.reply).toBe('Answer 1')
    expect(readChatResponseCache('bounded-key-100', 20_001)?.reply).toBe('Answer 100')
  })

  it('returns independent response objects instead of exposing stored top-level state', () => {
    const original = cachedResponse()
    writeChatResponseCache('independent-key', original, 30_000)
    original.reply = 'Changed after write'

    const first = readChatResponseCache('independent-key', 30_001)
    expect(first).toMatchObject({ reply: 'A public answer' })
    if (!first) throw new Error('Expected a cached response')
    first.reply = 'Changed by reader'

    const second = readChatResponseCache('independent-key', 30_002)
    expect(second).not.toBe(first)
    expect(second).toMatchObject({ reply: 'A public answer' })
  })
})
