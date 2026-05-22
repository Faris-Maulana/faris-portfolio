'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { NeonBadge } from '@/components/ui/NeonBadge'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import type { BlogPost } from '@/lib/supabase/types'

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const supabase = createClient()
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false })
      if (data) setPosts(data as BlogPost[])
      setLoading(false)
    }
    fetch()
  }, [])

  return (
    <div className="pt-24 pb-16">
      <div className="container">
        <h1 className="text-3xl md:text-5xl font-display font-bold mb-2">
          <span className="gradient-text">Blog</span>
        </h1>
        <p className="text-text-muted text-sm font-mono mb-12">Thoughts on AI engineering, RAG, and production systems</p>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-deep rounded w-2/3 mb-3" />
                <div className="h-3 bg-deep rounded w-full mb-2" />
                <div className="h-3 bg-deep rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <GlassCard key={post.id} className="h-full flex flex-col group">
                {post.tags && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {post.tags.slice(0, 3).map((tag) => (
                      <NeonBadge key={tag} size="sm">{tag}</NeonBadge>
                    ))}
                  </div>
                )}

                <h2 className="font-display font-semibold text-sm text-text-primary mb-2 group-hover:text-cyan transition-colors">
                  {post.title}
                </h2>

                {post.excerpt && (
                  <p className="text-xs text-text-secondary mb-4 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                )}

                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[10px] font-mono text-text-muted">
                    {post.published_at && (
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {formatDate(post.published_at)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {post.read_time_min} min
                    </span>
                  </div>
                  <ArrowRight size={14} className="text-text-muted group-hover:text-cyan transition-colors" />
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
