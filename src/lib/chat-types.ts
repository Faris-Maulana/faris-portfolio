/** Browser copy of a turn. The transcript is also processed by the chat API. */
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  ts: string
}

export type ChatAvailability = 'online' | 'unavailable' | 'rate_limited'
