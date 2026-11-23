import { NextResponse, type NextRequest } from 'next/server'
import { contactSchema } from '../../../lib/contact-schema'
import { notifyOwner } from '../../../lib/notify'
import { clientKey, rateLimit } from '../../../lib/rate-limit'
import { readJsonBody } from '../../../lib/request-body'

const MAX_BODY_BYTES = 16 * 1024

/** 5 messages per 10 minutes from one address is generous for a human. */
const LIMIT = 5
const WINDOW_MS = 10 * 60 * 1000

export async function POST(req: NextRequest) {
  const limit = rateLimit(clientKey(req, 'contact'), LIMIT, WINDOW_MS)
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many messages. Try again shortly, or email me directly.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    )
  }

  const body = await readJsonBody(req, MAX_BODY_BYTES)
  if (!body.ok) {
    return NextResponse.json(
      {
        error:
          body.reason === 'too_large'
            ? 'Request is too large.'
            : body.reason === 'unsupported_type'
              ? 'Expected application/json.'
              : 'Malformed request.',
      },
      { status: body.reason === 'too_large' ? 413 : body.reason === 'unsupported_type' ? 415 : 400 }
    )
  }

  const parsed = contactSchema.safeParse(body.data)
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Please check your details and try again.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    )
  }

  const data = parsed.data

  // Bots fill hidden fields. Accept silently so they do not learn anything.
  if (data.honeypot) return NextResponse.json({ success: true })

  // No database: a message exists only if a channel delivers it.
  const delivery = await notifyOwner({
    name: data.name,
    email: data.email.toLowerCase(),
    subject: data.subject || undefined,
    message: data.message,
    source: 'contact_form',
  })

  if (!delivery.notified) {
    console.error('[contact] message not delivered', {
      unconfigured: delivery.unconfigured,
    })
    return NextResponse.json(
      {
        error:
          'Message could not be delivered right now. Please email me directly and it will reach me.',
        fallback: true,
      },
      { status: 503 }
    )
  }

  return NextResponse.json({ success: true })
}
