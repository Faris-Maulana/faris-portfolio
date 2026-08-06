'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  name:    z.string().min(2).max(100),
  email:   z.string().email(),
  subject: z.string().max(200).optional(),
  message: z.string().min(10).max(2000)
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = schema.parse(body)

    const supabase = await createServerSupabaseClient()

    const { error: dbError } = await supabase
      .from('contact_messages')
      .insert({ ...data, source: 'contact_form' })
    if (dbError) throw dbError

    // Save to unified visitor_leads for cross-source tracking
    try {
      await supabase.from('visitor_leads').upsert({
        email:    data.email,
        name:     data.name,
        purpose:  'general',
        source:   'contact_form',
        message:  data.message.slice(0, 500),
        notified: false,
      }, { onConflict: 'email,source', ignoreDuplicates: false })
    } catch {}

    let waSent = false
    let emailSent = false

    if (process.env.FONNTE_TOKEN) {
      try {
        const waRes = await fetch('https://api.fonnte.com/send', {
          method: 'POST',
          headers: { 'Authorization': process.env.FONNTE_TOKEN },
          body: new URLSearchParams({
            target: process.env.OWNER_WA_NUMBER || '6281284049172',
            message: `📬 *New Portfolio Contact*\n\n👤 *Name:* ${data.name}\n📧 *Email:* ${data.email}\n📌 *Subject:* ${data.subject || 'N/A'}\n\n💬 *Message:*\n${data.message}\n\n_Sent from your portfolio contact form_`,
            countryCode: '62'
          })
        })
        waSent = waRes.ok
      } catch {}
    }

    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        const { error } = await resend.emails.send({
          from: 'Portfolio <noreply@farismaulana.dev>',
          to: 'maulanafaris016@gmail.com',
          replyTo: data.email,
          subject: `[Portfolio] ${data.subject || `Message from ${data.name}`}`,
          html: `
            <div style="font-family: 'Space Grotesk', sans-serif; max-width: 600px; background: #020408; color: #e8f4f8; padding: 32px; border-radius: 12px; border: 1px solid rgba(0,245,255,0.1);">
              <h2 style="color: #00f5ff; font-family: monospace;">📬 New Contact Message</h2>
              <table style="width:100%; border-collapse: collapse;">
                <tr><td style="color:#8fa8b8;padding:8px 0;width:80px">From</td><td><strong>${data.name}</strong></td></tr>
                <tr><td style="color:#8fa8b8;padding:8px 0">Email</td><td><a href="mailto:${data.email}" style="color:#00f5ff">${data.email}</a></td></tr>
                <tr><td style="color:#8fa8b8;padding:8px 0">Subject</td><td>${data.subject || '(none)'}</td></tr>
              </table>
              <hr style="border-color: rgba(0,245,255,0.1); margin: 20px 0;">
              <p style="white-space: pre-line; line-height: 1.6">${data.message}</p>
              <hr style="border-color: rgba(0,245,255,0.1); margin: 20px 0;">
              <p style="color:#4a6272; font-size:12px">Hit Reply to respond directly to ${data.name}</p>
            </div>
          `
        })
        emailSent = !error
      } catch {}
    }

    return NextResponse.json({ success: true, waSent, emailSent })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', issues: error.issues }, { status: 400 })
    }
    console.error('Contact error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
