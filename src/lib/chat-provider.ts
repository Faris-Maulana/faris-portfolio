import { z } from 'zod'
import { buildProviderMessages } from '@/lib/chat-context'
import type { ChatRequestMessage } from '@/lib/chat-schema'
import { SITE_URL } from '@/lib/site'

const DEFAULT_MODELS = [
  'mistralai/mistral-nemo',
  'google/gemma-4-31b-it:free',
  'inclusionai/ling-3.2-flash:free',
]
const MAX_MODEL_ATTEMPTS = 3
const OPENROUTER_TIMEOUT_MS = 10_000

const messageSchema = z.object({
  content: z.string().max(8_000).nullable().optional(),
  reasoning: z.string().max(16_000).nullable().optional(),
})
const completionSchema = z.object({
  model: z.string().max(200).optional(),
  choices: z.array(z.object({ message: messageSchema })).min(1).max(4),
})
const streamChunkSchema = z.object({
  model: z.string().max(200).optional(),
  choices: z.array(z.object({ delta: messageSchema })).max(4).optional(),
  error: z.object({
    code: z.union([z.number(), z.string().max(100)]).optional(),
    message: z.string().max(1_000).optional(),
  }).optional(),
})

export class ChatProviderStreamError extends Error {
  readonly status?: number

  constructor(code?: number | string) {
    super('Provider stream failed')
    this.name = 'ChatProviderStreamError'
    const status = typeof code === 'string' ? Number(code) : code
    if (typeof status === 'number' && Number.isFinite(status)) this.status = status
  }
}

export type CompletionResult =
  | {
      availability: 'ok'
      reply: string
      reasoning?: string
      model: string | null
      mode: 'model' | 'deterministic'
    }
  | { availability: 'unavailable' }
  | { availability: 'rate_limited'; retryAfter?: number }

export type ProviderStreamResult =
  | { availability: 'ok'; response: Response; model: string }
  | { availability: 'unavailable' }
  | { availability: 'rate_limited'; retryAfter?: number }

export interface ChatCompletionOptions {
  messages: ChatRequestMessage[]
  apiKey: string
  requestSignal: AbortSignal
  deadline: number
  sessionId: string
  activeRoute: string
  excludedModels?: string[]
}

export interface StreamSnapshot {
  reply: string
  reasoning?: string
  model: string | null
}

function models(excludedModels: string[] = []): string[] {
  const excluded = new Set(excludedModels)
  return [
    ...new Set(
      [process.env.OPENROUTER_MODEL, ...DEFAULT_MODELS].filter(
        (model): model is string => Boolean(model),
      ),
    ),
  ].slice(0, MAX_MODEL_ATTEMPTS).filter(model => !excluded.has(model))
}

export function sanitiseReply(raw: string): string {
  let text = raw.trim()
  text = text.replace(/<(think|thinking|reasoning)>[\s\S]*?<\/\1>/gi, '').trim()
  text = text.replace(/^\s*ARIA\s*:\s*-?\s*/i, '')
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

function sanitiseReasoning(raw: string): string | undefined {
  const clean = sanitiseReply(raw)
    .split('\n')
    .filter(line => !/(?:you are ARIA|system prompt|hidden instructions|private key|password)/i.test(line))
    .join('\n')
    .trim()
    .slice(0, 4_000)
    .trim()
  return clean || undefined
}

function parseRetryAfter(value: string | null): number | undefined {
  if (!value) return undefined
  const seconds = Number(value)
  if (Number.isFinite(seconds)) return Math.max(1, Math.ceil(seconds))
  const date = Date.parse(value)
  if (Number.isNaN(date)) return undefined
  return Math.max(1, Math.ceil((date - Date.now()) / 1000))
}

function providerBody(options: ChatCompletionOptions, model: string, stream: boolean) {
  return {
    model,
    max_tokens: 450,
    temperature: 0,
    session_id: options.sessionId,
    prompt_cache_key: options.sessionId,
    messages: buildProviderMessages(options.messages, options.activeRoute),
    stream,
  }
}

function providerHeaders(apiKey: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
    'HTTP-Referer': SITE_URL,
    'X-Title': 'Faris Maulana Portfolio - ARIA',
  }
}

/** Preserve bounded provider fallback and the existing whole-JSON API contract. */
export async function completeChat(options: ChatCompletionOptions): Promise<CompletionResult> {
  const { apiKey, requestSignal, deadline } = options
  for (const model of models(options.excludedModels)) {
    const remainingMs = deadline - Date.now()
    if (requestSignal.aborted || remainingMs <= 0) break
    let response: Response
    try {
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: providerHeaders(apiKey),
        body: JSON.stringify(providerBody(options, model, false)),
        signal: AbortSignal.any([requestSignal, AbortSignal.timeout(Math.min(OPENROUTER_TIMEOUT_MS, remainingMs))]),
        cache: 'no-store',
      })
    } catch {
      if (requestSignal.aborted || Date.now() >= deadline) break
      continue
    }

    if (response.status === 429) {
      return { availability: 'rate_limited', retryAfter: parseRetryAfter(response.headers.get('retry-after')) }
    }
    if (response.status === 401 || response.status === 402 || response.status === 403) {
      return { availability: 'unavailable' }
    }
    if (!response.ok) {
      if (response.status === 404 || response.status === 408 || response.status >= 500) continue
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

    const reply = sanitiseReply(parsed.data.choices[0]?.message.content ?? '')
    if (reply) {
      return {
        availability: 'ok',
        reply,
        reasoning: sanitiseReasoning(parsed.data.choices[0]?.message.reasoning ?? ''),
        model: parsed.data.model ?? model,
        mode: 'model',
      }
    }
  }

  return { availability: 'unavailable' }
}

/** Select an HTTP-healthy provider; the caller recovers errors committed after the headers. */
export async function openChatStream(options: ChatCompletionOptions): Promise<ProviderStreamResult> {
  const { apiKey, requestSignal, deadline } = options
  for (const model of models()) {
    const remainingMs = deadline - Date.now()
    if (requestSignal.aborted || remainingMs <= 0) break
    const firstByteTimeout = new AbortController()
    const timer = setTimeout(
      () => firstByteTimeout.abort(),
      Math.min(OPENROUTER_TIMEOUT_MS, remainingMs),
    )
    let response: Response
    try {
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: providerHeaders(apiKey),
        body: JSON.stringify(providerBody(options, model, true)),
        signal: AbortSignal.any([
          requestSignal,
          firstByteTimeout.signal,
          AbortSignal.timeout(remainingMs),
        ]),
        cache: 'no-store',
      })
    } catch {
      clearTimeout(timer)
      if (requestSignal.aborted || Date.now() >= deadline) break
      continue
    }
    clearTimeout(timer)

    if (response.status === 429) {
      return { availability: 'rate_limited', retryAfter: parseRetryAfter(response.headers.get('retry-after')) }
    }
    if (response.status === 401 || response.status === 402 || response.status === 403) {
      return { availability: 'unavailable' }
    }
    if (!response.ok) {
      if (response.status === 404 || response.status === 408 || response.status >= 500) continue
      return { availability: 'unavailable' }
    }
    if (response.body) return { availability: 'ok', response, model }
  }
  return { availability: 'unavailable' }
}

/** Convert OpenRouter SSE deltas into cumulative, sanitised display snapshots. */
export async function readChatCompletionStream(
  stream: ProviderStreamResult & { availability: 'ok' },
  onSnapshot: (snapshot: StreamSnapshot) => void,
): Promise<StreamSnapshot> {
  const { response } = stream
  let selectedModel: string | null = stream.model

  if (response.headers.get('content-type')?.includes('application/json')) {
    const parsed = completionSchema.safeParse(await response.json())
    if (!parsed.success) throw new Error('Invalid provider completion')
    selectedModel = parsed.data.model ?? selectedModel
    const snapshot = {
      reply: sanitiseReply(parsed.data.choices[0]?.message.content ?? ''),
      reasoning: sanitiseReasoning(parsed.data.choices[0]?.message.reasoning ?? ''),
      model: selectedModel,
    }
    if (!snapshot.reply) throw new Error('Empty provider completion')
    onSnapshot(snapshot)
    return snapshot
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let rawReply = ''
  let rawReasoning = ''
  let lastReply = ''
  let lastReasoning = ''

  const publish = () => {
    if (rawReply.length > 32_000 || rawReasoning.length > 32_000) {
      throw new Error('Provider stream exceeded output bounds')
    }
    const reply = sanitiseReply(rawReply)
    const reasoning = sanitiseReasoning(rawReasoning) ?? ''
    if (reply === lastReply && reasoning === lastReasoning) return
    lastReply = reply
    lastReasoning = reasoning
    onSnapshot({ reply, reasoning: reasoning || undefined, model: selectedModel })
  }

  const consume = (line: string) => {
    if (!line.startsWith('data:')) return
    const payload = line.slice(5).trimStart()
    if (!payload || payload === '[DONE]') return
    let data: unknown
    try {
      data = JSON.parse(payload)
    } catch {
      return
    }
    const parsed = streamChunkSchema.safeParse(data)
    if (!parsed.success) return
    if (parsed.data.error) throw new ChatProviderStreamError(parsed.data.error.code)
    selectedModel = parsed.data.model ?? selectedModel
    const delta = parsed.data.choices?.[0]?.delta
    if (!delta) return
    rawReply += delta.content ?? ''
    rawReasoning += delta.reasoning ?? ''
    publish()
  }

  try {
    while (true) {
      const { done, value } = await reader.read()
      buffer += decoder.decode(value, { stream: !done })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) consume(line.replace(/\r$/, ''))
      if (done) break
    }
    if (buffer) consume(buffer.replace(/\r$/, ''))
    publish()
  } finally {
    reader.releaseLock()
  }

  const final = { reply: sanitiseReply(rawReply), reasoning: sanitiseReasoning(rawReasoning), model: selectedModel }
  if (!final.reply) throw new Error('Provider stream ended without a response')
  return final
}
