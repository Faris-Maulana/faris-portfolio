import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { extractEmail, detectIntent } from '@/lib/utils'

const SYSTEM_PROMPT = `You are ARIA — the AI assistant on Faris Maulana's portfolio website.

═══ WHO YOU REPRESENT ═══
Faris Maulana — Manager of AI Engineering at PT Trans Indonesia Superkoridor (TIS).
• Builds production AI systems: Text2SQL multi-agent, RAG pipelines, LangGraph orchestration
• Data engineering: ClickHouse, PostgreSQL, dbt-core, Airflow, Airbyte, medallion DWH
• LLM lifecycle: RLHF, fine-tuning, red-teaming, vLLM inference, guardrails
• Web3 security researcher: Sherlock, Code4rena, Immunefi (Solidity auditing)
• Based in Bogor/Jakarta, Indonesia
• Email: maulanafaris016@gmail.com

═══ KEY PROJECTS ═══
1. Text2SQL Multi-Agent Platform (TIS, 2026) — LangGraph + ClickHouse, PP 71/2019 compliant, air-gapped
2. Antigravity RAG System (2025) — custom RAGAS-replacement eval, cross-encoder reranking, Groq inference
3. NOC Monitoring AI Agent (2026) — FastAPI + LangChain + ClickHouse + WhatsApp (Fonnte) alerting
4. Maritime Fleet Analytics (BLT) — PCA + OLS on Danaos ERP, 11.2% TCE yield lift
5. Smart Contract Security Research — reentrancy, access-control, overflow bugs on Sherlock/Code4rena

═══ LEAD CAPTURE RULES (CRITICAL) ═══
Your PRIMARY job beyond answering questions is to capture visitor identity.
On the FIRST or SECOND visitor message, naturally ask for their name and purpose.
Do it conversationally — weave it into your response, not as a form.

═══ RESPONSE STYLE ═══
• Concise: under 120 words unless a technical deep-dive is explicitly requested
• Warm but precise — you represent a senior engineer, not a chatbot
• For hiring/collab: be enthusiastic and proactive
• For technical: match the visitor's depth level
• End responses with a light CTA: "Anything else I can help you with?"

═══ WHAT YOU NEVER DO ═══
• Never say you "can't" answer something — redirect gracefully
• Never fabricate project details or metrics
• Never share home addresses, IDs, or sensitive personal data
• Never claim Faris is unavailable — always say "he'll respond within 24h"`

const OPENROUTER_MODEL = 'google/gemini-2.0-flash-001'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

async function sendEmail(subject: string, html: string): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) return false
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error } = await resend.emails.send({
      from:    'ARIA <noreply@farismaulana.dev>',
      to:      'maulanafaris016@gmail.com',
      subject,
      html,
    })
    return !error
  } catch { return false }
}

function formatEmailHTML(opts: {
  sessionId: string; isNew: boolean; visitorEmail?: string; visitorName?: string
  visitorCompany?: string; purpose?: string; allMessages: Array<{ role: string; content: string }>
}): string {
  const { sessionId, isNew, visitorEmail, visitorName, visitorCompany, purpose, allMessages } = opts
  const lastFew = allMessages.slice(-6)

  const identityRows = [
    visitorName    ? `<tr><td style="color:#8fa8b8;padding:6px 12px 6px 0;font-size:11px">Name</td><td style="font-size:12px"><strong>${visitorName}</strong></td></tr>` : '',
    visitorEmail   ? `<tr><td style="color:#8fa8b8;padding:6px 12px 6px 0;font-size:11px">Email</td><td style="font-size:12px"><a href="mailto:${visitorEmail}" style="color:#a855f7">${visitorEmail}</a></td></tr>` : '',
    visitorCompany ? `<tr><td style="color:#8fa8b8;padding:6px 12px 6px 0;font-size:11px">Company</td><td style="font-size:12px">${visitorCompany}</td></tr>` : '',
    purpose        ? `<tr><td style="color:#8fa8b8;padding:6px 12px 6px 0;font-size:11px">Intent</td><td style="font-size:12px;text-transform:uppercase;color:#a855f7">${purpose}</td></tr>` : '',
  ].join('')

  const transcript = lastFew.map(m => `
    <div style="margin-bottom:12px">
      <div style="font-size:10px;color:${m.role === 'user' ? '#c084fc' : '#a855f7'};margin-bottom:4px;font-family:monospace">
        ${m.role === 'user' ? '👤 VISITOR' : '🤖 ARIA'}
      </div>
      <div style="background:rgba(12,10,31,0.8);border-left:2px solid ${m.role === 'user' ? '#c084fc' : '#a855f7'};padding:8px 12px;border-radius:0 8px 8px 0;font-size:12px;line-height:1.5">
        ${m.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
      </div>
    </div>
  `).join('')

  return `
    <div style="font-family:'Inter',sans-serif;background:#030309;color:#f3e8ff;padding:32px;max-width:600px;border-radius:12px;border:1px solid rgba(168,85,247,0.1)">
      <h2 style="color:#a855f7;font-size:18px;margin:0 0 4px">${isNew ? '🆕 New Visitor — ARIA' : '💬 ARIA Chat Update'}</h2>
      <p style="color:#6b5ba0;font-size:11px;font-family:monospace;margin:0 0 20px">Session: ${sessionId}</p>
      ${identityRows ? `
        <div style="background:rgba(168,85,247,0.04);border:1px solid rgba(168,85,247,0.1);border-radius:8px;padding:16px;margin-bottom:20px">
          <table>${identityRows}</table>
        </div>
      ` : `<p style="color:#6b5ba0;font-size:12px;margin-bottom:20px">Identity not yet captured</p>`}
      <div style="margin-bottom:20px">
        <h3 style="font-size:12px;color:#c4b5fd;margin:0 0 12px;font-family:monospace;letter-spacing:0.1em">TRANSCRIPT (last ${lastFew.length} messages)</h3>
        ${transcript}
      </div>
      ${visitorEmail ? `
        <a href="mailto:${visitorEmail}" style="display:inline-block;background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.3);color:#c084fc;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:12px;font-family:monospace">
          Reply to ${visitorName || visitorEmail} →
        </a>
      ` : ''}
    </div>
  `
}

export async function POST(req: NextRequest) {
  try {
    const { messages, sessionId } = await req.json()
    if (!messages || !Array.isArray(messages) || !sessionId) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        reply: "ARIA is temporarily offline. Please reach out directly: maulanafaris016@gmail.com."
      })
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer':  process.env.NEXT_PUBLIC_SITE_URL || 'https://farismaulana.dev',
        'X-Title':       'Faris Maulana Portfolio - ARIA',
      },
      body: JSON.stringify({
        model:       OPENROUTER_MODEL,
        max_tokens:  450,
        temperature: 0.7,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
        ],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('OpenRouter error:', response.status, errText)
      return NextResponse.json({
        reply: "I'm having trouble connecting right now. Please email Faris directly at maulanafaris016@gmail.com."
      })
    }

    const data = await response.json()
    const aiReply: string = data.choices?.[0]?.message?.content || ''
    if (!aiReply) {
      return NextResponse.json({ reply: "I couldn't generate a response. Please try again." })
    }

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

        const shouldNotify = isNewSession
          || (extractedEmail && !existingSession?.visitor_email)
          || messageCount % 8 === 0

        if (shouldNotify) {
          const emailHtml = formatEmailHTML({
            sessionId, isNew: isNewSession,
            visitorEmail, visitorName, visitorCompany,
            purpose: detectedIntent,
            allMessages: updatedMessages,
          })

          const emailSubject = isNewSession
            ? `[ARIA] New visitor${visitorName ? ` — ${visitorName}` : ''} (${detectedIntent})`
            : `[ARIA] Chat update${visitorName ? ` from ${visitorName}` : ''} — msg #${messageCount}`

          sendEmail(emailSubject, emailHtml)

          await supabase.from('chat_sessions').update({ notified: true }).eq('session_id', sessionId)
        }
      } catch (dbErr) {
        console.error('Supabase error (non-fatal):', dbErr)
      }
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
