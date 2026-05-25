import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()

    const [analyticsRes, leadsRes, chatRes, dailyRes] = await Promise.all([
      supabase.from('analytics_summary').select('*').single(),
      supabase.from('leads_summary').select('*').single(),
      supabase.from('chat_sessions').select('id', { count: 'exact', head: true }),
      supabase.from('daily_visitors').select('visit_date,unique_visitors,page_views').limit(30),
    ])

    return NextResponse.json({
      analytics: analyticsRes.data,
      leads:     leadsRes.data,
      chats:     chatRes.count ?? 0,
      daily:     dailyRes.data ?? [],
      generated: new Date().toISOString(),
    })
  } catch (e) {
    console.error('Stats error:', e)
    return NextResponse.json({ error: 'Stats unavailable' }, { status: 500 })
  }
}
