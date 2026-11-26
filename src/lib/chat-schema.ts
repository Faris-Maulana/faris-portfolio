import { z } from 'zod'

// Avoid Zod's Function constructor probe in the browser. Even when caught, it
// violates an enforced CSP that intentionally omits 'unsafe-eval'.
z.config({ jitless: true })

export const MAX_CHAT_MESSAGES = 30
export const MAX_CHAT_MESSAGE_CHARS = 4000
export const MAX_CHAT_TOTAL_CHARS = 24_000
export const MAX_CHAT_SESSION_ID_CHARS = 100
export const MAX_CHAT_INPUT_CHARS = 800
export const MAX_CHAT_RETRY_AFTER_SECONDS = 300

export function boundedRetryAfter(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value) || value <= 0) return 0
  return Math.min(MAX_CHAT_RETRY_AFTER_SECONDS, Math.max(1, Math.ceil(value)))
}

const activeRouteSchema = z.string().trim().max(120).regex(
  /^\/(?:work\/[a-z0-9-]+|simpul)?\/?$/,
  'Active route is not a public chat context',
)

const messageSchema = z
  .object({
    role: z.enum(['user', 'assistant']),
    content: z
      .string()
      .trim()
      .min(1, 'Messages cannot be empty')
      .max(
        MAX_CHAT_MESSAGE_CHARS,
        `Messages must be at most ${MAX_CHAT_MESSAGE_CHARS} characters`
      ),
  })
  .strict()

export const chatRequestSchema = z
  .object({
    sessionId: z
      .string()
      .trim()
      .min(1, 'A session ID is required')
      .max(MAX_CHAT_SESSION_ID_CHARS, 'Session ID is too long')
      .regex(/^[\w:.-]+$/, 'Session ID contains invalid characters'),
    messages: z
      .array(messageSchema)
      .min(1, 'At least one message is required')
      .max(MAX_CHAT_MESSAGES, 'Too many messages'),
    stream: z.boolean().optional().default(false),
    route: activeRouteSchema.optional().default('/'),
  })
  .strict()
  .superRefine((body, ctx) => {
    if (body.messages.at(-1)?.role !== 'user') {
      ctx.addIssue({
        code: 'custom',
        message: 'The latest message must be from the user',
        path: ['messages'],
      })
    }

    const totalChars = body.messages.reduce(
      (total, message) => total + message.content.length,
      0
    )
    if (totalChars > MAX_CHAT_TOTAL_CHARS) {
      ctx.addIssue({
        code: 'custom',
        message: 'Conversation is too long',
        path: ['messages'],
      })
    }
  })

export type ChatRequest = z.infer<typeof chatRequestSchema>
export type ChatRequestMessage = ChatRequest['messages'][number]
