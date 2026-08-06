import { createClient } from '@supabase/supabase-js'
import type { BlogPost } from '@/lib/supabase/types'

/**
 * Published posts, newest first.
 *
 * Deliberately not the cookie-backed server client. Reading `cookies()` opts
 * the whole route out of static rendering, which turned the homepage from a
 * prerendered page with hourly revalidation into a server render on every
 * request. Published posts are public, so a plain anon client is both correct
 * and lets the page stay static.
 *
 * Returns an empty array on any failure rather than throwing. Supabase keys are
 * optional in this project, so a missing env var must degrade to "nothing
 * published yet" instead of taking down the page.
 */
export async function getPosts(limit = 3): Promise<BlogPost[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return []

  try {
    const supabase = createClient(url, key, {
      auth: { persistSession: false },
    })

    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error || !Array.isArray(data)) return []
    return data as BlogPost[]
  } catch {
    return []
  }
}
