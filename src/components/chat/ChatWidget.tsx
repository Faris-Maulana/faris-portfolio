'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowRight, ArrowUp, ArrowUpRight, Bot, Braces, Database, FlaskConical, ShieldCheck, Trash2, User, X } from 'lucide-react'
import { useChatSession } from '@/hooks/useChatSession'
import { scrollContainerToBottom } from '@/lib/scroll'

const STARTERS = [
  { Icon: Database, label: 'Query controls', question: 'How is generated SQL validated before execution?' },
  { Icon: Braces, label: 'System maturity', question: 'Which projects are still in development?' },
  { Icon: FlaskConical, label: 'Evaluation', question: 'How is RAG quality evaluated?' },
  { Icon: ShieldCheck, label: 'Leadership', question: 'What does Faris own as an AI engineering lead?' },
] as const

export function ChatWidget() {
  const { isOpen, openChat, closeChat, messages, input, setInput, isLoading, sendMessage, hasNewReply, availability, clearHistory } = useChatSession()
  const dialog = useRef<HTMLDialogElement>(null)
  const log = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const launcher = useRef<HTMLButtonElement>(null)
  const pinnedToBottom = useRef(true)
  const [awayFromBottom, setAwayFromBottom] = useState(false)

  const trackScroll = useCallback(() => {
    const node = log.current
    if (!node) return
    const distance = node.scrollHeight - node.scrollTop - node.clientHeight
    pinnedToBottom.current = distance < 48
    setAwayFromBottom(distance > 160)
  }, [])

  const jumpToLatest = useCallback(() => {
    pinnedToBottom.current = true
    setAwayFromBottom(false)
    scrollContainerToBottom(log.current)
  }, [])

  useEffect(() => {
    const node = dialog.current
    if (!isOpen || !node) return
    node.showModal()
    // A closed dialog has no layout box, so measurement starts after showModal.
    pinnedToBottom.current = true
    setAwayFromBottom(false)
    const hasSavedMessages = Boolean(log.current?.querySelector('.chat-turn'))
    if (hasSavedMessages) scrollContainerToBottom(log.current)
    else log.current?.scrollTo({ top: 0, behavior: 'auto' })
    const frame = requestAnimationFrame(() => {
      if (hasSavedMessages) scrollContainerToBottom(log.current)
      else log.current?.scrollTo({ top: 0, behavior: 'auto' })
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
    const latestMessage = messages.at(-1)
    if (!latestMessage?.ts) {
      const frame = requestAnimationFrame(() => log.current?.scrollTo({ top: 0, behavior: 'auto' }))
      return () => cancelAnimationFrame(frame)
    }
    // Always reveal the reader's own message. Follow replies only at the live edge.
    if (latestMessage.role !== 'user' && !pinnedToBottom.current) return
    const frame = requestAnimationFrame(() => scrollContainerToBottom(log.current))
    return () => cancelAnimationFrame(frame)
  }, [messages, isOpen])

  const latest = messages.at(-1)
  const hasConversation = messages.some(message => message.ts)

  return (
    <>
      <button ref={launcher} type="button" onClick={openChat} className="chat-launcher safe-bottom fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6" aria-expanded={isOpen} aria-controls="portfolio-assistant">
        <span className="chat-launcher-mark" aria-hidden><Bot size={19} /></span>
        <span className="text-left"><span className="block font-display text-sm font-bold">Ask ARIA</span><span className="chat-launcher-sub">Portfolio intelligence</span></span>
        <ArrowUpRight size={17} aria-hidden />
        <span className="sr-only">: open portfolio assistant{hasNewReply ? ', unread reply' : ''}</span>
        {hasNewReply ? <span className="chat-unread" aria-hidden /> : null}
      </button>

      {isOpen ? (
        <dialog
          ref={dialog}
          id="portfolio-assistant"
          aria-label="Portfolio assistant"
          aria-modal="true"
          className="atlas-dialog chat-dialog"
          data-lenis-prevent
          onClose={() => { closeChat(); launcher.current?.focus() }}
          onClick={event => { if (event.target === event.currentTarget) dialog.current?.close() }}
        >
          <header className="chat-header">
            <span className="chat-brand-mark" aria-hidden><Bot size={19} /></span>
            <div className="flex-1">
              <div className="flex items-center gap-2"><h2 className="font-display text-base font-bold tracking-tight">ARIA</h2><span className="chat-status-dot" aria-hidden /></div>
              <p className="text-xs text-ink-3">Public context, explicit limitations</p>
            </div>
            <button type="button" className="chat-header-btn" onClick={clearHistory} aria-label="Clear conversation history" title="Clear conversation"><Trash2 size={16} aria-hidden /></button>
            <button type="button" className="chat-header-btn" onClick={() => dialog.current?.close()} aria-label="Close portfolio assistant" title="Close"><X size={18} aria-hidden /></button>
          </header>

          <div className="chat-transcript">
            <div ref={log} onScroll={trackScroll} className="chat-log" role="log" aria-label="Conversation transcript" aria-live="off" aria-busy={isLoading}>
              {!hasConversation ? (
                <div className="chat-welcome">
                  <p className="chat-eyebrow">Engineering, open to inspection</p>
                  <h3 className="chat-welcome-title">Interrogate<br />the <span>work.</span></h3>
                  <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-2">Explore architecture, evaluation, leadership or project maturity. Answers are grounded in this public portfolio, not private company records.</p>
                  <div className="chat-starters" aria-label="Suggested questions">
                    {STARTERS.map(({ Icon, label, question }) => (
                      <button key={question} type="button" disabled={isLoading} onClick={() => void sendMessage(question)}>
                        <Icon size={16} aria-hidden />
                        <span><span className="block text-xs text-ink-3">{label}</span><span className="mt-0.5 block text-left text-sm font-semibold text-ink">{question}</span></span>
                        <ArrowRight className="chat-starter-arrow" size={16} aria-hidden />
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="chat-messages">
                {messages.filter(message => message.ts).map((message, index) => (
                  <article key={`${message.ts}-${index}`} className={`chat-turn ${message.role === 'user' ? 'chat-turn-user' : ''}`}>
                    <div className="chat-turn-meta">
                      <span className={`chat-avatar ${message.role === 'user' ? 'chat-avatar-user' : ''}`} aria-hidden>{message.role === 'user' ? <User size={12} /> : <Bot size={12} />}</span>
                      <span>{message.role === 'user' ? 'You' : 'ARIA'}</span>
                    </div>
                    <div className={`chat-message ${message.role === 'user' ? 'chat-message-user' : ''}`}>
                      <span className="sr-only">{message.role === 'user' ? 'You: ' : 'ARIA: '}</span>{message.content}
                    </div>
                  </article>
                ))}
                {isLoading ? (
                  <div className="chat-turn" data-testid="chat-loading">
                    <div className="chat-turn-meta"><span className="chat-avatar" aria-hidden><Bot size={12} /></span><span>ARIA</span></div>
                    <div className="chat-thinking"><span className="chat-thinking-dots" aria-hidden><i /><i /><i /></span><span>Tracing public project context</span></div>
                  </div>
                ) : null}
              </div>
            </div>
            {awayFromBottom ? <button type="button" className="chat-jump" onClick={jumpToLatest}><ArrowDown size={14} aria-hidden />Latest message</button> : null}
          </div>

          <footer data-chat-footer className="chat-footer">
            {availability !== 'online' ? <p className={`chat-availability ${availability === 'rate_limited' ? 'text-cred' : 'text-threat'}`} role="alert">{availability === 'rate_limited' ? 'Request limit reached. Retry later or use direct contact.' : 'Model service unavailable. Your message is preserved; direct contact remains available.'}</p> : null}
            <form onSubmit={event => { event.preventDefault(); void sendMessage(input) }} aria-busy={isLoading}>
              <label htmlFor="chat-message" className="sr-only">Message</label>
              <div className="chat-input-shell">
                <textarea ref={inputRef} id="chat-message" className="chat-input" rows={2} maxLength={500} required value={input} onChange={event => setInput(event.target.value)} placeholder="Ask about the systems..." onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void sendMessage(input) } }} />
                <button type="submit" className="chat-send" disabled={isLoading || !input.trim()} aria-label="Send message"><ArrowUp size={18} aria-hidden /></button>
              </div>
              <div data-chat-hint className="chat-composer-meta"><span>Enter to send, Shift+Enter for a new line</span><span className="tnum">{input.length}/500</span></div>
            </form>
            <div className="chat-footer-row">
              <p className="text-xs leading-relaxed text-ink-3">AI-generated responses can be inaccurate; verify important details.</p>
              <a href="#contact" onClick={() => dialog.current?.close()} data-chat-link className="chat-direct-link">Direct contact<ArrowUpRight size={13} aria-hidden /></a>
            </div>
            <details className="chat-privacy">
              <summary>Privacy and retention</summary>
              <p>OpenRouter generates replies from recent messages. This browser keeps a copy for up to 30 days. If you include an email, that message and recent context may be forwarded to Faris. Clear removes only this browser copy.</p>
            </details>
            <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{isLoading ? 'ARIA is preparing a response.' : latest?.role === 'assistant' && latest.ts ? `ARIA replied: ${latest.content}` : ''}</p>
          </footer>
        </dialog>
      ) : null}
    </>
  )
}
