'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Bot, User } from 'lucide-react'
import { useChatSession } from '@/hooks/useChatSession'
import { cn } from '@/lib/utils'

export function ChatWidget() {
  const { isOpen, toggle, messages, isLoading, sendMessage, hasNewReply, isOnline } = useChatSession()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const handleSend = () => {
    const input = inputRef.current
    if (!input || !input.value.trim() || isLoading) return
    sendMessage(input.value)
    input.value = ''
  }

  return (
    <>
      {/* Neural node trigger */}
      <motion.button
        onClick={toggle}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 flex items-center justify-center"
        aria-label="Toggle AI Chat"
        data-cursor="hover"
        style={{ cursor: 'none' }}
      >
        {/* Orbital rings */}
        {!isOpen && (
          <>
            <div className="absolute w-14 h-14 rounded-full border border-cyan/15 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="absolute w-20 h-20 rounded-full border border-cyan/06" />
          </>
        )}
        {/* Core */}
        <div className="w-14 h-14 rounded-full glass flex items-center justify-center border border-cyan/30 transition-all duration-300 hover:border-cyan/70" style={{ boxShadow: '0 0 20px rgba(0,245,255,0.15)' }}>
          {isOpen
            ? <X size={18} className="text-cyan" />
            : (
              <div className="relative">
                <Bot size={18} className="text-cyan" />
                {hasNewReply && <span className="absolute -top-2 -right-2 w-2.5 h-2.5 bg-green rounded-full animate-pulse" />}
              </div>
            )
          }
        </div>
        {!isOpen && (
          <span className="absolute -bottom-5 text-[8px] font-mono text-cyan/50 tracking-widest">ARIA</span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-32px)] h-[520px] max-h-[calc(100vh-120px)] glass rounded-2xl border border-cyan/20 flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-glass">
              <div className="flex items-center gap-2">
                <Bot size={18} className="text-cyan" />
                <div>
                  <p className="text-sm font-display font-semibold text-text-primary">ARIA</p>
                  <div className="flex items-center gap-1.5">
                    <span className={cn('w-1.5 h-1.5 rounded-full', isOnline ? 'bg-green' : 'bg-text-muted')} />
                    <span className="text-[10px] font-mono text-text-muted">{isOnline ? 'Online' : 'Offline'}</span>
                  </div>
                </div>
              </div>
              <button onClick={toggle} className="text-text-muted hover:text-text-primary transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-cyan/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot size={12} className="text-cyan" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-cyan/10 border border-cyan/20 text-text-primary'
                        : 'glass text-text-secondary'
                    )}
                  >
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-violet/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <User size={12} className="text-violet" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-cyan/10 flex items-center justify-center flex-shrink-0">
                    <Bot size={12} className="text-cyan" />
                  </div>
                  <div className="glass rounded-xl px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-cyan/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-cyan/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-cyan/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-border-glass">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ask about Faris's work..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 px-3 py-2 rounded-xl bg-deep border border-border-glass text-text-primary text-xs font-mono placeholder:text-text-muted/40 focus:outline-none focus:border-cyan/40 transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading}
                  className="w-9 h-9 rounded-xl bg-cyan/10 border border-cyan/30 flex items-center justify-center hover:bg-cyan/20 transition-all disabled:opacity-50"
                >
                  <Send size={14} className="text-cyan" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
