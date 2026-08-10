import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
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

/**
 * Writes with the service role rather than the anon key.
 *
 * The anon path depends on an RLS insert policy staying in place. If that
 * policy is ever tightened, every visitor message starts failing silently.
 * The service role is server-only and makes storage independent of RLS.
 */
function storageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

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
  if (data.honeypot) return NextResponse.json({ success: true, stored: true })

  const payload = {
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    subject: data.subject?.trim() || undefined,
    message: data.message.trim(),
  }

  /* Storage and notification run independently and neither can sink the other.
     The old route did `if (dbError) throw dbError`, so a database hiccup threw
     away a message that the email channel could still have delivered. */
  const [stored, delivery] = await Promise.all([
    (async () => {
      const supabase = storageClient()
      if (!supabase) return false
      try {
        const { error } = await supabase
          .from('contact_messages')
          .insert({ ...payload, source: 'contact_form' })
        if (error) return false

        await supabase
          .from('visitor_leads')
          .upsert(
            {
              email: payload.email,
              name: payload.name,
              purpose: 'general',
              source: 'contact_form',
              message: payload.message.slice(0, 500),
              notified: false,
            },
            { onConflict: 'email,source', ignoreDuplicates: false }
          )
          .then(() => undefined, () => undefined)

        return true
      } catch {
        return false
      }
    })(),
    notifyOwner({ ...payload, source: 'contact_form' }),
  ])

  // Only a total loss is an error. If either side accepted the message, the
  // visitor was heard and should be told so.
  if (!stored && !delivery.notified) {
    console.error('[contact] message not persisted and not delivered', {
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
    stored,
    notified: delivery.notified,
  })
}
