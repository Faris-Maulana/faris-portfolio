import { NextResponse, type NextRequest } from 'next/server'
import { chatRequestSchema, type ChatRequestMessage } from '../../../lib/chat-schema'
import { NOTIFICATION_TIMEOUT_MS, notifyOwner } from '../../../lib/notify'
import { clientKey, rateLimit } from '../../../lib/rate-limit'
import { readJsonBody } from '../../../lib/request-body'
import { detectIntent, extractEmail } from '../../../lib/utils'
import { getChatSources } from '../../../lib/chat-sources'
import { controlledPortfolioReply } from '../../../lib/chat-guard'
import {
  ChatProviderStreamError,
  completeChat,
  openChatStream,
  readChatCompletionStream,
  type CompletionResult,
  type ProviderStreamResult,
  type StreamSnapshot,
} from '../../../lib/chat-provider'
import {
  getChatResponseCacheKey,
  readChatResponseCache,
  writeChatResponseCache,
  type CachedChatResponse,
} from '../../../lib/chat-cache'
import type { ChatSource } from '../../../lib/chat-types'

export const CHAT_REQUEST_TIMEOUT_MS = 30_000
const CHAT_STREAM_TIMEOUT_MS = 60_000
const MAX_BODY_BYTES = 128 * 1024
const CHAT_LIMIT = 20
const CHAT_WINDOW_MS = 5 * 60 * 1000
const UNAVAILABLE_REPLY =
  'ARIA is unavailable right now. Please try again later or contact Faris at maulanafaris016@gmail.com.'

type ChatStreamEvent =
  | { type: 'meta'; availability: 'ok'; sources: ChatSource[]; model: string | null; mode: 'model' | 'deterministic' }
  | { type: 'delta'; content: string; reasoning?: string }
  | ({ type: 'done'; availability: 'ok' } & CachedChatResponse)
  | { type: 'error'; availability: 'unavailable' | 'rate_limited'; reply: string }

function visitorName(messages: ChatRequestMessage[]): string | undefined {
  const userText = messages
    .filter(message => message.role === 'user')
    .map(message => message.content)
    .join('\n')
  const match = userText.match(
    /(?:i[''`]?m|my name is|this is|i am|call me)\s+([A-Z][a-z]+(?: [A-Z][a-z]+)?)/,
  )
  return match?.[1]
}

function visitorCompany(messages: ChatRequestMessage[]): string | undefined {
  const userText = messages
    .filter(message => message.role === 'user')
    .map(message => message.content)
    .join('\n')
  const match = userText.match(
    /(?:from|at|work(?:ing)? (?:at|for)|representing|with)\s+([A-Z][A-Za-z\s&]{2,30}?)(?:\.|,|\s*$|\s+and)/,
  )
  return match?.[1].trim()
}

function telemetry(startedAt: number, cache: 'HIT' | 'MISS', additional?: HeadersInit): Headers {
  const headers = new Headers(additional)
  headers.set('Cache-Control', 'no-store')
  headers.set('X-Aria-Cache', cache)
  headers.set('X-Aria-Latency-Ms', String(Math.max(0, Date.now() - startedAt)))
  return headers
}

function encodeEvent(encoder: TextEncoder, event: ChatStreamEvent): Uint8Array {
  return encoder.encode(`${JSON.stringify(event)}\n`)
}

function staticStreamResponse(
  result: CachedChatResponse,
  headers: Headers,
): Response {
  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encodeEvent(encoder, {
        type: 'meta',
        availability: 'ok',
        sources: result.sources,
        model: result.model,
        mode: result.mode,
      }))
      controller.enqueue(encodeEvent(encoder, { type: 'delta', content: result.reply, reasoning: result.reasoning }))
      controller.enqueue(encodeEvent(encoder, { type: 'done', availability: 'ok', ...result }))
      controller.close()
    },
  })
  return new Response(stream, {
    status: 200,
    headers: new Headers({ ...Object.fromEntries(headers), 'Content-Type': 'application/x-ndjson; charset=utf-8' }),
  })
}

interface NotifyOptions {
  req: NextRequest
  messages: ChatRequestMessage[]
  sessionId: string
  deadline: number
}

async function notifyLatestEmail({ req, messages, sessionId, deadline }: NotifyOptions): Promise<void> {
  const latestUserMessage = messages.at(-1)!
  const latestEmail = extractEmail(latestUserMessage.content)
  const notificationBudgetMs = deadline - Date.now()
  if (!latestEmail || notificationBudgetMs <= 0 || req.signal.aborted) return
  const name = visitorName(messages)
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

interface ProviderStreamOptions extends NotifyOptions {
  provider: ProviderStreamResult & { availability: 'ok' }
  cacheKey: string | null
  sources: ChatSource[]
  headers: Headers
  recover: () => Promise<CompletionResult>
}

function providerStreamResponse({
  provider,
  cacheKey,
  sources,
  headers,
  recover,
  req,
  messages,
  sessionId,
  deadline,
}: ProviderStreamOptions): Response {
  const encoder = new TextEncoder()
  const send = (controller: ReadableStreamDefaultController<Uint8Array>, event: ChatStreamEvent) => {
    controller.enqueue(encodeEvent(encoder, event))
  }
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      send(controller, {
        type: 'meta',
        availability: 'ok',
        sources,
        model: provider.model,
        mode: 'model',
      })
      try {
        let final: StreamSnapshot
        try {
          final = await readChatCompletionStream(provider, snapshot => {
            send(controller, { type: 'delta', content: snapshot.reply, reasoning: snapshot.reasoning })
          })
        } catch (streamError) {
          if (req.signal.aborted) return
          if (streamError instanceof ChatProviderStreamError) {
            const { status } = streamError
            if (status === 429) {
              send(controller, {
                type: 'error',
                availability: 'rate_limited',
                reply: 'The AI service is busy right now. Please try again shortly.',
              })
              return
            }
            if (status !== undefined && status >= 400 && status < 500 && status !== 404 && status !== 408) {
              send(controller, { type: 'error', availability: 'unavailable', reply: UNAVAILABLE_REPLY })
              return
            }
          }

          console.warn('[chat] recovering interrupted provider stream', streamError instanceof Error ? streamError.name : 'unknown')
          const recovery = await recover()
          if (recovery.availability !== 'ok') {
            send(controller, {
              type: 'error',
              availability: recovery.availability,
              reply: recovery.availability === 'rate_limited'
                ? 'The AI service is busy right now. Please try again shortly.'
                : UNAVAILABLE_REPLY,
            })
            return
          }
          final = {
            reply: recovery.reply,
            reasoning: recovery.reasoning,
            model: recovery.model,
          }
          send(controller, { type: 'delta', content: final.reply, reasoning: final.reasoning })
        }

        await notifyLatestEmail({ req, messages, sessionId, deadline })
        const result: CachedChatResponse = {
          reply: final.reply,
          reasoning: final.reasoning,
          model: final.model,
          mode: 'model',
          sources,
        }
        if (cacheKey) writeChatResponseCache(cacheKey, result)
        send(controller, { type: 'done', availability: 'ok', ...result })
      } catch (error) {
        if (!req.signal.aborted) {
          console.error('[chat] stream interrupted', error instanceof Error ? error.name : 'unknown')
          send(controller, { type: 'error', availability: 'unavailable', reply: UNAVAILABLE_REPLY })
        }
      } finally {
        if (!req.signal.aborted) controller.close()
      }
    },
  })
  headers.set('Content-Type', 'application/x-ndjson; charset=utf-8')
  return new Response(stream, { status: 200, headers })
}

export async function POST(req: NextRequest) {
  const startedAt = Date.now()
  const limit = rateLimit(clientKey(req, 'chat'), CHAT_LIMIT, CHAT_WINDOW_MS)
  if (!limit.ok) {
    return NextResponse.json({
      reply: 'You are sending messages too quickly. Please wait a moment and try again.',
      availability: 'rate_limited',
    }, {
      status: 429,
      headers: telemetry(startedAt, 'MISS', { 'Retry-After': String(limit.retryAfter) }),
    })
  }

  const body = await readJsonBody(req, MAX_BODY_BYTES)
  if (!body.ok) {
    return NextResponse.json({
      error: body.reason === 'too_large'
        ? 'Request is too large.'
        : body.reason === 'unsupported_type'
          ? 'Expected application/json.'
          : 'Malformed request.',
      reply: 'Please start a new chat and try again.',
    }, {
      status: body.reason === 'too_large' ? 413 : body.reason === 'unsupported_type' ? 415 : 400,
      headers: telemetry(startedAt, 'MISS'),
    })
  }

  const parsed = chatRequestSchema.safeParse(body.data)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request.', reply: 'Please start a new chat and try again.' },
      { status: 400, headers: telemetry(startedAt, 'MISS') },
    )
  }

  const { messages, sessionId, stream, route } = parsed.data
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return NextResponse.json({
      reply: 'ARIA is not configured on this deployment. Please use the contact form or email maulanafaris016@gmail.com.',
      availability: 'unconfigured',
    }, { status: 503, headers: telemetry(startedAt, 'MISS') })
  }

  const sources = getChatSources(messages)
  const cacheKey = getChatResponseCacheKey(messages, route)
  const cached = cacheKey ? readChatResponseCache(cacheKey) : null
  if (cached) {
    const headers = telemetry(startedAt, 'HIT')
    if (stream) return staticStreamResponse(cached, headers)
    return NextResponse.json({
      ...cached,
      availability: 'ok',
      visitorName: visitorName(messages),
    }, { headers })
  }

  const deadline = Date.now() + (stream ? CHAT_STREAM_TIMEOUT_MS : CHAT_REQUEST_TIMEOUT_MS)
  const providerOptions = { messages, apiKey, requestSignal: req.signal, deadline, sessionId, activeRoute: route }

  try {
    const controlledReply = controlledPortfolioReply(messages)
    if (stream) {
      if (controlledReply) {
        await notifyLatestEmail({ req, messages, sessionId, deadline })
        const result: CachedChatResponse = {
          reply: controlledReply,
          model: null,
          mode: 'deterministic',
          sources,
        }
        if (cacheKey) writeChatResponseCache(cacheKey, result)
        return staticStreamResponse(result, telemetry(startedAt, 'MISS'))
      }

      const provider = await openChatStream(providerOptions)
      if (provider.availability === 'rate_limited') {
        return NextResponse.json({
          reply: 'The AI service is busy right now. Please try again shortly.',
          availability: 'rate_limited',
        }, {
          status: 429,
          headers: telemetry(startedAt, 'MISS', provider.retryAfter
            ? { 'Retry-After': String(provider.retryAfter) }
            : undefined),
        })
      }
      if (provider.availability === 'unavailable') {
        return NextResponse.json(
          { reply: UNAVAILABLE_REPLY, availability: 'unavailable' },
          { status: 503, headers: telemetry(startedAt, 'MISS') },
        )
      }
      return providerStreamResponse({
        provider,
        cacheKey,
        sources,
        headers: telemetry(startedAt, 'MISS'),
        req,
        messages,
        sessionId,
        deadline,
        recover: () => completeChat({
          ...providerOptions,
          excludedModels: [provider.model],
        }),
      })
    }

    const completion: CompletionResult = controlledReply
      ? { availability: 'ok', reply: controlledReply, model: null, mode: 'deterministic' }
      : await completeChat(providerOptions)
    if (completion.availability === 'rate_limited') {
      return NextResponse.json({
        reply: 'The AI service is busy right now. Please try again shortly.',
        availability: 'rate_limited',
      }, {
        status: 429,
        headers: telemetry(startedAt, 'MISS', completion.retryAfter
          ? { 'Retry-After': String(completion.retryAfter) }
          : undefined),
      })
    }
    if (completion.availability === 'unavailable') {
      return NextResponse.json(
        { reply: UNAVAILABLE_REPLY, availability: 'unavailable' },
        { status: 503, headers: telemetry(startedAt, 'MISS') },
      )
    }

    await notifyLatestEmail({ req, messages, sessionId, deadline })
    const result: CachedChatResponse = {
      reply: completion.reply,
      reasoning: completion.reasoning,
      model: completion.model,
      mode: completion.mode,
      sources,
    }
    if (cacheKey) writeChatResponseCache(cacheKey, result)
    const latestEmail = extractEmail(messages.at(-1)!.content)
    return NextResponse.json({
      ...result,
      availability: 'ok',
      visitorName: visitorName(messages),
      visitorEmail: latestEmail ? '***' : undefined,
    }, { headers: telemetry(startedAt, 'MISS') })
  } catch (error) {
    console.error('[chat] unexpected request failure', error instanceof Error ? error.name : 'unknown')
    return NextResponse.json(
      { reply: UNAVAILABLE_REPLY, availability: 'unavailable' },
      { status: 500, headers: telemetry(startedAt, 'MISS') },
    )
  }
}
