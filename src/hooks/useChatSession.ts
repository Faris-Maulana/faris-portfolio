'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChatAvailability, ChatMessage } from '@/lib/chat-types'
import { getOrCreateSessionId } from '@/lib/utils'

const MESSAGES_KEY = 'aria_chat_messages_v2'
const MAX_MESSAGES = 30
const MAX_CONTENT = 500
const RETENTION_MS = 30 * 24 * 60 * 60 * 1000

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

function restoreMessages(): ChatMessage[] {
  if (typeof window === 'undefined') return [INTRO]
  try {
    const saved = window.localStorage.getItem(MESSAGES_KEY)
    if (!saved) return [INTRO]
    const parsed: unknown = JSON.parse(saved)
    if (!Array.isArray(parsed)) return [INTRO]
    const messages = parsed.filter(isMessage).slice(-MAX_MESSAGES).map(item => ({
      role: item.role,
      content: item.content.slice(0, 4000),
      ts: item.ts,
    }))
    const newest = messages.findLast(item => item.ts && Number.isFinite(Date.parse(item.ts)))
    if (newest && Date.now() - Date.parse(newest.ts) > RETENTION_MS) {
      window.localStorage.removeItem(MESSAGES_KEY)
      return [INTRO]
    }
    return messages.length ? messages : [INTRO]
  } catch {
    return [INTRO]
  }
}

function persist(messages: ChatMessage[]) {
  try { window.localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages.slice(-MAX_MESSAGES))) } catch { /* Storage can be blocked without breaking chat. */ }
}

interface ChatResponse {
  reply?: unknown
  availability?: unknown
  status?: unknown
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
    try { window.localStorage.removeItem(MESSAGES_KEY) } catch { /* No persistent copy is available. */ }
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    const trimmed = content.trim().slice(0, MAX_CONTENT)
    if (!trimmed || pending.current) return

    const requestGeneration = ++generation.current
    const userMessage: ChatMessage = { role: 'user', content: trimmed, ts: new Date().toISOString() }
    const previousMessages = messages.filter(message => message.ts)
    const nextMessages = [...previousMessages, userMessage].slice(-MAX_MESSAGES)
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
      const reply: ChatMessage = { role: 'assistant', content: typeof body.reply === 'string' ? body.reply.slice(0, 4000) : fallback, ts: new Date().toISOString() }
      const completed = [...nextMessages, reply].slice(-MAX_MESSAGES)
      setMessages(completed)
      persist(completed)
      if (!openRef.current) setHasNewReply(true)
    } catch {
      if (generation.current !== requestGeneration) return
      setAvailability('unavailable')
      const reply: ChatMessage = { role: 'assistant', content: 'The request was interrupted or timed out. Your message is preserved in this browser; please retry or use direct email.', ts: new Date().toISOString() }
      const completed = [...nextMessages, reply].slice(-MAX_MESSAGES)
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
