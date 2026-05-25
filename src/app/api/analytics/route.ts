import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''
    let body: Record<string, unknown>

    if (contentType.includes('application/json')) {
      body = await req.json()
    } else {
      const text = await req.text()
      try { body = JSON.parse(text) } catch { return NextResponse.json({ ok: false }) }
    }

    const { path, referrer, sessionId, durationSec, isUnload } = body as {
      path: string; referrer?: string; sessionId: string
      durationSec?: number; isUnload?: boolean
    }

    if (!path || !sessionId) return NextResponse.json({ ok: false })

    const supabase = await createServerSupabaseClient()
    const country  = req.headers.get('x-vercel-ip-country') || null
    const city     = req.headers.get('x-vercel-ip-city') || null

    const { count } = await supabase
      .from('page_views')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', sessionId)
      .gte('created_at', new Date(Date.now() - 86400000).toISOString())

    const isNewSession = (count ?? 0) === 0

    if (isUnload && durationSec) {
      await supabase
        .from('page_views')
        .update({ duration_sec: durationSec })
        .eq('session_id', sessionId)
        .eq('path', path)
        .order('created_at', { ascending: false })
        .limit(1)
    } else {
      await supabase.from('page_views').insert({
        path,
        referrer:       referrer || null,
        user_agent:     req.headers.get('user-agent'),
        country,
        city,
        session_id:     sessionId,
        duration_sec:   durationSec ?? null,
        is_new_session: isNewSession,
      })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Analytics error:', e)
    return NextResponse.json({ ok: false })
  }
}
