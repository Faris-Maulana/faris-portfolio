import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { notifyOwner } from '@/lib/notify'
import { clientKey, rateLimit } from '@/lib/rate-limit'

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(200),
  subject: z.string().max(200).optional(),
  message: z.string().min(10).max(2000),
  // Not constrained here on purpose. A schema rejection returns a 400 that
  // tells a bot exactly which field is the trap; the check below accepts the
  // request and quietly drops it instead.
  honeypot: z.string().max(200).optional(),
})

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

  let data: z.infer<typeof schema>
  try {
    data = schema.parse(await req.json())
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', issues: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Malformed request' }, { status: 400 })
  }

  // Bots fill hidden fields. Accept silently so they do not learn anything.
  if (data.honeypot) return NextResponse.json({ success: true })

  const payload = {
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    subject: data.subject?.trim() || undefined,
    message: data.message.trim(),
  }

  // No database: a message exists only if a channel delivers it. When none is
  // configured the page never calls this route (see deliveryConfigured), so a
  // failure here is a real delivery failure and the visitor gets the fallback.
  const delivery = await notifyOwner({ ...payload, source: 'contact_form' })

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

  return NextResponse.json({
    success: true,
  })
}
