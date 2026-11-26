import type { ChatMessage } from './chat-types'

export const CHAT_MAX_MESSAGES = 30
export const CHAT_RETENTION_MS = 30 * 24 * 60 * 60 * 1000

export function retainChatMessages(messages: readonly ChatMessage[], now = Date.now()): ChatMessage[] {
  return messages
    .filter(message => {
      if (!message.ts) return false
      const timestamp = Date.parse(message.ts)
      if (!Number.isFinite(timestamp) || timestamp > now) return false
      return now - timestamp <= CHAT_RETENTION_MS
    })
    .slice(-CHAT_MAX_MESSAGES)
}
