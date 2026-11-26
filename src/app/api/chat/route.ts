import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { chatRequestSchema, type ChatRequestMessage } from '../../../lib/chat-schema'
import { NOTIFICATION_TIMEOUT_MS, notifyOwner } from '../../../lib/notify'
import { clientKey, rateLimit } from '../../../lib/rate-limit'
import { readJsonBody } from '../../../lib/request-body'
import { detectIntent, extractEmail } from '../../../lib/utils'
import { SITE_URL } from '../../../lib/site'
import { getChatSources } from '../../../lib/chat-sources'
import { buildSystemPrompt } from '../../../lib/chat-context'
import { controlledPortfolioReply } from '../../../lib/chat-guard'

const DEFAULT_MODELS = [
  'mistralai/mistral-nemo',
  'google/gemma-4-31b-it:free',
  'inclusionai/ling-3.2-flash:free',
]
const MAX_MODEL_ATTEMPTS = 3
const OPENROUTER_TIMEOUT_MS = 10_000
export const CHAT_REQUEST_TIMEOUT_MS = 30_000
const MAX_BODY_BYTES = 128 * 1024
const CHAT_LIMIT = 20
const CHAT_WINDOW_MS = 5 * 60 * 1000

const completionSchema = z.object({
  model: z.string().max(200).optional(),
  choices: z
    .array(
      z.object({
        message: z.object({
          content: z.string().max(8_000),
        }),
      })
    )
    .min(1)
    .max(4),
})

type CompletionResult =
  | { availability: 'ok'; reply: string; model: string | null; mode: 'model' | 'deterministic' }
  | { availability: 'unavailable' }
  | { availability: 'rate_limited'; retryAfter?: number }

function models(): string[] {
  return [
    ...new Set(
      [process.env.OPENROUTER_MODEL, ...DEFAULT_MODELS].filter(
        (model): model is string => Boolean(model)
      )
    ),
  ].slice(0, MAX_MODEL_ATTEMPTS)
}

function sanitiseReply(raw: string): string {
  let text = raw.trim()
  text = text.replace(/<(think|thinking|reasoning)>[\s\S]*?<\/\1>/gi, '').trim()
  const leak = text.match(/^(?:we|i)\s+(?:need to|should|must)\b[\s\S]*?\n\n/i)
  if (leak) text = text.slice(leak[0].length).trim()

  return text
    .replace(/\[([^\]\n]+)\]\([^\)\n]*\)/g, '$1')
    .replace(/<(?:https?:\/\/|\/)[^>\n]+>/gi, '')
    .replace(/\bhttps?:\/\/[^\s)\]]+/gi, '')
    .replace(/\s*[\u2014\u2013]\s*/g, ', ')
    .replace(/\s+,/g, ',')
    .replace(/,\s*,/g, ',')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function parseRetryAfter(value: string | null): number | undefined {
  if (!value) return undefined
  const seconds = Number(value)
  if (Number.isFinite(seconds)) return Math.max(1, Math.ceil(seconds))

  const date = Date.parse(value)
  if (Number.isNaN(date)) return undefined
  return Math.max(1, Math.ceil((date - Date.now()) / 1000))
}

/**
 * One bounded attempt per model. Authentication, quota, and provider rate-limit
 * errors stop immediately; model-specific and transient failures use the next
 * fallback. There is no unbounded retry loop.
 */
async function completeChat(
  messages: ChatRequestMessage[],
  apiKey: string,
  requestSignal: AbortSignal,
  deadline: number
): Promise<CompletionResult> {
  const systemPrompt = buildSystemPrompt(messages)
  for (const model of models()) {
    const remainingMs = deadline - Date.now()
    if (requestSignal.aborted || remainingMs <= 0) break
    let response: Response
    try {
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': SITE_URL,
          'X-Title': 'Faris Maulana Portfolio - ARIA',
        },
        body: JSON.stringify({
          model,
          max_tokens: 450,
          temperature: 0,
          messages: [{ role: 'system', content: systemPrompt }, ...messages],
        }),
        signal: AbortSignal.any([requestSignal, AbortSignal.timeout(Math.min(OPENROUTER_TIMEOUT_MS, remainingMs))]),
        cache: 'no-store',
      })
    } catch {
      if (requestSignal.aborted || Date.now() >= deadline) break
      continue
    }

    if (response.status === 429) {
      return {
        availability: 'rate_limited',
        retryAfter: parseRetryAfter(response.headers.get('retry-after')),
      }
    }
    if (
      response.status === 401 ||
      response.status === 402 ||
      response.status === 403
    ) {
      return { availability: 'unavailable' }
    }
    if (!response.ok) {
      if (
        response.status === 404 ||
        response.status === 408 ||
        response.status >= 500
      ) {
        continue
      }
      return { availability: 'unavailable' }
    }

    let data: unknown
    try {
      data = await response.json()
    } catch {
      continue
    }

    const parsed = completionSchema.safeParse(data)
    if (!parsed.success) continue

    const reply = sanitiseReply(parsed.data.choices[0].message.content)
    if (reply) {
      return { availability: 'ok', reply, model: parsed.data.model ?? model, mode: 'model' }
    }
  }

  return { availability: 'unavailable' }
}

function visitorName(messages: ChatRequestMessage[]): string | undefined {
  const userText = messages
    .filter(message => message.role === 'user')
    .map(message => message.content)
    .join('\n')
  const match = userText.match(
    /(?:i[''`]?m|my name is|this is|i am|call me)\s+([A-Z][a-z]+(?: [A-Z][a-z]+)?)/
  )
  return match?.[1]
}

function visitorCompany(messages: ChatRequestMessage[]): string | undefined {
  const userText = messages
    .filter(message => message.role === 'user')
    .map(message => message.content)
    .join('\n')
  const match = userText.match(
    /(?:from|at|work(?:ing)? (?:at|for)|representing|with)\s+([A-Z][A-Za-z\s&]{2,30}?)(?:\.|,|\s*$|\s+and)/
  )
  return match?.[1].trim()
}

const UNAVAILABLE_REPLY =
  'ARIA is unavailable right now. Please try again later or contact Faris at maulanafaris016@gmail.com.'

export async function POST(req: NextRequest) {
  const limit = rateLimit(clientKey(req, 'chat'), CHAT_LIMIT, CHAT_WINDOW_MS)
  if (!limit.ok) {
    return NextResponse.json(
      {
        reply:
          'You are sending messages too quickly. Please wait a moment and try again.',
        availability: 'rate_limited',
      },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    )
  }

  const body = await readJsonBody(req, MAX_BODY_BYTES)
  if (!body.ok) {
    return NextResponse.json(
      {
        error: body.reason === 'too_large'
          ? 'Request is too large.'
          : body.reason === 'unsupported_type'
            ? 'Expected application/json.'
            : 'Malformed request.',
        reply: 'Please start a new chat and try again.',
      },
      { status: body.reason === 'too_large' ? 413 : body.reason === 'unsupported_type' ? 415 : 400 }
    )
  }

  const parsed = chatRequestSchema.safeParse(body.data)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request.', reply: 'Please start a new chat and try again.' },
      { status: 400 }
    )
  }

  const { messages, sessionId } = parsed.data
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      {
        reply:
          'ARIA is not configured on this deployment. Please use the contact form or email maulanafaris016@gmail.com.',
        availability: 'unconfigured',
      },
      { status: 503 }
    )
  }

  const deadline = Date.now() + CHAT_REQUEST_TIMEOUT_MS

  try {
    const controlledReply = controlledPortfolioReply(messages)
    const completion: CompletionResult = controlledReply
      ? { availability: 'ok', reply: controlledReply, model: null, mode: 'deterministic' }
      : await completeChat(messages, apiKey, req.signal, deadline)
    if (completion.availability === 'rate_limited') {
      return NextResponse.json(
        {
          reply: 'The AI service is busy right now. Please try again shortly.',
          availability: 'rate_limited',
        },
        {
          status: 429,
          ...(completion.retryAfter
            ? { headers: { 'Retry-After': String(completion.retryAfter) } }
            : {}),
        }
      )
    }
    if (completion.availability === 'unavailable') {
      return NextResponse.json(
        { reply: UNAVAILABLE_REPLY, availability: 'unavailable' },
        { status: 503 }
      )
    }

    const latestUserMessage = messages.at(-1)!
    const latestEmail = extractEmail(latestUserMessage.content)
    const name = visitorName(messages)

    // A chat is forwarded only when the latest user message explicitly contains
    // an email. Earlier addresses and anonymous turn counts never trigger one.
    const notificationBudgetMs = deadline - Date.now()
    if (latestEmail && notificationBudgetMs > 0 && !req.signal.aborted) {
      await notifyOwner({
        name: name || 'Portfolio visitor',
        email: latestEmail,
        subject: `ARIA chat contact${name ? ` from ${name}` : ''}`,
        message: latestUserMessage.content,
        source: 'aria_chat',
        meta: {
          Session: sessionId,
          Intent: detectIntent(latestUserMessage.content),
          Company: visitorCompany(messages),
          Messages: messages.filter(message => message.role === 'user').length,
        },
      }, {
        signal: req.signal,
        timeoutMs: Math.min(NOTIFICATION_TIMEOUT_MS, notificationBudgetMs),
      })
    }

    return NextResponse.json({
      reply: completion.reply,
      availability: 'ok',
      model: completion.model,
      mode: completion.mode,
      sources: getChatSources(messages),
      visitorName: name,
      visitorEmail: latestEmail ? '***' : undefined,
    })
  } catch (error) {
    console.error(
      '[chat] unexpected request failure',
      error instanceof Error ? error.name : 'unknown'
    )
    return NextResponse.json(
      { reply: UNAVAILABLE_REPLY, availability: 'unavailable' },
      { status: 500 }
    )
  }
}
