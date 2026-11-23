'use client'

import { useCallback, useEffect, useRef } from 'react'
import { Bot, Send, Trash2, User, X } from 'lucide-react'
import { useChatSession } from '@/hooks/useChatSession'
import { scrollContainerToBottom } from '@/lib/scroll'

export function ChatWidget() {
  const { isOpen, openChat, closeChat, messages, input, setInput, isLoading, sendMessage, hasNewReply, availability, clearHistory } = useChatSession()
  const dialog = useRef<HTMLDialogElement>(null)
  const log = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const launcher = useRef<HTMLButtonElement>(null)
  // Whether the reader is parked at the live edge of the transcript.
  const pinnedToBottom = useRef(true)

  const trackScroll = useCallback(() => {
    const node = log.current
    if (!node) return
    pinnedToBottom.current = node.scrollHeight - node.scrollTop - node.clientHeight < 48
  }, [])

  useEffect(() => {
    const node = dialog.current
    if (!isOpen || !node) return
    node.showModal()
    // A closed dialog has no layout box, so the transcript can only be
    // measured after showModal and must not wait for the focus frame.
    pinnedToBottom.current = true
    scrollContainerToBottom(log.current)
    const frame = requestAnimationFrame(() => {
      scrollContainerToBottom(log.current)
      inputRef.current?.focus()
    })
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      cancelAnimationFrame(frame)
      document.body.style.overflow = previous
      if (node.open) node.close()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    // Follow replies while the reader is at the live edge, and always reveal
    // the message they just sent. Scrolling earlier history stays put.
    if (messages.at(-1)?.role !== 'user' && !pinnedToBottom.current) return
    const frame = requestAnimationFrame(() => scrollContainerToBottom(log.current))
    return () => cancelAnimationFrame(frame)
  }, [messages, isOpen])

  const latest = messages.at(-1)

  return (
    <>
      <button ref={launcher} type="button" onClick={openChat} className="safe-bottom fixed bottom-4 right-4 z-40 inline-flex min-h-12 items-center gap-3 border border-signal bg-signal px-4 font-display text-sm font-semibold text-on-signal shadow-xl sm:bottom-6 sm:right-6" aria-label={`Ask ARIA: open portfolio assistant${hasNewReply ? ', unread reply' : ''}`} aria-expanded={isOpen} aria-controls="portfolio-assistant">
        <Bot size={19} aria-hidden /><span>Ask ARIA</span>{hasNewReply ? <span className="h-2 w-2 rounded-full bg-on-signal" aria-hidden /> : null}
      </button>

      {isOpen ? (
        <dialog
          ref={dialog}
          id="portfolio-assistant"
          aria-label="Portfolio assistant"
          aria-modal="true"
          className="atlas-dialog chat-dialog safe-bottom"
          data-lenis-prevent
          onClose={() => { closeChat(); launcher.current?.focus() }}
          onClick={event => { if (event.target === event.currentTarget) dialog.current?.close() }}
        >
          <div className="flex min-h-16 items-center gap-3 border-b border-line px-4">
            <span className="grid h-9 w-9 place-items-center border border-signal text-signal"><Bot size={18} aria-hidden /></span>
            <div className="flex-1"><h2 className="font-display text-base font-semibold">ARIA</h2><p className="t-meta">Grounded portfolio assistant</p></div>
            <button type="button" className="icon-btn border-0 bg-transparent" onClick={clearHistory} aria-label="Clear conversation history"><Trash2 size={17} aria-hidden /></button>
            <button type="button" className="icon-btn border-0 bg-transparent" onClick={() => dialog.current?.close()} aria-label="Close portfolio assistant"><X size={19} aria-hidden /></button>
          </div>

          <div ref={log} onScroll={trackScroll} className="chat-log min-h-0 flex-1 space-y-5 p-4" role="log" aria-label="Conversation transcript" aria-live="off" aria-busy={isLoading}>
            {messages.map((message, index) => (
              <div key={`${message.ts}-${index}`} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <span className={`mt-1 grid h-7 w-7 shrink-0 place-items-center border ${message.role === 'user' ? 'border-data text-data' : 'border-line-2 text-signal'}`} aria-hidden>{message.role === 'user' ? <User size={13} /> : <Bot size={13} />}</span>
                <div className={`chat-message max-w-[85%] border px-3 py-2.5 text-sm leading-relaxed ${message.role === 'user' ? 'border-data/30 bg-surface-2 text-ink' : 'border-line bg-canvas-2 text-ink-2'}`}>
                  <span className="sr-only">{message.role === 'user' ? 'You: ' : 'ARIA: '}</span>{message.content}
                </div>
              </div>
            ))}
            {isLoading ? <p className="flex items-center gap-3 text-sm text-signal"><span className="h-2 w-2 animate-pulse rounded-full bg-signal" aria-hidden />Checking the portfolio context</p> : null}
          </div>

          <div data-chat-footer className="border-t border-line p-4">
            <p className="mb-4 text-xs leading-relaxed text-ink-3">AI-generated responses can be inaccurate; verify important details. OpenRouter generates replies from recent messages. This browser keeps a copy for up to 30 days. If you include an email, that message and recent context may be forwarded to Faris. Clear removes only this browser copy.</p>
            <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{isLoading ? 'ARIA is preparing a response.' : latest?.role === 'assistant' && latest.ts ? `ARIA replied: ${latest.content}` : ''}</p>
            {availability !== 'online' ? <p className={`mb-3 text-xs ${availability === 'rate_limited' ? 'text-cred' : 'text-threat'}`} role="alert">{availability === 'rate_limited' ? 'Request limit reached. Retry later or use direct contact.' : 'Model service unavailable. Direct contact remains available below.'}</p> : null}
            <form onSubmit={event => { event.preventDefault(); void sendMessage(input) }} aria-busy={isLoading}>
              <label htmlFor="chat-message" className="t-meta mb-2 block">Message</label>
              <div className="flex items-end gap-2">
                <textarea ref={inputRef} id="chat-message" className="field min-h-12 flex-1 resize-none" rows={2} maxLength={500} required value={input} onChange={event => setInput(event.target.value)} placeholder="Ask about architecture, evaluation or leadership" onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void sendMessage(input) } }} />
                <button type="submit" className="icon-btn h-12 w-12 shrink-0 border-signal text-signal" disabled={isLoading || !input.trim()} aria-label="Send message"><Send size={17} aria-hidden /></button>
              </div>
              <p data-chat-hint className="t-meta mt-2">{input.length}/500. Enter to send, Shift+Enter for a new line.</p>
            </form>
            <a href="#contact" onClick={() => dialog.current?.close()} data-chat-link className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-signal underline underline-offset-4">Use direct contact instead</a>
          </div>
        </dialog>
      ) : null}
    </>
  )
}
