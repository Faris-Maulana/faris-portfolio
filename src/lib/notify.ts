/**
 * Outbound notification for anything a visitor sends.
 *
 * One module so every path (contact form, chat lead capture) escapes the same
 * way, fans out to the same channels, and reports the same shape. Nothing here
 * throws: a message that reached storage but failed to notify is still a
 * message, and a caller should never 500 because an email provider is down.
 */

export interface DeliveryResult {
  email: boolean
  whatsapp: boolean
  /** True when at least one channel actually accepted the message. */
  notified: boolean
  /** Channels that are not configured at all, useful for diagnostics. */
  unconfigured: string[]
}

/**
 * Escapes text before it goes anywhere near an HTML email body.
 *
 * The previous templates interpolated visitor input raw, which let anyone put
 * arbitrary markup into the inbox. Names and messages are attacker-controlled
 * by definition here, since the whole point is that strangers can write in.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Strips control characters that would let input forge WhatsApp formatting. */
function plain(value: string): string {
  return value.replace(/[\u0000-\u001F\u007F]/g, ' ').trim()
}

export interface VisitorMessage {
  name: string
  email: string
  subject?: string
  message: string
  source: 'contact_form' | 'aria_chat'
  meta?: Record<string, string | number | undefined>
}

function buildEmailHtml(m: VisitorMessage): string {
  const rows: Array<[string, string]> = [
    ['From', escapeHtml(m.name)],
    ['Email', `<a href="mailto:${escapeHtml(m.email)}" style="color:#5CF2C0;text-decoration:none">${escapeHtml(m.email)}</a>`],
    ['Subject', escapeHtml(m.subject || '(none)')],
    ['Source', m.source === 'aria_chat' ? 'ARIA chat' : 'Contact form'],
  ]

  for (const [k, v] of Object.entries(m.meta ?? {})) {
    if (v !== undefined && v !== '') rows.push([escapeHtml(k), escapeHtml(String(v))])
  }

  return `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;background:#07080A;color:#ECEEF1;padding:32px;border-radius:14px;border:1px solid rgba(255,255,255,0.09)">
  <p style="margin:0 0 4px;color:#5CF2C0;font-family:ui-monospace,monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase">New message</p>
  <h2 style="margin:0 0 24px;font-size:22px;font-weight:800;letter-spacing:-0.02em">${escapeHtml(m.name)} got in touch</h2>
  <table style="width:100%;border-collapse:collapse;font-size:14px">
    ${rows
      .map(
        ([k, v]) =>
          `<tr><td style="color:#6C7684;padding:7px 0;width:88px;vertical-align:top">${k}</td><td style="color:#ECEEF1">${v}</td></tr>`
      )
      .join('')}
  </table>
  <hr style="border:0;border-top:1px solid rgba(255,255,255,0.09);margin:22px 0">
  <p style="white-space:pre-line;line-height:1.65;font-size:15px;margin:0">${escapeHtml(m.message)}</p>
  <hr style="border:0;border-top:1px solid rgba(255,255,255,0.09);margin:22px 0">
  <p style="color:#454D59;font-size:12px;margin:0">Reply directly to this email to answer ${escapeHtml(m.name)}.</p>
</div>`.trim()
}

function buildWhatsappText(m: VisitorMessage): string {
  const label = m.source === 'aria_chat' ? 'ARIA chat' : 'Contact form'
  return [
    `*New message* (${label})`,
    '',
    `*Name:* ${plain(m.name)}`,
    `*Email:* ${plain(m.email)}`,
    m.subject ? `*Subject:* ${plain(m.subject)}` : null,
    '',
    plain(m.message).slice(0, 900),
  ]
    .filter(Boolean)
    .join('\n')
}

async function sendResend(m: VisitorMessage): Promise<boolean> {
  const key = process.env.RESEND_API_KEY
  if (!key) return false
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(key)
    const { error } = await resend.emails.send({
      // onboarding@resend.dev works on a fresh account with no verified
      // domain, so notifications start flowing the moment a key exists.
      from: process.env.RESEND_FROM || 'Portfolio <onboarding@resend.dev>',
      to: process.env.OWNER_EMAIL || 'maulanafaris016@gmail.com',
      replyTo: m.email,
      subject: `[Portfolio] ${m.subject || `Message from ${m.name}`}`,
      html: buildEmailHtml(m),
    })
    return !error
  } catch {
    return false
  }
}

async function sendWhatsapp(m: VisitorMessage): Promise<boolean> {
  const token = process.env.FONNTE_TOKEN
  if (!token) return false
  try {
    const res = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: { Authorization: token },
      body: new URLSearchParams({
        target: process.env.OWNER_WA_NUMBER || '6281284049172',
        message: buildWhatsappText(m),
        countryCode: '62',
      }),
    })
    return res.ok
  } catch {
    return false
  }
}

/** Fans out to every configured channel. Never throws. */
export async function notifyOwner(m: VisitorMessage): Promise<DeliveryResult> {
  const unconfigured: string[] = []
  if (!process.env.RESEND_API_KEY) unconfigured.push('email')
  if (!process.env.FONNTE_TOKEN) unconfigured.push('whatsapp')

  const [email, whatsapp] = await Promise.all([sendResend(m), sendWhatsapp(m)])

  return { email, whatsapp, notified: email || whatsapp, unconfigured }
}
