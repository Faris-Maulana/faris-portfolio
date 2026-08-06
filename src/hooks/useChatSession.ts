'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { ChatMessage } from '@/lib/supabase/types'
import { getOrCreateSessionId } from '@/lib/utils'

const MESSAGES_KEY = 'aria_chat_messages_v2'

const INTRO: ChatMessage = {
  role: 'assistant',
  content:
    "Hi, I'm ARIA, the assistant on Faris's site. Ask me about his work, projects, or experience.",
  ts: '',
}

/**
 * Restores prior messages during the first client render instead of inside an
 * effect.
 *
 * The panel is closed on first paint, so none of this state reaches the server
 * HTML and there is no hydration mismatch to trade away. Hydrating in an effect
 * would cost a second render on every mount for no benefit.
 */
function restoreMessages(): ChatMessage[] {
  if (typeof window === 'undefined') return []

  const saved = window.localStorage.getItem(MESSAGES_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as ChatMessage[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    } catch {
      // Corrupt entry. Fall through and start the conversation fresh.
    }
  }
  return [INTRO]
}

export function useChatSession() {
  const [isOpen,      setIsOpen]      = useState(false)
  const [messages,    setMessages]    = useState<ChatMessage[]>(restoreMessages)
  const [isLoading,   setIsLoading]   = useState(false)
  const [hasNewReply, setHasNewReply] = useState(false)
  const [isOnline,    setIsOnline]    = useState(true)
  const [visitorName, setVisitorName] = useState<string>('')
  const sessionId = useRef<string>('')
  const initDone  = useRef(false)

  // Messages are already restored by the useState initialiser above, so this
  // only has to claim a session id.
  useEffect(() => {
    if (initDone.current) return
    initDone.current = true
    sessionId.current = getOrCreateSessionId()
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMsg: ChatMessage = {
      role:    'user',
      content: content.trim(),
      ts:      new Date().toISOString(),
    }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages:  updated.map(m => ({ role: m.role, content: m.content })),
          sessionId: sessionId.current,
        }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()

      if (data.visitorName && !visitorName) {
        setVisitorName(data.visitorName)
      }

      const reply: ChatMessage = {
        role:    'assistant',
        content: data.reply || 'ARIA is unavailable. Email: maulanafaris016@gmail.com',
        ts:      new Date().toISOString(),
      }

      const final = [...updated, reply]
      setMessages(final)
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(final))

      if (!isOpen) setHasNewReply(true)
      setIsOnline(true)

    } catch {
      const errorMsg: ChatMessage = {
        role:    'assistant',
        content: "Sorry, I couldn't reach the AI service right now. You can email Faris directly at maulanafaris016@gmail.com.",
        ts:      new Date().toISOString(),
      }
      const final = [...updated, errorMsg]
      setMessages(final)
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(final))
      setIsOnline(false)
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading, isOpen, visitorName])

  const toggle = useCallback(() => {
    setIsOpen(prev => {
      if (!prev) setHasNewReply(false)
      return !prev
    })
  }, [])

  const clearHistory = useCallback(() => {
    localStorage.removeItem(MESSAGES_KEY)
    const intro: ChatMessage = {
      role:    'assistant',
      content: "Hi again! What can I help you with today?",
      ts:      new Date().toISOString(),
    }
    setMessages([intro])
  }, [])

  return {
    isOpen,
    toggle,
    messages,
    isLoading,
    sendMessage,
    hasNewReply,
    isOnline,
    visitorName,
    clearHistory,
  }
}
