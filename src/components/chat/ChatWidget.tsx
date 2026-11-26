'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ArrowDown, ArrowRight, ArrowUp, ArrowUpRight, Bot, Braces, Check, Copy, Database,
  Download, FlaskConical, Maximize2, Minimize2, RotateCcw, ShieldCheck, Square, Trash2, User, X,
} from 'lucide-react'
import { ChatMarkdown } from '@/components/chat/ChatMarkdown'
import { useChatSession } from '@/hooks/useChatSession'
import { MAX_CHAT_INPUT_CHARS } from '@/lib/chat-schema'
import { getStarterQuestions, type ChatStarterIcon } from '@/lib/chat-prompts'
import { formatTranscriptMarkdown, getFollowUpQuestions, stripGeneratedRolePrefix } from '@/lib/chat-transcript'
import { keepDialogFocus } from '@/lib/dialog-focus'
import { scrollContainerToBottom } from '@/lib/scroll'
import { trackPortfolioEvent } from '@/lib/analytics'

const STARTER_ICONS: Record<ChatStarterIcon, typeof Database> = {
  architecture: Braces,
  controls: Database,
  evaluation: FlaskConical,
  leadership: ShieldCheck,
  maturity: ShieldCheck,
}
const TIME_FORMAT = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' })
const THINKING_COPY = {
  idle: 'Reading public project context',
  searching: 'Searching public portfolio records…',
  verifying: 'Verifying evidence boundaries…',
  composing: 'Composing response…',
  streaming: 'Receiving response…',
} as const

function sourceKind(href: string): string {
  if (href.startsWith('/work/')) return 'CASE STUDY / PUBLIC RECORD'
  if (href === '/simpul') return 'INTERACTIVE / SYNTHESIZED'
  if (href.startsWith('/#')) return 'PORTFOLIO / PUBLIC RECORD'
  if (href.includes('github.com')) return 'REPOSITORY / INSPECTABLE'
  return 'PUBLIC DEMO / ARTIFACT'
}

export function ChatWidget() {
  const pathname = usePathname()
  const {
    isOpen, openChat, beginClose, closeChat, messages, input, setInput, isLoading, sendMessage,
    hasNewReply, availability, clearHistory, cancelRequest, thinkingPhase, failedQuestion,
    retryMessage, recallLastPrompt,
  } = useChatSession(pathname)
  const dialog = useRef<HTMLDialogElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const closeTimer = useRef(0)
  const log = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const launcher = useRef<HTMLButtonElement>(null)
  const clearTrigger = useRef<HTMLButtonElement>(null)
  const pinnedToBottom = useRef(true)
  const wasLoading = useRef(false)
  const [awayFromBottom, setAwayFromBottom] = useState(false)
  const [isExpanded, setExpanded] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [notice, setNotice] = useState('')
  const [copiedMessage, setCopiedMessage] = useState('')
  const [replyAnnouncement, setReplyAnnouncement] = useState('')

  const requestClose = useCallback(() => {
    const node = dialog.current
    if (!node || node.dataset.closing === 'true') return
    beginClose()
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      node.close()
      return
    }
    node.dataset.closing = 'true'
    launcher.current?.focus()
    if (closeButton.current) closeButton.current.disabled = true
    closeTimer.current = window.setTimeout(() => node.close(), 180)
  }, [beginClose])

  useEffect(() => () => window.clearTimeout(closeTimer.current), [])

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

  const openAssistant = useCallback(() => {
    window.clearTimeout(closeTimer.current)
    if (dialog.current) delete dialog.current.dataset.closing
    if (closeButton.current) closeButton.current.disabled = false
    openChat()
  }, [openChat])

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      const target = event.target
      const editing = target instanceof HTMLElement && (
        target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
      )
      const commandK = (event.metaKey || event.ctrlKey) && !event.altKey && event.key.toLocaleLowerCase() === 'k'
      const slash = event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey && !editing
      if (!commandK && !slash) return
      event.preventDefault()
      if (isOpen) inputRef.current?.focus()
      else openAssistant()
    }
    document.addEventListener('keydown', onShortcut)
    return () => document.removeEventListener('keydown', onShortcut)
  }, [isOpen, openAssistant])

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
    const node = inputRef.current
    if (!node || !isOpen) return
    const computed = window.getComputedStyle(node)
    const lineHeight = Number.parseFloat(computed.lineHeight) || 24
    const verticalPadding = Number.parseFloat(computed.paddingTop) + Number.parseFloat(computed.paddingBottom)
    const maxHeight = lineHeight * 5 + verticalPadding
    node.style.height = 'auto'
    const nextHeight = Math.min(Math.max(node.scrollHeight, lineHeight + verticalPadding), maxHeight)
    node.style.height = `${nextHeight}px`
    node.style.overflowY = node.scrollHeight > maxHeight ? 'auto' : 'hidden'
  }, [input, isOpen])

  useEffect(() => {
    if (!isOpen) return
    const latestMessage = messages.at(-1)
    if (!latestMessage?.ts) {
      const frame = requestAnimationFrame(() => log.current?.scrollTo({ top: 0, behavior: 'auto' }))
      return () => cancelAnimationFrame(frame)
    }
    // Always reveal the reader's own message. Follow replies only at the live edge.
    if (latestMessage.role === 'user') pinnedToBottom.current = true
    const frame = requestAnimationFrame(() => {
      if (latestMessage.role === 'assistant' && !pinnedToBottom.current) {
        setAwayFromBottom(true)
        return
      }
      setAwayFromBottom(false)
      scrollContainerToBottom(log.current)
    })
    return () => cancelAnimationFrame(frame)
  }, [messages, isLoading, isOpen])

  useEffect(() => {
    if (!copiedMessage) return
    const timeout = window.setTimeout(() => setCopiedMessage(''), 2000)
    return () => window.clearTimeout(timeout)
  }, [copiedMessage])

  useEffect(() => {
    const justCompleted = wasLoading.current && !isLoading
    wasLoading.current = isLoading
    const latestMessage = messages.at(-1)
    if (!justCompleted || !isOpen || latestMessage?.role !== 'assistant' || !latestMessage.content) return
    setReplyAnnouncement(`ARIA replied: ${latestMessage.content}`)
  }, [messages, isLoading, isOpen])

  const displayMessages = messages.filter(message => message.ts)
  const latest = messages.at(-1)
  const hasConversation = displayMessages.length > 0
  const lastQuestion = messages.filter(message => message.role === 'user').at(-1)?.content ?? ''
  const followUps = latest?.role === 'assistant' && availability === 'online' && !failedQuestion
    ? getFollowUpQuestions(lastQuestion, latest.sources)
    : []
  const starters = getStarterQuestions(pathname)
  const charactersRemaining = MAX_CHAT_INPUT_CHARS - input.length
  const activeStreamTurn = isLoading && latest?.role === 'assistant' && Boolean(latest.content)

  const submitQuestion = (question: string) => {
    setConfirmClear(false)
    void sendMessage(question)
  }

  const copyResponse = async (content: string, timestamp: string) => {
    try {
      await navigator.clipboard.writeText(stripGeneratedRolePrefix(content, 'assistant'))
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
        onClick={openAssistant}
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
          onCancel={event => { event.preventDefault(); requestClose() }}
          onClose={() => {
            if (dialog.current?.open) return
            delete dialog.current?.dataset.closing
            closeChat()
            setExpanded(false)
            setConfirmClear(false)
            launcher.current?.focus()
          }}
          onClick={event => { if (event.target === event.currentTarget) requestClose() }}
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
              <button ref={closeButton} type="button" className="chat-header-btn" onClick={requestClose} aria-label="Close portfolio assistant" title="Close"><X size={18} aria-hidden /></button>
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
                    {starters.map(({ icon, label, question }) => {
                      const Icon = STARTER_ICONS[icon]
                      return (
                        <button key={question} type="button" disabled={isLoading} onClick={() => submitQuestion(question)}>
                          <span className="chat-starter-icon"><Icon size={16} aria-hidden /></span>
                          <span><span className="chat-starter-label">{label}</span><span className="chat-starter-question">{question}</span></span>
                          <ArrowRight className="chat-starter-arrow" size={16} aria-hidden />
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : null}

              <div className="chat-messages">
                {displayMessages.map((message, index) => (
                  <article key={`${message.ts}-${index}`} className={`chat-turn ${message.role === 'user' ? 'chat-turn-user' : ''}`}>
                    <div className="chat-turn-meta">
                      <span className={`chat-avatar ${message.role === 'user' ? 'chat-avatar-user' : ''}`} aria-hidden>{message.role === 'user' ? <User size={12} /> : <Bot size={12} />}</span>
                      <span>{message.role === 'user' ? 'You' : 'ARIA'}</span>
                      <time dateTime={message.ts}>{TIME_FORMAT.format(new Date(message.ts))}</time>
                    </div>
                    <div className={`chat-message ${message.role === 'user' ? 'chat-message-user' : 'chat-message-assistant'}`}>
                      <span className="sr-only">{message.role === 'user' ? 'You: ' : 'ARIA: '}</span>
                      {message.role === 'assistant' ? <ChatMarkdown content={message.content} /> : message.content}
                    </div>
                    {activeStreamTurn && index === displayMessages.length - 1 ? (
                      <p className="chat-stream-status" data-testid="chat-loading">
                        <span className="chat-signal-pulse" aria-hidden><i /><i /><i /></span>
                        {THINKING_COPY.streaming}
                      </p>
                    ) : null}
                    {message.role === 'assistant' && message.reasoning ? (
                      <details className="chat-reasoning">
                        <summary>Reasoning trace</summary>
                        <p className="chat-reasoning-note">Provider-returned reasoning, not verified evidence or hidden instructions.</p>
                        <div className="chat-reasoning-body"><ChatMarkdown content={message.reasoning} /></div>
                      </details>
                    ) : null}
                    {message.role === 'assistant' && message.sources?.length ? (
                      <nav className="chat-sources" aria-label="Related public records">
                        <span>Inspect the public record</span>
                        <ul>
                          {message.sources.map(source => (
                            <li key={source.href}>
                              <span className="chat-source-meta">{sourceKind(source.href)}</span>
                              {source.href.startsWith('/') ? (
                                <Link href={source.href} onClick={requestClose}><span>{source.title}</span><ArrowUpRight size={13} aria-hidden /></Link>
                              ) : (
                                <a href={source.href} target="_blank" rel="noopener noreferrer"><span>{source.title}</span><span className="sr-only"> (opens in a new tab)</span><ArrowUpRight size={13} aria-hidden /></a>
                              )}
                            </li>
                          ))}
                        </ul>
                      </nav>
                    ) : null}
                    {message.role === 'assistant' && !(isLoading && index === displayMessages.length - 1) ? (
                      <div className="chat-message-actions">
                        <button type="button" onClick={() => void copyResponse(message.content, message.ts)} aria-label={`Copy response from ${TIME_FORMAT.format(new Date(message.ts))}`}>
                          {copiedMessage === message.ts ? <Check size={13} aria-hidden /> : <Copy size={13} aria-hidden />}
                          {copiedMessage === message.ts ? 'Copied' : 'Copy response'}
                        </button>
                        {failedQuestion && index === displayMessages.length - 1 ? (
                          <button type="button" className="chat-retry" onClick={retryMessage} aria-label="Retry response"><RotateCcw size={13} aria-hidden />Retry</button>
                        ) : null}
                      </div>
                    ) : null}
                  </article>
                ))}
                {isLoading && !activeStreamTurn ? (
                  <div className="chat-turn chat-thinking-turn" data-testid="chat-loading" data-stage={thinkingPhase}>
                    <div className="chat-turn-meta"><span className="chat-avatar" aria-hidden><Bot size={12} /></span><span>ARIA</span><span>Thinking</span></div>
                    <div className="chat-thinking">
                      <span className="chat-signal-pulse" aria-hidden><i /><i /><i /></span>
                      <span>{THINKING_COPY[thinkingPhase]}</span>
                    </div>
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
                  maxLength={MAX_CHAT_INPUT_CHARS}
                  value={input}
                  onChange={event => setInput(event.target.value)}
                  placeholder="Ask about architecture, evaluation or leadership..."
                  aria-describedby="chat-composer-guidance"
                  onKeyDown={event => {
                    if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return
                    if (event.key === 'ArrowUp' && !input && !isLoading) {
                      event.preventDefault()
                      recallLastPrompt()
                      requestAnimationFrame(() => {
                        const length = inputRef.current?.value.length ?? 0
                        inputRef.current?.setSelectionRange(length, length)
                      })
                      return
                    }
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
              <div data-chat-hint id="chat-composer-guidance" className="chat-composer-meta">
                <span>Enter to send / Shift+Enter for a new line</span>
                <span className={`tnum ${charactersRemaining <= 80 ? 'chat-counter-near-limit' : ''}`}>{charactersRemaining <= 80 ? `${charactersRemaining} characters remaining` : `${input.length}/${MAX_CHAT_INPUT_CHARS}`}</span>
              </div>
            </div>
            <div className="chat-footer-row">
              <p>AI-generated. Verify important details.</p>
              <Link href="/#contact" onClick={() => { trackPortfolioEvent({ name: 'chat_contact_handoff', placement: 'footer' }); requestClose() }} data-chat-link className="chat-direct-link">Talk to Faris<ArrowUpRight size={13} aria-hidden /></Link>
            </div>
            <details className="chat-privacy">
              <summary>Privacy and retention</summary>
              <p>OpenRouter generates replies from recent messages. This browser keeps a copy for up to 30 days, filtered per message. If you include an email, that latest message may be forwarded to Faris. Clear removes this browser copy and its per-tab correlation ID; it does not request deletion of provider-side records. Interaction counts exclude message text and form values.</p>
            </details>
            <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{isLoading ? 'ARIA is preparing a response.' : replyAnnouncement}</p>
            <p className="sr-only" role="status" aria-live="polite">{notice}</p>
          </footer>
        </dialog>
      ) : null}
    </>
  )
}
