'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { NeonBadge } from '@/components/ui/NeonBadge'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import type { BlogPost } from '@/lib/supabase/types'

export function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const { ref, inView, variants, itemVariants } = useScrollAnimation()

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
    <section id="blog" className="section">
      <div className="container" ref={ref}>
        <motion.div variants={variants} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">
            <span className="gradient-text">Blog</span>
          </h2>
          <div className="w-16 h-0.5 bg-cyan/50 mb-12" />
        </motion.div>

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
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={48} className="mx-auto mb-4 text-text-muted" />
            <p className="text-text-muted font-mono text-sm mb-2">Blog posts coming soon</p>
            <p className="text-xs text-text-muted/60">
              Writing about Text2SQL multi-agent architectures, RAG evaluation, and production AI engineering.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <motion.div key={post.id} variants={itemVariants} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
                <GlassCard className="h-full flex flex-col group">
                  {post.tags && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {post.tags.slice(0, 3).map((tag) => (
                        <NeonBadge key={tag} size="sm">{tag}</NeonBadge>
                      ))}
                    </div>
                  )}

                  <h3 className="font-display font-semibold text-sm text-text-primary mb-2 group-hover:text-cyan transition-colors">
                    {post.title}
                  </h3>

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
                    <span className="text-text-muted group-hover:text-cyan transition-colors">
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
