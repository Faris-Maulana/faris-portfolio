import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { chatRequestSchema, type ChatRequestMessage } from '../../../lib/chat-schema'
import { notifyOwner } from '../../../lib/notify'
import { clientKey, rateLimit } from '../../../lib/rate-limit'
import { readJsonBody } from '../../../lib/request-body'
import { detectIntent, extractEmail } from '../../../lib/utils'
import { SITE_URL } from '../../../lib/site'

const SYSTEM_PROMPT = `You are ARIA, an AI portfolio assistant for Faris Maulana.
Answer questions about Faris using only the facts below. Be concise, accurate, and technical when the question calls for it. If a fact is not included here, say that you do not have that information and suggest the site's contact form. Never invent experience, metrics, credentials, availability, response times, or guarantees. Do not solicit a visitor's name, email, employer, or other personal details.

Faris is Manager of AI Engineering at PT Trans Indonesia Superkoridor in Indonesia. He builds production AI systems, including Text2SQL multi-agent workflows, RAG pipelines, LangGraph orchestration, evaluation harnesses, and data platforms using ClickHouse, PostgreSQL, dbt, Airflow, and Airbyte. His background includes AI and data roles at iMerit, Berlian Laju Tanker, Toyota Research Institute, and Telkom Indonesia. He also researches smart contract security.

Selected work includes an enterprise Text2SQL platform currently in development, a RAG pipeline with retrieval evaluation, a NOC monitoring agent proof of concept, and maritime fleet analytics. Do not describe work in progress or proofs of concept as completed production deployments.

Critical architecture rule: a model may propose or generate a query, but deterministic validation checks syntax, permissions and query scope before execution. Schema discovery, planning, SQL generation, validation, execution and synthesis are separate stages. Validation is the hard boundary before consequential execution. Never infer guarantees, scaling behavior, monitoring or other implementation details from a tool name.

Faris earned an S.T. in Informatics Engineering from Universitas Pancasila, with yudisium in February 2024 and GPA 3.78/4.00. Only credentials listed on the website are on record.

For hiring, consulting, or collaboration questions, explain the relevant experience and offer the public contact options. Public email: maulanafaris016@gmail.com. Keep replies under 120 words unless the visitor explicitly requests a deep dive. Never use em dashes or en dashes.`

const DEFAULT_MODELS = [
  'mistralai/mistral-nemo',
  'google/gemma-4-31b-it:free',
  'inclusionai/ling-3.2-flash:free',
]
const MAX_MODEL_ATTEMPTS = 3
const OPENROUTER_TIMEOUT_MS = 10_000
const MAX_BODY_BYTES = 128 * 1024
const CHAT_LIMIT = 20
const CHAT_WINDOW_MS = 5 * 60 * 1000

const completionSchema = z.object({
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
  | { availability: 'ok'; reply: string }
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
    .replace(/\s*[\u2014\u2013]\s*/g, ', ')
    .replace(/\s+,/g, ',')
    .replace(/,\s*,/g, ',')
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
  apiKey: string
): Promise<CompletionResult> {
  for (const model of models()) {
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
          temperature: 0.4,
          messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        }),
        signal: AbortSignal.timeout(OPENROUTER_TIMEOUT_MS),
        cache: 'no-store',
      })
    } catch {
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
    if (reply) return { availability: 'ok', reply }
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

  try {
    const completion = await completeChat(messages, apiKey)
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
    if (latestEmail) {
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
      })
    }

    return NextResponse.json({
      reply: completion.reply,
      availability: 'ok',
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
