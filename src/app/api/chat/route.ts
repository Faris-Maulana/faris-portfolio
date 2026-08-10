import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { extractEmail, detectIntent } from '@/lib/utils'
import { notifyOwner } from '@/lib/notify'
import { clientKey, rateLimit } from '@/lib/rate-limit'

const SYSTEM_PROMPT = `You are ARIA, the assistant on Faris Maulana's portfolio website.

═══ WHO YOU REPRESENT ═══
Faris Maulana is Manager of AI Engineering at PT Trans Indonesia Superkoridor (TIS).
• Builds production AI systems: Text2SQL multi-agent, RAG pipelines, LangGraph orchestration
• Data engineering: ClickHouse, PostgreSQL, dbt-core, Airflow, Airbyte, medallion DWH
• LLM lifecycle: RLHF, fine-tuning, red-teaming, vLLM inference, guardrails
• Web3 security researcher: Sherlock, Code4rena, Immunefi (Solidity auditing)
• Based in Bogor/Jakarta, Indonesia
• Email: maulanafaris016@gmail.com

═══ KEY PROJECTS ═══
1. Text2SQL Multi-Agent Platform (TIS, 2026): LangGraph + ClickHouse, PP 71/2019 compliant, air-gapped
2. Antigravity RAG System (2025): custom RAGAS-replacement eval, cross-encoder reranking, Groq inference
3. NOC Monitoring AI Agent (2026): FastAPI + LangChain + ClickHouse + WhatsApp (Fonnte) alerting
4. Maritime Fleet Analytics (BLT): PCA + OLS on Danaos ERP, 11.2% TCE yield lift
5. Smart Contract Security Research: reentrancy, access-control, overflow bugs on Sherlock/Code4rena

═══ LEAD CAPTURE RULES (CRITICAL) ═══
Your PRIMARY job beyond answering questions is to capture visitor identity.
On the FIRST or SECOND visitor message, naturally ask for their name and purpose.
Do it conversationally. Weave it into your response rather than asking as a form.

═══ RESPONSE STYLE ═══
• Concise: under 120 words unless a technical deep-dive is explicitly requested
• Warm but precise. You represent a senior engineer, not a chatbot
• For hiring/collab: be enthusiastic and proactive
• For technical: match the visitor's depth level
• End responses with a light CTA: "Anything else I can help you with?"
• Never use em dashes or en dashes. Use a comma, a colon, or a full stop.
  The rest of the site is written that way and your replies sit inside it.
• No bullet lists unless asked. Write in sentences, like a person typing.

═══ WHAT YOU NEVER DO ═══
• Never say you "can't" answer something. Redirect gracefully
• Never fabricate project details or metrics
• Never share home addresses, IDs, or sensitive personal data
• Never claim Faris is unavailable. Always say "he'll respond within 24h"`

/**
 * Ordered fallback chain.
 *
 * Model ids rot. The previous single id, google/gemini-2.0-flash-001, was
 * retired upstream and every chat request had been 404ing ever since with no
 * signal other than visitors being told to email instead. A chain means one
 * retirement degrades to the next option rather than taking the feature down,
 * and the console names whichever one served.
 */
const OPENROUTER_MODELS = [
  process.env.OPENROUTER_MODEL,
  // Instruction-tuned and cheap. Reasoning models are deliberately not first:
  // several of them emit their working out as the reply, which is unusable in
  // a widget a stranger is reading.
  'mistralai/mistral-nemo',
  'google/gemma-4-31b-it:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
].filter((m): m is string => !!m)

/**
 * Last line of defence on reply formatting.
 *
 * Two things a prompt cannot guarantee. Reasoning models sometimes prepend
 * their deliberation, and every model reaches for em dashes no matter how
 * plainly it is told not to. Both are cheap to fix deterministically, so they
 * are fixed here rather than hoped for upstream.
 */
function sanitiseReply(raw: string): string {
  let text = raw.trim()

  // Strip explicit thinking blocks and common leaked-deliberation openers.
  text = text.replace(/<(think|thinking|reasoning)>[\s\S]*?<\/\1>/gi, '').trim()
  const leak = text.match(/^(?:we|i)\s+(?:need to|should|must)\b[\s\S]*?\n\n/i)
  if (leak) text = text.slice(leak[0].length).trim()

  return text
    .replace(/\s*[—–]\s*/g, ', ')
    .replace(/\s+,/g, ',')
    .replace(/,\s*,/g, ',')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

/** 20 turns per 5 minutes is far above human pace and well below abuse. */
const CHAT_LIMIT = 20
const CHAT_WINDOW_MS = 5 * 60 * 1000

/** Hard ceiling on what reaches the model, so nobody can bill us by payload. */
const MAX_TURNS = 30
const MAX_CHARS = 4000

export async function POST(req: NextRequest) {
  const limit = rateLimit(clientKey(req, 'chat'), CHAT_LIMIT, CHAT_WINDOW_MS)
  if (!limit.ok) {
    return NextResponse.json(
      { reply: "You are sending messages faster than I can answer. Give it a moment, or email maulanafaris016@gmail.com and Faris will pick it up directly." },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    )
  }

  try {
    const body = await req.json()
    const sessionId = typeof body?.sessionId === 'string' ? body.sessionId.slice(0, 100) : ''
    const rawMessages = body?.messages

    if (!Array.isArray(rawMessages) || !sessionId) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const messages = rawMessages
      .filter(
        (m: unknown): m is { role: string; content: string } =>
          !!m &&
          typeof m === 'object' &&
          typeof (m as { content?: unknown }).content === 'string' &&
          ((m as { role?: unknown }).role === 'user' ||
            (m as { role?: unknown }).role === 'assistant')
      )
      .slice(-MAX_TURNS)
      .map(m => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }))

    if (messages.length === 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        reply: "ARIA is temporarily offline. Please reach out directly: maulanafaris016@gmail.com."
      })
    }

    const upstream = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://faris-portfolio-red.vercel.app',
      'X-Title': 'Faris Maulana Portfolio - ARIA',
    }

    let aiReply = ''
    let servedBy = ''
    const failures: string[] = []

    for (const model of OPENROUTER_MODELS) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: upstream,
          body: JSON.stringify({
            model,
            max_tokens: 450,
            temperature: 0.7,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              ...messages.map(m => ({ role: m.role, content: m.content })),
            ],
          }),
        })

        if (!response.ok) {
          failures.push(`${model}: HTTP ${response.status}`)
          continue
        }

        const data = await response.json()
        const text: string = data?.choices?.[0]?.message?.content || ''
        if (!text) {
          failures.push(`${model}: empty completion`)
          continue
        }

        aiReply = sanitiseReply(text)
        if (!aiReply) {
          failures.push(`${model}: empty after sanitising`)
          continue
        }
        servedBy = model
        break
      } catch (err) {
        failures.push(`${model}: ${err instanceof Error ? err.message : 'threw'}`)
      }
    }

    if (!aiReply) {
      console.error('[chat] every model failed', failures)
      return NextResponse.json({
        reply: `I cannot reach my model right now. Email ${process.env.OWNER_EMAIL || 'maulanafaris016@gmail.com'} and Faris will answer you directly.`,
      })
    }

    if (failures.length) console.warn('[chat] served by', servedBy, 'after', failures)
    const fullText = messages.map((m: { content: string }) => m.content).join(' ')
    const lastUserMsg = messages.filter((m: { role: string }) => m.role === 'user').slice(-1)[0]?.content || ''
    const extractedEmail   = extractEmail(fullText)
    const detectedIntent   = detectIntent(lastUserMsg)
    const messageCount     = messages.filter((m: { role: string }) => m.role === 'user').length
    const nameMatch = fullText.match(
      /(?:i[''`]?m|my name is|this is|i am|call me)\s+([A-Z][a-z]+(?: [A-Z][a-z]+)?)/
    )
    const extractedName = nameMatch ? nameMatch[1] : undefined
    const companyMatch = fullText.match(
      /(?:from|at|work(?:ing)? (?:at|for)|representing|with)\s+([A-Z][A-Za-z\s&]{2,30}?)(?:\.|,|\s*$|\s+and)/
    )
    const extractedCompany = companyMatch ? companyMatch[1].trim() : undefined

    const supabase = getSupabaseAdmin()
    let visitorEmail: string | undefined
    let visitorName: string | undefined
    let isNewSession = true
    let seenBefore = false

    if (supabase) {
      try {
        const updatedMessages = [
          ...messages,
          { role: 'assistant', content: aiReply, ts: new Date().toISOString() }
        ]

        const { data: existingSession } = await supabase
          .from('chat_sessions')
          .select('id, visitor_email, visitor_name, notified')
          .eq('session_id', sessionId)
          .maybeSingle()

        isNewSession = !existingSession
        visitorEmail = extractedEmail || existingSession?.visitor_email || undefined
        visitorName  = extractedName  || existingSession?.visitor_name  || undefined
        const visitorCompany = extractedCompany || undefined

        await supabase.from('chat_sessions').upsert({
          session_id:      sessionId,
          messages:        updatedMessages,
          visitor_email:   visitorEmail  ?? null,
          visitor_name:    visitorName   ?? null,
          visitor_company: visitorCompany ?? null,
          purpose:         detectedIntent,
          updated_at:      new Date().toISOString(),
        }, { onConflict: 'session_id' })

        if (visitorEmail) {
          await supabase.from('visitor_leads').upsert({
            email:      visitorEmail,
            name:       visitorName    ?? null,
            company:    visitorCompany ?? null,
            purpose:    detectedIntent,
            source:     'chat',
            session_id: sessionId,
            message:    lastUserMsg.slice(0, 500),
            notified:   false,
          }, { onConflict: 'email,source', ignoreDuplicates: false })
        }

        seenBefore = !!existingSession?.visitor_email

        await supabase.from('chat_sessions').update({ notified: true }).eq('session_id', sessionId)
      } catch (dbErr) {
        console.error('Supabase error (non-fatal):', dbErr)
      }
    }

    /* Notification sits outside the storage block on purpose.
       It used to live inside `if (supabase)`, so with the database unreachable
       a visitor could hand over their email in chat and nothing would ever
       reach Faris. Storage is an optimisation here; being told is the point. */
    const shouldNotify =
      isNewSession || (!!extractedEmail && !seenBefore) || messageCount % 8 === 0

    if (shouldNotify) {
      const transcript = [...messages, { role: 'assistant', content: aiReply }]
        .slice(-6)
        .map(m => `${m.role === 'user' ? 'Visitor' : 'ARIA'}: ${m.content}`)
        .join('\n\n')

      await notifyOwner({
        name: visitorName || 'Anonymous visitor',
        email: visitorEmail || 'no-reply@example.com',
        subject: isNewSession
          ? `New visitor in ARIA${visitorName ? `, ${visitorName}` : ''} (${detectedIntent})`
          : `ARIA chat update${visitorName ? ` from ${visitorName}` : ''}, message ${messageCount}`,
        message: transcript,
        source: 'aria_chat',
        meta: {
          Session: sessionId,
          Intent: detectedIntent,
          Company: extractedCompany,
          Messages: messageCount,
        },
      })
    }

    return NextResponse.json({
      reply:        aiReply,
      visitorName,
      visitorEmail: visitorEmail ? '***' : undefined,
    })

  } catch (error) {
    console.error('Chat route error:', error)
    return NextResponse.json({
      reply: "ARIA encountered an error. Please try again or contact Faris at maulanafaris016@gmail.com."
    })
  }
}
