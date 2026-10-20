/** One turn in an ARIA conversation. Kept in the visitor's localStorage only. */
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  ts: string
}
