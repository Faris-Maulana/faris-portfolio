'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { path, referrer, sessionId } = await req.json()
    const supabase = await createServerSupabaseClient()
    const country = req.headers.get('x-vercel-ip-country') || null
    const city    = req.headers.get('x-vercel-ip-city') || null

    await supabase.from('page_views').insert({
      path,
      referrer:   referrer || null,
      user_agent: req.headers.get('user-agent'),
      country,
      city,
      session_id: sessionId
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
