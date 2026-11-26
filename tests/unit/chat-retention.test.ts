import { describe, expect, it } from 'vitest'
import type { ChatMessage } from '../../src/lib/chat-types'
import { CHAT_MAX_MESSAGES, CHAT_RETENTION_MS, retainChatMessages } from '../../src/lib/chat-retention'

const NOW = Date.parse('2026-11-25T12:00:00.000Z')

function message(content: string, timestamp: number, role: ChatMessage['role'] = 'user'): ChatMessage {
  return { role, content, ts: new Date(timestamp).toISOString() }
}

describe('chat transcript retention', () => {
  it('filters every message by its own age before applying the message cap', () => {
    const messages = retainChatMessages([
      message('expired', NOW - CHAT_RETENTION_MS - 1),
      message('fresh question', NOW - 1_000),
      message('fresh answer', NOW - 500, 'assistant'),
    ], NOW)
    expect(messages.map(item => item.content)).toEqual(['fresh question', 'fresh answer'])
  })

  it('keeps the exact 30-day boundary and removes future or malformed timestamps', () => {
    const malformed = { role: 'user', content: 'malformed', ts: 'not-a-date' } satisfies ChatMessage
    const messages = retainChatMessages([
      message('exact boundary', NOW - CHAT_RETENTION_MS),
      message('future timestamp', NOW + 1),
      malformed,
      message('old', NOW - CHAT_RETENTION_MS - 1),
    ], NOW)
    expect(messages.map(item => item.content)).toEqual(['exact boundary'])
  })

  it('removes expired entries before selecting the newest bounded transcript', () => {
    const messages = Array.from({ length: CHAT_MAX_MESSAGES }, (_, index) => message(`fresh-${index}`, NOW - 1_000 + index))
    const retained = retainChatMessages([message('expired but newest by array order', NOW - CHAT_RETENTION_MS - 1), ...messages], NOW)
    expect(retained).toHaveLength(CHAT_MAX_MESSAGES)
    expect(retained[0]?.content).toBe('fresh-0')
    expect(retained.some(item => item.content.includes('expired'))).toBe(false)
  })
})
