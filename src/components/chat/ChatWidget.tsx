'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowDown, ArrowRight, ArrowUp, ArrowUpRight, Bot, Braces, Check, Copy, Database,
  Download, FlaskConical, Maximize2, Minimize2, ShieldCheck, Square, Trash2, User, X,
} from 'lucide-react'
import { useChatSession } from '@/hooks/useChatSession'
import { formatTranscriptMarkdown, getFollowUpQuestions } from '@/lib/chat-transcript'
import { keepDialogFocus } from '@/lib/dialog-focus'
import { scrollContainerToBottom } from '@/lib/scroll'

const STARTERS = [
  { Icon: Database, label: 'Query controls', question: 'How is generated SQL validated before execution?' },
  { Icon: Braces, label: 'System maturity', question: 'Which projects are still in development?' },
  { Icon: FlaskConical, label: 'Evaluation', question: 'How is RAG quality evaluated?' },
  { Icon: ShieldCheck, label: 'Leadership', question: 'What does Faris own as an AI engineering lead?' },
] as const

const TIME_FORMAT = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' })

export function ChatWidget() {
  const {
    isOpen, openChat, closeChat, messages, input, setInput, isLoading, sendMessage,
    hasNewReply, availability, clearHistory, cancelRequest,
  } = useChatSession()
  const dialog = useRef<HTMLDialogElement>(null)
  const log = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const launcher = useRef<HTMLButtonElement>(null)
  const clearTrigger = useRef<HTMLButtonElement>(null)
  const pinnedToBottom = useRef(true)
  const [awayFromBottom, setAwayFromBottom] = useState(false)
  const [isExpanded, setExpanded] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [notice, setNotice] = useState('')
  const [copiedMessage, setCopiedMessage] = useState('')
  const [replyAnnouncement, setReplyAnnouncement] = useState('')
  const observedMessages = useRef(messages)

  const trackScroll = useCallback(() => {
    const node = log.current
    if (!node) return
    const distance = node.scrollHeight - node.scrollTop - node.clientHeight
    pinnedToBottom.current = distance < 48
    setAwayFromBottom(distance >= 48)
  }, [])

  const jumpToLatest = useCallback(() => {
    pinnedToBottom.current = true
    setAwayFromBottom(false)
    scrollContainerToBottom(log.current)
  }, [])

  useEffect(() => {
    const node = dialog.current
    if (!isOpen || !node) return
    if (!node.open) node.showModal()
    // A closed dialog has no layout box, so measurement starts after showModal.
    pinnedToBottom.current = true
    setAwayFromBottom(false)
    setConfirmClear(false)
    setNotice('')
    setReplyAnnouncement('')
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
    if (latestMessage.role === 'user') {
      pinnedToBottom.current = true
    } else if (!pinnedToBottom.current) {
      const frame = requestAnimationFrame(() => setAwayFromBottom(true))
      return () => cancelAnimationFrame(frame)
    }
    const frame = requestAnimationFrame(() => {
      setAwayFromBottom(false)
      scrollContainerToBottom(log.current)
    })
    return () => cancelAnimationFrame(frame)
  }, [messages, isOpen])

  useEffect(() => {
    if (!copiedMessage) return
    const timeout = window.setTimeout(() => setCopiedMessage(''), 2000)
    return () => window.clearTimeout(timeout)
  }, [copiedMessage])

  useEffect(() => {
    const previous = observedMessages.current
    observedMessages.current = messages
    const latestMessage = messages.at(-1)
    if (!isOpen || messages.length <= previous.length || latestMessage?.role !== 'assistant' || !latestMessage.ts) return
    setReplyAnnouncement(`ARIA replied: ${latestMessage.content}`)
  }, [messages, isOpen])

  const latest = messages.at(-1)
  const hasConversation = messages.some(message => message.ts)
  const lastQuestion = messages.filter(message => message.role === 'user').at(-1)?.content ?? ''
  const followUps = latest?.role === 'assistant' && availability === 'online' ? getFollowUpQuestions(lastQuestion) : []

  const submitQuestion = (question: string) => {
    setConfirmClear(false)
    void sendMessage(question)
  }

  const copyResponse = async (content: string, timestamp: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessage(timestamp)
      setNotice('Response copied to clipboard.')
    } catch {
      setNotice('Clipboard access is unavailable. Select the response text to copy it.')
    }
  }

  const exportTranscript = () => {
    if (!hasConversation) return
    const blob = new Blob([formatTranscriptMarkdown(messages, new Date())], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `aria-portfolio-conversation-${new Date().toISOString().slice(0, 10)}.md`
    document.body.append(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setNotice('Markdown download started.')
  }

  const stopResponse = () => {
    cancelRequest()
    setNotice('Response stopped. Your question is ready to edit or send again.')
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  return (
    <>
      <button
        ref={launcher}
        type="button"
        onClick={openChat}
        className="chat-launcher fixed z-40"
        aria-expanded={isOpen}
        aria-controls="portfolio-assistant"
      >
        <span className="chat-launcher-mark" aria-hidden><Bot size={18} /></span>
        <span className="chat-launcher-copy">
          <span className="block font-display text-sm font-bold">Ask ARIA</span>
          <span className="chat-launcher-sub">Engineering intelligence</span>
        </span>
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
          className={`atlas-dialog chat-dialog ${isExpanded ? 'chat-dialog-expanded' : ''}`}
          data-lenis-prevent
          onKeyDown={keepDialogFocus}
          onClose={() => {
            if (dialog.current?.open) return
            closeChat()
            setExpanded(false)
            setConfirmClear(false)
            launcher.current?.focus()
          }}
          onClick={event => { if (event.target === event.currentTarget) dialog.current?.close() }}
        >
          <header className="chat-header">
            <span className="chat-brand-mark" aria-hidden><Bot size={19} /></span>
            <div className="chat-heading">
              <div className="chat-heading-line"><h2>ARIA</h2><span className={`chat-status-dot ${availability !== 'online' ? 'is-offline' : ''}`} aria-hidden /></div>
              <p>AI portfolio assistant / public context</p>
            </div>
            <div className="chat-header-actions">
              <button type="button" className="chat-header-btn" onClick={exportTranscript} disabled={!hasConversation} aria-label="Export conversation as Markdown" title="Export conversation"><Download size={16} aria-hidden /></button>
              <button ref={clearTrigger} type="button" className="chat-header-btn chat-clear-trigger" onClick={() => setConfirmClear(true)} disabled={!hasConversation || confirmClear} aria-label="Clear conversation history" title="Clear conversation"><Trash2 size={16} aria-hidden /></button>
              <span className="chat-header-divider" aria-hidden />
              <button type="button" className="chat-header-btn chat-expand-trigger" onClick={() => setExpanded(current => !current)} aria-label={isExpanded ? 'Restore compact assistant' : 'Expand assistant'} title={isExpanded ? 'Compact view' : 'Expand view'}>{isExpanded ? <Minimize2 size={16} aria-hidden /> : <Maximize2 size={16} aria-hidden />}</button>
              <button type="button" className="chat-header-btn" onClick={() => dialog.current?.close()} aria-label="Close portfolio assistant" title="Close"><X size={18} aria-hidden /></button>
            </div>
          </header>

          {confirmClear ? (
            <div className="chat-confirm" role="alert">
              <div><strong>Clear this browser&apos;s conversation?</strong><span>This removes the local transcript and cannot be undone.</span></div>
              <button type="button" onClick={() => { setConfirmClear(false); requestAnimationFrame(() => clearTrigger.current?.focus()) }} autoFocus>Keep</button>
              <button type="button" className="chat-confirm-danger" onClick={() => { clearHistory(); setConfirmClear(false); setNotice('Local conversation cleared.'); inputRef.current?.focus() }}>Clear</button>
            </div>
          ) : null}

          <div className="chat-transcript">
            <div ref={log} onScroll={trackScroll} className="chat-log" role="log" aria-label="Conversation transcript" aria-live="off" aria-busy={isLoading} tabIndex={0}>
              {!hasConversation ? (
                <div className="chat-welcome">
                  <div className="chat-welcome-intro">
                    <p className="chat-eyebrow">Engineering, open to inspection</p>
                    <h3 className="chat-welcome-title">Interrogate<br />the <span>work.</span></h3>
                    <p className="chat-welcome-body">Explore architecture, evaluation, leadership or project maturity. Answers use this public portfolio, not private company records.</p>
                    <div className="chat-scope"><span>Knowledge boundary</span><strong>Architecture / Evaluation / Delivery / Leadership</strong></div>
                  </div>
                  <div className="chat-starters" aria-label="Suggested questions">
                    <p className="chat-section-label">Start with a useful question</p>
                    {STARTERS.map(({ Icon, label, question }) => (
                      <button key={question} type="button" disabled={isLoading} onClick={() => submitQuestion(question)}>
                        <span className="chat-starter-icon"><Icon size={16} aria-hidden /></span>
                        <span><span className="chat-starter-label">{label}</span><span className="chat-starter-question">{question}</span></span>
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
                      <time dateTime={message.ts}>{TIME_FORMAT.format(new Date(message.ts))}</time>
                    </div>
                    <div className={`chat-message ${message.role === 'user' ? 'chat-message-user' : ''}`}>
                      <span className="sr-only">{message.role === 'user' ? 'You: ' : 'ARIA: '}</span>{message.content}
                    </div>
                    {message.role === 'assistant' ? (
                      <div className="chat-message-actions">
                        <button type="button" onClick={() => void copyResponse(message.content, message.ts)} aria-label={`Copy response from ${TIME_FORMAT.format(new Date(message.ts))}`}>
                          {copiedMessage === message.ts ? <Check size={13} aria-hidden /> : <Copy size={13} aria-hidden />}
                          {copiedMessage === message.ts ? 'Copied' : 'Copy response'}
                        </button>
                      </div>
                    ) : null}
                  </article>
                ))}
                {isLoading ? (
                  <div className="chat-turn" data-testid="chat-loading">
                    <div className="chat-turn-meta"><span className="chat-avatar" aria-hidden><Bot size={12} /></span><span>ARIA</span><span>Working</span></div>
                    <div className="chat-thinking"><span className="chat-thinking-dots" aria-hidden><i /><i /><i /></span><span>Reading public project context</span></div>
                  </div>
                ) : null}
                {followUps.length > 0 && !isLoading ? (
                  <div className="chat-followups">
                    <p className="chat-section-label">Continue the inspection</p>
                    <div>{followUps.map(question => <button key={question} type="button" onClick={() => submitQuestion(question)}>{question}<ArrowRight size={14} aria-hidden /></button>)}</div>
                  </div>
                ) : null}
              </div>
            </div>
            {awayFromBottom ? <button type="button" className="chat-jump" onClick={jumpToLatest}><ArrowDown size={14} aria-hidden />Latest message</button> : null}
          </div>

          <footer data-chat-footer className="chat-footer">
            {availability !== 'online' ? <p className={`chat-availability ${availability === 'rate_limited' ? 'text-cred' : 'text-threat'}`} role="alert">{availability === 'rate_limited' ? 'Request limit reached. Retry later or use direct contact.' : 'Model service unavailable. Your message is preserved; direct contact remains available.'}</p> : null}
            <div aria-busy={isLoading}>
              <label htmlFor="chat-message" className="sr-only">Message</label>
              <div className={`chat-input-shell ${isLoading ? 'is-loading' : ''}`}>
                <textarea
                  ref={inputRef}
                  id="chat-message"
                  className="chat-input"
                  rows={1}
                  maxLength={500}
                  value={input}
                  onChange={event => setInput(event.target.value)}
                  placeholder="Ask about architecture, evaluation or leadership..."
                  aria-describedby="chat-composer-guidance"
                  onKeyDown={event => {
                    if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return
                    if (event.key !== 'Enter' || event.shiftKey || isLoading) return
                    event.preventDefault()
                    submitQuestion(input)
                  }}
                />
                {isLoading ? (
                  <button key="stop" type="button" className="chat-send chat-stop" onClick={stopResponse} aria-label="Stop generating response" title="Stop response"><Square size={13} aria-hidden /></button>
                ) : (
                  <button key="send" type="button" className="chat-send" onClick={() => submitQuestion(input)} disabled={!input.trim()} aria-label="Send message" title="Send message"><ArrowUp size={18} aria-hidden /></button>
                )}
              </div>
              <div data-chat-hint id="chat-composer-guidance" className="chat-composer-meta"><span>Enter to send / Shift+Enter for a new line</span><span className="tnum">{input.length}/500</span></div>
            </div>
            <div className="chat-footer-row">
              <p>AI-generated. Verify important details.</p>
              <a href="#contact" onClick={() => dialog.current?.close()} data-chat-link className="chat-direct-link">Talk to Faris<ArrowUpRight size={13} aria-hidden /></a>
            </div>
            <details className="chat-privacy">
              <summary>Privacy and retention</summary>
              <p>OpenRouter generates replies from recent messages. This browser keeps a copy for up to 30 days. If you include an email, that message and recent context may be forwarded to Faris. Clear removes only this browser copy.</p>
            </details>
            <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{isLoading ? 'ARIA is preparing a response.' : replyAnnouncement}</p>
            <p className="sr-only" role="status" aria-live="polite">{notice}</p>
          </footer>
        </dialog>
      ) : null}
    </>
  )
}
