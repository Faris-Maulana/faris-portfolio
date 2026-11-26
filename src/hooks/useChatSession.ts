'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChatAvailability, ChatMessage, ChatSource } from '@/lib/chat-types'
import { CHAT_MAX_MESSAGES, retainChatMessages } from '@/lib/chat-retention'
import { MAX_CHAT_INPUT_CHARS } from '@/lib/chat-schema'
import { trackPortfolioEvent } from '@/lib/analytics'
import { clearSessionId, getOrCreateSessionId } from '@/lib/utils'

const MESSAGES_KEY = 'aria_chat_messages_v2'

const INTRO: ChatMessage = {
  role: 'assistant',
  content: 'Ask about Faris’s engineering leadership, system architecture, evaluation practice or public case studies.',
  ts: '',
}

export type ChatThinkingPhase = 'idle' | 'searching' | 'verifying' | 'composing' | 'streaming'

interface ChatResponse {
  reply?: unknown
  reasoning?: unknown
  availability?: unknown
  status?: unknown
  sources?: unknown
}

function isMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string'
    && typeof item.ts === 'string' && Number.isFinite(Date.parse(item.ts))
}

function restoreSources(value: unknown): ChatSource[] | undefined {
  if (!Array.isArray(value)) return undefined
  const sources = value.slice(0, 4).flatMap(item => {
    if (!item || typeof item !== 'object') return []
    const candidate = item as Record<string, unknown>
    if (typeof candidate.title !== 'string' || typeof candidate.href !== 'string') return []
    const title = candidate.title.trim().slice(0, 120)
    const href = candidate.href.trim().slice(0, 500)
    if (!title) return []
    let safeHref: string | null = null
    if (href.startsWith('/') && !href.startsWith('//') && !href.includes('\\')) safeHref = href
    else {
      try {
        const url = new URL(href)
        if (url.protocol === 'https:') safeHref = url.href
      } catch { /* Discard malformed local storage entries. */ }
    }
    return safeHref ? [{ title, href: safeHref }] : []
  })
  return sources.length ? sources : undefined
}

function restoreReasoning(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.slice(0, 4000) : undefined
}

function discardStoredMessages() {
  try { window.localStorage.removeItem(MESSAGES_KEY) } catch { /* Blocked storage does not break chat. */ }
}

function restoreMessages(): ChatMessage[] {
  if (typeof window === 'undefined') return [INTRO]
  try {
    const saved = window.localStorage.getItem(MESSAGES_KEY)
    if (!saved) return [INTRO]
    const parsed: unknown = JSON.parse(saved)
    if (!Array.isArray(parsed)) {
      discardStoredMessages()
      return [INTRO]
    }
    const normalized = parsed.filter(isMessage).map(item => ({
      role: item.role,
      content: item.content.slice(0, 4000),
      ts: item.ts,
      sources: item.role === 'assistant' ? restoreSources(item.sources) : undefined,
      reasoning: item.role === 'assistant' ? restoreReasoning(item.reasoning) : undefined,
    }))
    const messages = retainChatMessages(normalized)
    if (!messages.length) {
      discardStoredMessages()
      return [INTRO]
    }
    window.localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages))
    return messages
  } catch {
    discardStoredMessages()
    return [INTRO]
  }
}

function persist(messages: ChatMessage[]) {
  try {
    const retained = retainChatMessages(messages)
    if (retained.length) window.localStorage.setItem(MESSAGES_KEY, JSON.stringify(retained))
    else window.localStorage.removeItem(MESSAGES_KEY)
  } catch { /* Storage can be blocked without breaking chat. */ }
}

function streamEvent(line: string): Record<string, unknown> | null {
  try {
    const value: unknown = JSON.parse(line)
    return value && typeof value === 'object' ? value as Record<string, unknown> : null
  } catch {
    return null
  }
}

export function useChatSession(activeRoute = '/') {
  const [isOpen, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([INTRO])
  const [input, setInput] = useState('')
  const [isLoading, setLoading] = useState(false)
  const [hasNewReply, setHasNewReply] = useState(false)
  const [availability, setAvailability] = useState<ChatAvailability>('online')
  const [thinkingPhase, setThinkingPhase] = useState<ChatThinkingPhase>('idle')
  const [failedQuestion, setFailedQuestion] = useState<string | null>(null)
  const generation = useRef(0)
  const openRef = useRef(false)
  const pending = useRef<AbortController | null>(null)
  const phaseTimers = useRef<number[]>([])
  const lastPrompt = useRef('')
  const pendingDraft = useRef<{ content: string; previousMessages: ChatMessage[] } | null>(null)

  const clearPhaseTimers = useCallback(() => {
    for (const timer of phaseTimers.current) window.clearTimeout(timer)
    phaseTimers.current = []
  }, [])

  useEffect(() => { openRef.current = isOpen }, [isOpen])
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMessages(current => current.length === 1 && current[0] === INTRO ? restoreMessages() : current)
    })
    return () => cancelAnimationFrame(frame)
  }, [])
  useEffect(() => () => {
    generation.current += 1
    pending.current?.abort()
    for (const timer of phaseTimers.current) window.clearTimeout(timer)
  }, [])

  const openChat = useCallback(() => {
    trackPortfolioEvent({ name: 'chat_open', placement: 'launcher' })
    openRef.current = true
    setHasNewReply(false)
    setOpen(true)
  }, [])
  const beginClose = useCallback(() => {
    // The exit animation is visual; late replies are already unread to the reader.
    openRef.current = false
  }, [])
  const closeChat = useCallback(() => {
    openRef.current = false
    setOpen(false)
  }, [])

  const clearHistory = useCallback(() => {
    generation.current += 1
    pending.current?.abort()
    pending.current = null
    pendingDraft.current = null
    clearPhaseTimers()
    lastPrompt.current = ''
    setLoading(false)
    setThinkingPhase('idle')
    setFailedQuestion(null)
    setMessages([INTRO])
    setHasNewReply(false)
    clearSessionId()
    try { window.localStorage.removeItem(MESSAGES_KEY) } catch { /* No persistent copy is available. */ }
  }, [clearPhaseTimers])

  const sendMessage = useCallback(async (content: string, retry = false) => {
    const trimmed = content.trim().slice(0, MAX_CHAT_INPUT_CHARS)
    if (!trimmed || pending.current) return

    const requestGeneration = ++generation.current
    const history = retry ? messages.slice(0, Math.max(0, messages.length - 2)) : messages
    const previousMessages = retainChatMessages(history)
    const userMessage: ChatMessage = { role: 'user', content: trimmed, ts: new Date().toISOString() }
    if (!previousMessages.some(message => message.ts)) {
      trackPortfolioEvent({ name: 'chat_first_question', placement: 'composer' })
    }
    const nextMessages = retainChatMessages([...previousMessages, userMessage])
    pendingDraft.current = { content: trimmed, previousMessages }
    lastPrompt.current = trimmed
    clearPhaseTimers()
    setFailedQuestion(null)
    setAvailability('online')
    setThinkingPhase('searching')
    setMessages(nextMessages)
    persist(nextMessages)
    setInput('')
    setLoading(true)

    const controller = new AbortController()
    pending.current = controller
    phaseTimers.current = [
      window.setTimeout(() => {
        if (generation.current === requestGeneration) setThinkingPhase('verifying')
      }, 700),
      window.setTimeout(() => {
        if (generation.current === requestGeneration) setThinkingPhase('composing')
      }, 1400),
    ]
    const timeout = window.setTimeout(() => controller.abort(), 35_000)

    let streamedContent = ''
    let streamedReasoning: string | undefined
    let streamedSources: ChatSource[] | undefined
    let streamTs = ''

    const complete = (
      nextAvailability: ChatAvailability,
      replyContent: string,
      sources?: ChatSource[],
      reasoning?: string,
    ) => {
      if (generation.current !== requestGeneration) return
      const reply: ChatMessage = {
        role: 'assistant',
        content: replyContent.slice(0, 4000),
        ts: streamTs || new Date().toISOString(),
        sources: nextAvailability === 'online' ? sources : undefined,
        reasoning: nextAvailability === 'online' ? reasoning : undefined,
      }
      const completed = [...nextMessages, reply].slice(-CHAT_MAX_MESSAGES)
      setAvailability(nextAvailability)
      setFailedQuestion(nextAvailability === 'online' ? null : trimmed)
      setMessages(completed)
      persist(completed)
      if (!openRef.current) setHasNewReply(true)
    }

    const fail = (nextAvailability: ChatAvailability, fallback: string) => {
      complete(nextAvailability, fallback)
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/x-ndjson, application/json' },
        body: JSON.stringify({
          sessionId: getOrCreateSessionId(),
          messages: nextMessages.map(({ role, content: messageContent }) => ({ role, content: messageContent })),
          stream: true,
          route: activeRoute,
        }),
        signal: controller.signal,
      })

      const stateFrom = (body: ChatResponse): ChatAvailability => {
        const state = body.availability ?? body.status
        return response.status === 429 || state === 'rate_limited'
          ? 'rate_limited'
          : response.ok && (state === 'ok' || state === 'online' || state === undefined)
            ? 'online'
            : 'unavailable'
      }

      if (!response.headers.get('content-type')?.includes('application/x-ndjson')) {
        const body = await response.json().catch(() => ({})) as ChatResponse
        if (generation.current !== requestGeneration) return
        const nextAvailability = stateFrom(body)
        const fallback = response.status === 429
          ? 'The assistant is receiving too many requests. Please wait a moment or use the contact form.'
          : 'The model is unavailable right now. Faris’s email and the direct contact form still work.'
        const content = typeof body.reply === 'string' ? body.reply : fallback
        complete(
          nextAvailability,
          content,
          restoreSources(body.sources),
          typeof body.reasoning === 'string' ? body.reasoning : undefined,
        )
      } else {
        if (!response.body) throw new Error('Missing stream body')
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let finished = false

        const consume = (line: string) => {
          if (finished || !line.trim()) return
          const event = streamEvent(line)
          if (!event) return
          if (event.type === 'meta') {
            streamedSources = restoreSources(event.sources) ?? streamedSources
            return
          }
          if (event.type === 'delta' && typeof event.content === 'string') {
            if (generation.current !== requestGeneration) return
            clearPhaseTimers()
            streamedContent = event.content.slice(0, 4000)
            streamedReasoning = restoreReasoning(event.reasoning)
            if (!streamTs) streamTs = new Date().toISOString()
            setThinkingPhase('streaming')
            const partial: ChatMessage = {
              role: 'assistant',
              content: streamedContent,
              ts: streamTs,
              sources: streamedSources,
              reasoning: streamedReasoning,
            }
            setMessages([...nextMessages, partial].slice(-CHAT_MAX_MESSAGES))
            return
          }
          if (event.type === 'done') {
            finished = true
            const content = typeof event.reply === 'string' ? event.reply : streamedContent
            if (!content.trim()) throw new Error('Empty completion stream')
            complete('online', content, restoreSources(event.sources) ?? streamedSources, restoreReasoning(event.reasoning) ?? streamedReasoning)
            return
          }
          if (event.type === 'error') {
            finished = true
            const unavailable = event.availability === 'rate_limited' ? 'rate_limited' : 'unavailable'
            fail(unavailable, typeof event.reply === 'string' ? event.reply : UNAVAILABLE_CLIENT_REPLY)
          }
        }

        while (!finished) {
          const { done, value } = await reader.read()
          buffer += decoder.decode(value, { stream: !done })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''
          for (const line of lines) consume(line.replace(/\r$/, ''))
          if (done) break
        }
        if (buffer && !finished) consume(buffer.replace(/\r$/, ''))
        if (!finished) throw new Error('Incomplete completion stream')
      }
    } catch {
      if (generation.current !== requestGeneration) return
      fail('unavailable', 'The request was interrupted or timed out. Your message is preserved in this browser; please retry or use direct email.')
    } finally {
      window.clearTimeout(timeout)
      if (generation.current === requestGeneration) {
        clearPhaseTimers()
        setLoading(false)
        setThinkingPhase('idle')
        pending.current = null
        pendingDraft.current = null
      }
    }
  }, [activeRoute, clearPhaseTimers, messages])

  const cancelRequest = useCallback(() => {
    const draft = pendingDraft.current
    if (!draft) return
    generation.current += 1
    pending.current?.abort()
    pending.current = null
    pendingDraft.current = null
    clearPhaseTimers()
    setLoading(false)
    setThinkingPhase('idle')
    setFailedQuestion(null)
    setMessages(draft.previousMessages.length ? draft.previousMessages : [INTRO])
    persist(draft.previousMessages)
    setInput(current => current || draft.content)
  }, [clearPhaseTimers])

  const retryMessage = useCallback(() => {
    if (failedQuestion && !pending.current) void sendMessage(failedQuestion, true)
  }, [failedQuestion, sendMessage])

  const recallLastPrompt = useCallback(() => {
    if (!lastPrompt.current || pending.current) return
    setInput(lastPrompt.current)
  }, [])

  return {
    isOpen, openChat, beginClose, closeChat,
    messages, input, setInput, isLoading, sendMessage,
    hasNewReply, availability, clearHistory, cancelRequest,
    thinkingPhase, failedQuestion, retryMessage, recallLastPrompt,
  }
}

const UNAVAILABLE_CLIENT_REPLY = 'The model is unavailable right now. Faris’s email and the direct contact form still work.'
