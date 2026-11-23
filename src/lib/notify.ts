import { PALETTE } from './design-tokens'

export interface DeliveryResult {
  email: boolean
  whatsapp: boolean
  /** True when at least one channel actually accepted the message. */
  notified: boolean
  /** Channels that are not configured at all, useful for diagnostics. */
  unconfigured: string[]
}

export const NOTIFICATION_TIMEOUT_MS = 8_000

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Strips controls that could forge headers or WhatsApp line structure. */
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
    [
      'Email',
      `<a href="mailto:${escapeHtml(m.email)}" style="color:${PALETTE.signal};text-decoration:none">${escapeHtml(m.email)}</a>`,
    ],
    ['Subject', escapeHtml(m.subject || '(none)')],
    ['Source', m.source === 'aria_chat' ? 'ARIA chat' : 'Contact form'],
  ]

  for (const [key, value] of Object.entries(m.meta ?? {})) {
    if (value !== undefined && value !== '') {
      rows.push([escapeHtml(key), escapeHtml(String(value))])
    }
  }

  return `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;background:${PALETTE.canvas};color:${PALETTE.ink};padding:32px;border-radius:4px;border:1px solid ${PALETTE.line}">
  <p style="margin:0 0 4px;color:${PALETTE.signal};font-family:ui-monospace,monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase">New message</p>
  <h2 style="margin:0 0 24px;font-size:22px;font-weight:800;letter-spacing:-0.02em">${escapeHtml(m.name)} got in touch</h2>
  <table style="width:100%;border-collapse:collapse;font-size:14px">
    ${rows
      .map(
        ([key, value]) =>
          `<tr><td style="color:${PALETTE.ink3};padding:7px 0;width:88px;vertical-align:top">${key}</td><td style="color:${PALETTE.ink}">${value}</td></tr>`
      )
      .join('')}
  </table>
  <hr style="border:0;border-top:1px solid ${PALETTE.line};margin:22px 0">
  <p style="white-space:pre-line;line-height:1.65;font-size:15px;margin:0">${escapeHtml(m.message)}</p>
  <hr style="border:0;border-top:1px solid ${PALETTE.line};margin:22px 0">
  <p style="color:${PALETTE.ink3};font-size:12px;margin:0">Reply directly to this email to answer ${escapeHtml(m.name)}.</p>
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
    const subject = plain(m.subject || `Message from ${m.name}`).slice(0, 200)
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || 'Portfolio <onboarding@resend.dev>',
        to: [process.env.OWNER_EMAIL || 'maulanafaris016@gmail.com'],
        reply_to: m.email,
        subject: `[Portfolio] ${subject}`,
        html: buildEmailHtml(m),
      }),
      signal: AbortSignal.timeout(NOTIFICATION_TIMEOUT_MS),
      cache: 'no-store',
    })
    if (!res.ok) return false

    const data: unknown = await res.json()
    return Boolean(
      data &&
        typeof data === 'object' &&
        'id' in data &&
        typeof data.id === 'string' &&
        data.id
    )
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
      signal: AbortSignal.timeout(NOTIFICATION_TIMEOUT_MS),
      cache: 'no-store',
    })
    if (!res.ok) return false

    const data: unknown = await res.json()
    return Boolean(
      data && typeof data === 'object' && 'status' in data && data.status === true
    )
  } catch {
    return false
  }
}

/** True when at least one channel can actually deliver a visitor message. */
export function deliveryConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY || process.env.FONNTE_TOKEN)
}

/** Fans out to configured channels. Timeouts and provider failures return false. */
export async function notifyOwner(m: VisitorMessage): Promise<DeliveryResult> {
  const unconfigured: string[] = []
  if (!process.env.RESEND_API_KEY) unconfigured.push('email')
  if (!process.env.FONNTE_TOKEN) unconfigured.push('whatsapp')

  const [email, whatsapp] = await Promise.all([sendResend(m), sendWhatsapp(m)])
  return { email, whatsapp, notified: email || whatsapp, unconfigured }
}
