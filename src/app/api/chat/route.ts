'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const SYSTEM_PROMPT = `You are ARIA — Faris Maulana's AI portfolio assistant.

ABOUT FARIS:
- Manager of AI Engineering at PT Trans Indonesia Superkoridor (TIS), building the company's data & AI platform from scratch
- AI Engineer & Researcher specializing in: LLM lifecycle, RAG systems, RLHF, LangGraph multi-agent systems, data engineering
- Stack: Python, LangChain, LangGraph, vLLM, PostgreSQL, ClickHouse, dbt-core, Airflow, Docker
- Web3 smart contract security researcher (Sherlock, Code4rena, Immunefi)
- Based in Bogor/Jakarta, Indonesia
- Contact: maulanafaris016@gmail.com | +62-812-8404-9172 | linkedin.com/in/faris-maulana-0035b914a

PERSONALITY: Professional but warm. Technical depth when needed. Concise answers. You represent Faris well.

KEY PROJECTS:
1. Text2SQL Multi-Agent Platform (TIS, 2026) - LangGraph + ClickHouse + PP 71/2019 compliant air-gapped deployment
2. Antigravity RAG System - custom RAGAS-replacement evaluation, cross-encoder reranking
3. NOC Monitoring AI Agent - FastAPI + LangChain + WhatsApp integration
4. Smart Contract Security Research - Sherlock, Code4rena, Immunefi

INSTRUCTIONS:
- For hiring inquiries: collect name, company, role, ask them to send details to maulanafaris016@gmail.com
- For collaboration: be enthusiastic, ask for their project scope, suggest connecting on LinkedIn
- For technical questions: answer with Faris's expertise level — peer-level depth
- If someone wants to connect: encourage email OR WhatsApp +62-812-8404-9172
- Keep responses under 150 words unless a technical deep-dive is explicitly requested
- Always offer to help with follow-up questions
- NEVER share personal addresses or sensitive info beyond what's listed above`

async function sendToWhatsApp(name: string, message: string, sessionId: string) {
  if (!process.env.FONNTE_TOKEN) return false
  try {
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: { 'Authorization': process.env.FONNTE_TOKEN },
      body: new URLSearchParams({
        target: process.env.OWNER_WA_NUMBER || '6281284049172',
        message: `🤖 *ARIA Chat Alert*\n\nSession: ${sessionId.slice(0,8)}\nFrom visitor: ${name}\n\n💬 *Message:*\n${message}\n\n_Reply at your portfolio dashboard_`,
        countryCode: '62'
      })
    })
    return response.ok
  } catch { return false }
}

async function sendEmailNotification(visitorMessage: string, aiReply: string, sessionId: string) {
  if (!process.env.RESEND_API_KEY) return false
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'ARIA <noreply@farismaulana.dev>',
      to: 'maulanafaris016@gmail.com',
      subject: `[Portfolio Chat] New message — session ${sessionId.slice(0,8)}`,
      html: `
        <div style="font-family: monospace; background: #020408; color: #e8f4f8; padding: 24px; border-radius: 8px;">
          <h2 style="color: #00f5ff;">🤖 ARIA — New Chat Conversation</h2>
          <p><strong>Session:</strong> ${sessionId}</p>
          <hr style="border-color: #0f1a24;">
          <p><strong style="color: #00f5ff;">Visitor:</strong><br>${visitorMessage}</p>
          <p><strong style="color: #39ff14;">ARIA replied:</strong><br>${aiReply}</p>
          <hr style="border-color: #0f1a24;">
          <p style="color: #4a6272; font-size: 12px;">Manage conversations at your portfolio dashboard</p>
        </div>
      `
    })
    return true
  } catch { return false }
}

export async function POST(req: NextRequest) {
  try {
    const { messages, sessionId } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        reply: "ARIA is currently offline. Faris's AI assistant API key is not configured. Please reach out directly via email at maulanafaris016@gmail.com or WhatsApp at +62-812-8404-9172."
      })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content
        }))
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Anthropic API error:', response.status, errorText)
      return NextResponse.json({ error: 'AI service error' }, { status: 500 })
    }

    const data = await response.json()
    const aiContent = data.content[0]
    if (aiContent.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response type' }, { status: 500 })
    }
    const aiReply = aiContent.text

    const supabase = await createServerSupabaseClient()
    const lastUserMessage = messages[messages.length - 1]?.content || ''
    const updatedMessages = [...messages, { role: 'assistant', content: aiReply, ts: new Date().toISOString() }]

    await supabase
      .from('chat_sessions')
      .upsert({
        session_id: sessionId,
        messages: updatedMessages,
        updated_at: new Date().toISOString()
      }, { onConflict: 'session_id' })

    const messageCount = messages.filter((m: { role: string }) => m.role === 'user').length
    if (messageCount === 1 || messageCount % 5 === 0) {
      await Promise.all([
        sendToWhatsApp('Visitor', lastUserMessage, sessionId),
        sendEmailNotification(lastUserMessage, aiReply, sessionId)
      ])
    }

    return NextResponse.json({ reply: aiReply })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ reply: "ARIA encountered an error. Please try again or contact Faris directly at maulanafaris016@gmail.com." })
  }
}
