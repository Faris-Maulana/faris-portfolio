'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { ChatMessage } from '@/lib/supabase/types'

const SESSION_KEY = 'aria_session_id'
const MESSAGES_KEY = 'aria_messages'

export function useChatSession() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  const [hasNewReply, setHasNewReply] = useState(false)
  const initDone = useRef(false)

  useEffect(() => {
    if (initDone.current) return
    initDone.current = true

    let sid = localStorage.getItem(SESSION_KEY)
    if (!sid) {
      sid = crypto.randomUUID()
      localStorage.setItem(SESSION_KEY, sid)
    }
    setSessionId(sid)

    const saved = localStorage.getItem(MESSAGES_KEY)
    if (saved) {
      try {
        setMessages(JSON.parse(saved))
      } catch {}
    } else {
      const intro: ChatMessage = {
        role: 'assistant',
        content: "Hi! I'm ARIA — Faris's AI assistant. Ask me about his work, projects, or how to get in touch.",
        ts: new Date().toISOString(),
      }
      setMessages([intro])
    }
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMsg: ChatMessage = { role: 'user', content: content.trim(), ts: new Date().toISOString() }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updated.map(m => ({ role: m.role, content: m.content })),
          sessionId,
        }),
      })

      const data = await res.json()
      const reply: ChatMessage = {
        role: 'assistant',
        content: data.reply || 'ARIA is unavailable right now.',
        ts: new Date().toISOString(),
      }
      const final = [...updated, reply]
      setMessages(final)
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(final))
      setHasNewReply(true)
    } catch {
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: "Sorry, I couldn't reach the AI service. Please try again or email Faris directly at maulanafaris016@gmail.com.",
        ts: new Date().toISOString(),
      }
      const final = [...updated, errorMsg]
      setMessages(final)
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(final))
    } finally {
      setIsLoading(false)
    }
  }, [messages, sessionId, isLoading])

  const toggle = useCallback(() => {
    setIsOpen(prev => {
      if (!prev) setHasNewReply(false)
      return !prev
    })
  }, [])

  return { isOpen, toggle, messages, isLoading, sendMessage, hasNewReply, isOnline: true }
}
