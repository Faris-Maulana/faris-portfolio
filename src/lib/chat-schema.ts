import { z } from 'zod'

export const MAX_CHAT_MESSAGES = 30
export const MAX_CHAT_MESSAGE_CHARS = 4000
export const MAX_CHAT_TOTAL_CHARS = 24_000
export const MAX_CHAT_SESSION_ID_CHARS = 100
export const MAX_CHAT_INPUT_CHARS = 800

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
