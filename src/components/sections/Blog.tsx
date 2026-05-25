'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Radio, Waves } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import type { BlogPost } from '@/lib/supabase/types'

// Animated waveform bar chart (simulates signal)
function SignalWave({ color = '#00f5ff', active = false }: { color?: string; active?: boolean }) {
  const bars = [4, 7, 5, 9, 6, 8, 4, 7, 5, 9, 3, 8, 6, 7, 5]
  return (
    <div className="flex items-end gap-0.5 h-6">
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-0.5 rounded-full transition-all"
          style={{
            height: active ? `${h * 3}px` : '4px',
            background: color,
            opacity: active ? 0.6 + (i % 3) * 0.15 : 0.15,
            transitionDelay: `${i * 20}ms`,
            transitionDuration: '400ms',
          }}
        />
      ))}
    </div>
  )
}

// Tag to neon color
const TAG_COLORS: Record<string, string> = {
  'LangGraph': '#00f5ff', 'RAG': '#00f5ff', 'LLM': '#00f5ff',
  'Security': '#ff3e3e', 'Python': '#ffb800', 'Data Engineering': '#39ff14',
}

function PostCard({ post, index }: { post: BlogPost; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const [hovered, setHovered] = useState(false)
  const primaryColor = TAG_COLORS[post.tags?.[0]] || '#00f5ff'

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-cursor="hover"
      className="group glass rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        borderColor: hovered ? primaryColor + '30' : 'rgba(0,245,255,0.07)',
        boxShadow: hovered ? `0 0 40px ${primaryColor}12` : 'none',
      }}
    >
      {/* Transmission header */}
      <div
        className="flex items-center justify-between px-5 py-3 border-b border-border-glass"
        style={{ background: `linear-gradient(135deg, ${primaryColor}08, transparent)` }}
      >
        <div className="flex items-center gap-2">
          <Radio size={10} style={{ color: primaryColor }} />
          <span className="font-mono text-[9px] tracking-[0.2em] text-text-muted uppercase">
            TRANSMISSION &middot; {post.read_time_min}MIN
          </span>
        </div>
        <SignalWave color={primaryColor} active={hovered} />
      </div>

      <div className="p-5">
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.tags?.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded font-mono text-[8px] tracking-wider border"
              style={{
                color: TAG_COLORS[tag] || '#4a6272',
                borderColor: (TAG_COLORS[tag] || '#4a6272') + '30',
                background: (TAG_COLORS[tag] || '#4a6272') + '10',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <h3
          className="font-display font-semibold text-sm text-text-primary mb-2 leading-snug group-hover:text-cyan transition-colors"
          style={{ transitionDuration: '200ms' }}
        >
          {post.title}
        </h3>
        <p className="text-[11px] text-text-muted leading-relaxed mb-4 line-clamp-3">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between">
          <span className="font-mono text-[9px] text-text-muted">
            {post.published_at ? formatDate(post.published_at) : 'DRAFT'}
          </span>
          <a
            href={`/blog/${post.slug}`}
            className="flex items-center gap-1 font-mono text-[10px] transition-colors"
            style={{ color: hovered ? primaryColor : '#4a6272' }}
          >
            READ <ArrowRight size={9} className="group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </motion.article>
  )
}

// Empty state: atmospheric "antenna listening"
function EmptyState() {
  return (
    <div className="text-center py-24">
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="relative inline-flex items-center justify-center mb-8"
      >
        {/* Radar rings */}
        {[1, 2, 3].map(r => (
          <motion.div
            key={r}
            className="absolute rounded-full border border-cyan/20"
            animate={{ scale: [1, 2 + r * 0.5], opacity: [0.4, 0] }}
            transition={{ duration: 2, delay: r * 0.5, repeat: Infinity, ease: 'linear' }}
            style={{ width: 60, height: 60 }}
          />
        ))}
        <Waves size={28} className="text-cyan/40" />
      </motion.div>
      <p className="font-mono text-xs text-cyan/60 tracking-[0.3em] uppercase mb-2">
        SIGNAL INCOMING
      </p>
      <p className="font-mono text-[10px] text-text-muted max-w-xs mx-auto leading-relaxed">
        Transmissions pending on Text2SQL architectures,
        RAG evaluation systems, and production AI engineering.
      </p>
    </div>
  )
}

export function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const sectionRef = useRef<HTMLDivElement>(null)
  const inView = useInView(sectionRef, { once: true })

  useEffect(() => {
    async function loadPosts() {
      const supabase = createClient()
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false })
      if (data) setPosts(data as BlogPost[])
      setLoading(false)
    }
    loadPosts()
  }, [])

  return (
    <section id="blog" className="section" ref={sectionRef}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mb-12"
        >
          <p className="section-heading-tag">// blog.transmissions</p>
          <h2 className="section-heading">
            <span className="gradient-text">Writing</span>
          </h2>
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass rounded-2xl h-56 animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <PostCard key={post.id} post={post} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
