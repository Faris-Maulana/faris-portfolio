import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { Calendar, Clock } from 'lucide-react'

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!post) notFound()

  return (
    <div className="pt-24 pb-16">
      <div className="container max-w-3xl">
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags?.map((tag: string) => (
            <span key={tag} className="px-2.5 py-0.5 rounded-full border border-cyan/20 text-cyan text-[10px] font-mono">
              {tag}
            </span>
          ))}
        </div>

        <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-4">{post.title}</h1>

        <div className="flex items-center gap-4 text-xs font-mono text-text-muted mb-8">
          {post.published_at && (
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {formatDate(post.published_at)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {post.read_time_min} min read
          </span>
        </div>

        {post.excerpt && (
          <p className="text-text-secondary text-sm mb-8 leading-relaxed italic">{post.excerpt}</p>
        )}

        <div className="prose prose-invert max-w-none">
          {post.content ? (
            <div className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">{post.content}</div>
          ) : (
            <p className="text-text-muted font-mono text-sm">Full content coming soon.</p>
          )}
        </div>
      </div>
    </div>
  )
}
