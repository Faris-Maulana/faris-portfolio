'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Bot, User, Trash2 } from 'lucide-react'
import { useChatSession } from '@/hooks/useChatSession'
import { cn } from '@/lib/utils'

export function ChatWidget() {
  const {
    isOpen,
    toggle,
    messages,
    isLoading,
    sendMessage,
    hasNewReply,
    isOnline,
    visitorName,
    clearHistory,
  } = useChatSession()

  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEnd = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!isOpen) return
    const t = setTimeout(() => inputRef.current?.focus(), 280)
    return () => clearTimeout(t)
  }, [isOpen])

  // Escape closes the panel, a fixed overlay with no keyboard dismissal
  // traps anyone navigating without a mouse.
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggle()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, toggle])

  const handleSend = () => {
    const input = inputRef.current
    if (!input || !input.value.trim() || isLoading) return
    const value = input.value
    input.value = ''
    sendMessage(value)
  }

  const subtitle = isOnline
    ? visitorName
      ? `Hi ${visitorName}`
      : 'Ask about Faris’s work'
    : 'Reconnecting…'

  return (
    <>
      <button
        onClick={toggle}
        aria-label={isOpen ? 'Close assistant' : 'Open assistant'}
        aria-expanded={isOpen}
        data-cursor="hover"
        className="group fixed bottom-5 right-5 z-[60] flex h-13 items-center gap-2.5 rounded-full border border-line-2 bg-surface/85 px-4 py-3 backdrop-blur-xl transition-colors duration-300 hover:border-line-3 sm:bottom-6 sm:right-6"
      >
        <span className="relative flex h-5 w-5 items-center justify-center text-signal">
          {isOpen ? <X size={16} /> : <Bot size={16} />}
          {!isOpen && hasNewReply ? (
            <span className="absolute -right-1.5 -top-1.5 h-2 w-2 rounded-full bg-signal" />
          ) : null}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-2 transition-colors group-hover:text-ink">
          {isOpen ? 'Close' : 'Ask ARIA'}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="dialog"
            aria-label="ARIA assistant"
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: 'bottom right' }}
            className="safe-bottom fixed bottom-0 left-0 right-0 z-[59] flex h-[82svh] flex-col overflow-hidden rounded-t-2xl border border-line-2 bg-surface/95 backdrop-blur-2xl sm:bottom-24 sm:left-auto sm:right-6 sm:h-[560px] sm:max-h-[calc(100svh-140px)] sm:w-[380px] sm:rounded-2xl"
          >
            <div className="mx-auto my-3 h-1 w-10 rounded-full bg-line-3 sm:hidden" />

            <header className="flex items-center justify-between border-b border-line px-4 py-3.5">
              <div className="flex items-center gap-3">
                <span className="relative flex h-8 w-8 items-center justify-center rounded-full border border-line-2 bg-canvas-2">
                  <Bot size={14} className="text-signal" />
                  <span
                    className={cn(
                      'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface',
                      isOnline ? 'bg-signal' : 'bg-cred'
                    )}
                  />
                </span>
                <span>
                  <span className="block font-display text-sm font-bold leading-none text-ink">
                    ARIA
                  </span>
                  <span className="mt-1 block font-mono text-[10px] text-ink-3">
                    {subtitle}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearHistory}
                  title="Clear history"
                  aria-label="Clear history"
                  data-cursor="hover"
                  className="rounded-lg p-2 text-ink-4 transition-colors hover:text-ink-2"
                >
                  <Trash2 size={13} />
                </button>
                <button
                  onClick={toggle}
                  aria-label="Close assistant"
                  data-cursor="hover"
                  className="rounded-lg p-2 text-ink-4 transition-colors hover:text-ink"
                >
                  <X size={15} />
                </button>
              </div>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex gap-2',
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {msg.role === 'assistant' && (
                    <span className="mt-1 flex h-6 w-6 flex-none items-center justify-center rounded-full border border-line bg-canvas-2">
                      <Bot size={11} className="text-signal" />
                    </span>
                  )}
                  <p
                    className={cn(
                      'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed',
                      msg.role === 'user'
                        ? 'rounded-tr-sm bg-ink text-canvas'
                        : 'rounded-tl-sm border border-line bg-canvas-2 text-ink-2'
                    )}
                  >
                    {msg.content}
                  </p>
                  {msg.role === 'user' && (
                    <span className="mt-1 flex h-6 w-6 flex-none items-center justify-center rounded-full border border-line bg-canvas-2">
                      <User size={11} className="text-agent" />
                    </span>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2">
                  <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full border border-line bg-canvas-2">
                    <Bot size={11} className="text-signal" />
                  </span>
                  <span className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-line bg-canvas-2 px-4 py-3">
                    {[0, 150, 300].map(delay => (
                      <span
                        key={delay}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-signal/70"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </span>
                </div>
              )}
              <div ref={messagesEnd} />
            </div>

            <div className="border-t border-line p-3">
              <div className="flex items-center gap-2">
                <label htmlFor="aria-input" className="sr-only">
                  Message ARIA
                </label>
                <input
                  id="aria-input"
                  ref={inputRef}
                  type="text"
                  maxLength={500}
                  placeholder={
                    visitorName ? `Reply, ${visitorName}…` : 'Ask about Faris’s work…'
                  }
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  className="field min-h-[42px] flex-1 py-2 text-[13px]"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading}
                  aria-label="Send message"
                  data-cursor="hover"
                  className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-lg bg-signal text-canvas transition-transform active:scale-95 disabled:opacity-40"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
