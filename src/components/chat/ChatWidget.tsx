'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Bot, User, Trash2 } from 'lucide-react'
import { useChatSession } from '@/hooks/useChatSession'
import { cn } from '@/lib/utils'

export function ChatWidget() {
  const {
    isOpen, toggle, messages, isLoading,
    sendMessage, hasNewReply, isOnline,
    visitorName, clearHistory,
  } = useChatSession()

  const inputRef    = useRef<HTMLInputElement>(null)
  const messagesEnd = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300)
  }, [isOpen])

  const handleSend = () => {
    const input = inputRef.current
    if (!input || !input.value.trim() || isLoading) return
    const value = input.value
    input.value = ''
    sendMessage(value)
  }

  const headerSubtitle = isOnline
    ? (visitorName ? `Hi ${visitorName}!` : 'Ask me anything')
    : 'Reconnecting...'

  return (
    <>
      <motion.button
        onClick={toggle}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 flex items-center justify-center"
        aria-label="Toggle ARIA AI Assistant"
        data-cursor="hover"
        style={{ cursor: 'none' }}
      >
        {!isOpen && (
          <>
            <div className="absolute w-14 h-14 rounded-full border border-cyan/15 animate-ping"
              style={{ animationDuration: '2.5s' }} />
            <div className="absolute w-20 h-20 rounded-full border border-cyan/06" />
          </>
        )}
        <div
          className="w-14 h-14 rounded-full glass flex items-center justify-center border border-cyan/30 transition-all duration-300 hover:border-cyan/70"
          style={{ boxShadow: '0 0 20px rgba(0,245,255,0.15)' }}
        >
          {isOpen ? (
            <X size={18} className="text-cyan" />
          ) : (
            <div className="relative">
              <Bot size={18} className="text-cyan" />
              {hasNewReply && (
                <span className="absolute -top-2 -right-2 w-2.5 h-2.5 bg-green rounded-full animate-pulse" />
              )}
            </div>
          )}
        </div>
        {!isOpen && (
          <span className="absolute -bottom-5 text-[8px] font-mono text-cyan/50 tracking-widest">ARIA</span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 16, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="
              fixed z-50 glass flex flex-col overflow-hidden
              bottom-0 left-0 right-0
              w-full h-[85vh]
              rounded-t-2xl
              sm:bottom-24 sm:right-6 sm:left-auto
              sm:w-[400px] sm:max-w-[calc(100vw-32px)]
              sm:h-[560px] sm:max-h-[calc(100vh-120px)]
              sm:rounded-2xl
              border border-cyan/20
              safe-bottom
            "
          >
            <div className="sm:hidden w-12 h-1 mx-auto my-3 rounded-full bg-cyan/30" />
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-glass"
              style={{ background: 'linear-gradient(135deg, rgba(0,245,255,0.05), transparent)' }}>
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-cyan/10 flex items-center justify-center border border-cyan/20">
                    <Bot size={14} className="text-cyan" />
                  </div>
                  <span className={cn(
                    'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-surface',
                    isOnline ? 'bg-green' : 'bg-amber'
                  )} />
                </div>
                <div>
                  <p className="text-sm font-display font-semibold text-text-primary leading-none mb-0.5">ARIA</p>
                  <p className="text-[10px] font-mono text-text-muted">{headerSubtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearHistory}
                  className="p-1.5 rounded-lg text-text-muted hover:text-amber transition-colors"
                  title="Clear chat history"
                  data-cursor="hover"
                >
                  <Trash2 size={13} />
                </button>
                <button
                  onClick={toggle}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary transition-colors"
                  data-cursor="hover"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {messages.map((msg, i) => (
                <div key={i} className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-cyan/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot size={11} className="text-cyan" />
                    </div>
                  )}
                  <div className={cn(
                    'max-w-[82%] px-3 py-2.5 rounded-2xl text-xs leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-cyan/10 border border-cyan/20 text-text-primary rounded-tr-sm'
                      : 'glass text-text-secondary rounded-tl-sm'
                  )}>
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-violet/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <User size={11} className="text-violet" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-cyan/10 flex items-center justify-center flex-shrink-0">
                    <Bot size={11} className="text-cyan" />
                  </div>
                  <div className="glass rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-cyan/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-cyan/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-cyan/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEnd} />
            </div>

            <div className="p-3 border-t border-border-glass">
              <div className="flex gap-2 items-center">
                <input
                  ref={inputRef}
                  type="text"
                  maxLength={500}
                  placeholder={visitorName ? `Reply, ${visitorName}...` : "Ask about Faris's work..."}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-deep/80 border border-border-glass text-text-primary text-xs font-mono placeholder:text-text-muted/40 focus:outline-none focus:border-cyan/40 transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading}
                  data-cursor="hover"
                  className="w-9 h-9 flex-shrink-0 rounded-xl bg-cyan/10 border border-cyan/30 flex items-center justify-center hover:bg-cyan/20 active:scale-95 transition-all disabled:opacity-40"
                >
                  <Send size={13} className="text-cyan" />
                </button>
              </div>
              <p className="text-[8px] font-mono text-text-muted/40 text-center mt-1.5">
                ARIA &middot; Powered by Faris Maulana
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
