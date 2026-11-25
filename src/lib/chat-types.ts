export interface ChatSource {
  title: string
  href: string
}

/** Browser copy of a turn. The transcript is also processed by the chat API. */
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  ts: string
  /** Static editorial evidence links returned by the API, not generated citations. */
  sources?: ChatSource[]
}

export type ChatAvailability = 'online' | 'unavailable' | 'rate_limited'
