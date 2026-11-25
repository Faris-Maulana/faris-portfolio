'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChatAvailability, ChatMessage, ChatSource } from '@/lib/chat-types'
import { CHAT_MAX_MESSAGES, retainChatMessages } from '@/lib/chat-retention'
import { trackPortfolioEvent } from '@/lib/analytics'
import { clearSessionId, getOrCreateSessionId } from '@/lib/utils'

const MESSAGES_KEY = 'aria_chat_messages_v2'
const MAX_CONTENT = 500

const INTRO: ChatMessage = {
  role: 'assistant',
  content: 'Ask about Faris’s engineering leadership, system architecture, evaluation practice or public case studies.',
  ts: '',
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

interface ChatResponse {
  reply?: unknown
  availability?: unknown
  status?: unknown
  sources?: unknown
}

export function useChatSession() {
  const [isOpen, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([INTRO])
  const [input, setInput] = useState('')
  const [isLoading, setLoading] = useState(false)
  const [hasNewReply, setHasNewReply] = useState(false)
  const [availability, setAvailability] = useState<ChatAvailability>('online')
  const generation = useRef(0)
  const openRef = useRef(false)
  const pending = useRef<AbortController | null>(null)
  const pendingDraft = useRef<{ content: string; previousMessages: ChatMessage[] } | null>(null)

  useEffect(() => { openRef.current = isOpen }, [isOpen])
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMessages(current => current.length === 1 && current[0] === INTRO ? restoreMessages() : current)
    })
    return () => cancelAnimationFrame(frame)
  }, [])
  useEffect(() => () => { generation.current += 1; pending.current?.abort() }, [])

  const openChat = useCallback(() => {
    trackPortfolioEvent({ name: 'chat_open', placement: 'launcher' })
    openRef.current = true
    setHasNewReply(false)
    setOpen(true)
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
    setLoading(false)
    setMessages([INTRO])
    setHasNewReply(false)
    clearSessionId()
    try { window.localStorage.removeItem(MESSAGES_KEY) } catch { /* No persistent copy is available. */ }
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    const trimmed = content.trim().slice(0, MAX_CONTENT)
    if (!trimmed || pending.current) return

    const requestGeneration = ++generation.current
    const userMessage: ChatMessage = { role: 'user', content: trimmed, ts: new Date().toISOString() }
    const previousMessages = retainChatMessages(messages)
    if (!previousMessages.some(message => message.ts)) {
      trackPortfolioEvent({ name: 'chat_first_question', placement: 'composer' })
    }
    const nextMessages = retainChatMessages([...previousMessages, userMessage])
    pendingDraft.current = { content: trimmed, previousMessages }
    setMessages(nextMessages)
    persist(nextMessages)
    setInput('')
    setLoading(true)

    const controller = new AbortController()
    pending.current = controller
    const timeout = window.setTimeout(() => controller.abort(), 35_000)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: getOrCreateSessionId(),
          messages: nextMessages.map(({ role, content: messageContent }) => ({ role, content: messageContent })),
        }),
        signal: controller.signal,
      })
      const body = await response.json().catch(() => ({})) as ChatResponse
      if (generation.current !== requestGeneration) return

      const state = body.availability ?? body.status
      const nextAvailability: ChatAvailability = response.status === 429 || state === 'rate_limited'
        ? 'rate_limited'
        : response.ok && (state === 'ok' || state === 'online' || state === undefined) ? 'online' : 'unavailable'
      setAvailability(nextAvailability)

      const fallback = response.status === 429
        ? 'The assistant is receiving too many requests. Please wait a moment or use the contact form.'
        : 'The model is unavailable right now. Faris’s email and the direct contact form still work.'
      const reply: ChatMessage = {
        role: 'assistant',
        content: typeof body.reply === 'string' ? body.reply.slice(0, 4000) : fallback,
        ts: new Date().toISOString(),
        sources: nextAvailability === 'online' ? restoreSources(body.sources) : undefined,
      }
      const completed = [...nextMessages, reply].slice(-CHAT_MAX_MESSAGES)
      setMessages(completed)
      persist(completed)
      if (!openRef.current) setHasNewReply(true)
    } catch {
      if (generation.current !== requestGeneration) return
      setAvailability('unavailable')
      const reply: ChatMessage = { role: 'assistant', content: 'The request was interrupted or timed out. Your message is preserved in this browser; please retry or use direct email.', ts: new Date().toISOString() }
      const completed = [...nextMessages, reply].slice(-CHAT_MAX_MESSAGES)
      setMessages(completed)
      persist(completed)
      if (!openRef.current) setHasNewReply(true)
    } finally {
      window.clearTimeout(timeout)
      if (generation.current === requestGeneration) {
        setLoading(false)
        pending.current = null
        pendingDraft.current = null
      }
    }
  }, [messages])

  const cancelRequest = useCallback(() => {
    const draft = pendingDraft.current
    if (!draft) return
    generation.current += 1
    pending.current?.abort()
    pending.current = null
    pendingDraft.current = null
    setLoading(false)
    setMessages(draft.previousMessages.length ? draft.previousMessages : [INTRO])
    persist(draft.previousMessages)
    setInput(current => current || draft.content)
  }, [])

  return {
    isOpen, openChat, closeChat,
    messages, input, setInput, isLoading, sendMessage,
    hasNewReply, availability, clearHistory, cancelRequest,
  }
}
