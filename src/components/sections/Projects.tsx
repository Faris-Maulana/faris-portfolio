'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useInView } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { GithubIcon } from '@/components/ui/Icons'
import { NeonBadge } from '@/components/ui/NeonBadge'
import type { Project } from '@/lib/supabase/types'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = ['All', 'LLM/AI', 'Data Engineering', 'Security', 'Full Stack'] as const
const CATEGORY_COLOR: Record<string, string> = {
  'LLM/AI': 'cyan', 'Data Engineering': 'green',
  'Security': 'red', 'Full Stack': 'violet', 'Analytics': 'amber',
}

function hexToRgb(hex: string): string {
  if (!hex.startsWith('#')) return '0,245,255'
  const r = parseInt(hex.slice(1,3),16)
  const g = parseInt(hex.slice(3,5),16)
  const b = parseInt(hex.slice(5,7),16)
  return `${r},${g},${b}`
}

function TiltCard({ project, index }: { project: Project; index: number }) {
  const ref  = useRef<HTMLDivElement>(null)
  const color = CATEGORY_COLOR[project.category] || 'muted'
  const neonMap: Record<string, string> = {
    cyan: '#00f5ff', green: '#39ff14', red: '#ff3e3e', violet: '#bf5fff', amber: '#ffb800', muted: '#4a6272'
  }
  const neon = neonMap[color] || '#4a6272'

  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const sRotX = useSpring(rotateX, { stiffness: 300, damping: 30 })
  const sRotY = useSpring(rotateY, { stiffness: 300, damping: 30 })

  const glowX = useTransform(sRotY, [-15, 15], ['0%', '100%'])
  const glowY = useTransform(sRotX, [-15, 15], ['0%', '100%'])
  const glowBackground = useTransform(
    [glowX, glowY],
    ([x, y]: string[]) => `radial-gradient(circle at ${x} ${y}, rgba(${hexToRgb(neon)},0.08), transparent 60%)`
  )

  const handleMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const px = ((e.clientX - rect.left) / rect.width - 0.5) * 2
    const py = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    rotateY.set(px * 12)
    rotateX.set(-py * 8)
  }
  const handleLeave = () => { rotateX.set(0); rotateY.set(0) }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.22,1,0.36,1] }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        rotateX: sRotX,
        rotateY: sRotY,
        transformStyle: 'preserve-3d',
        perspective: '1000px',
        minWidth: '340px',
        maxWidth: '380px',
        flexShrink: 0,
      }}
      className="cursor-pointer"
    >
      <div
        className="glass rounded-2xl overflow-hidden h-full flex flex-col"
        style={{
          border: `1px solid rgba(${hexToRgb(neon)},0.12)`,
        }}
        data-cursor="hover"
      >
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none z-10 opacity-0 hover:opacity-100 transition-opacity"
          style={{
            background: glowBackground,
          }}
        />

        <div className="p-6 flex flex-col flex-1 relative z-20">
          <div className="flex items-start justify-between mb-4">
            <NeonBadge color={color}>{project.category}</NeonBadge>
            <span className="font-mono text-[10px] text-text-muted glass px-2 py-0.5 rounded">{project.year}</span>
          </div>

          <h3
            className="font-display font-semibold text-base mb-1.5 leading-snug"
            style={{ color: neon }}
          >
            {project.title}
          </h3>
          <p className="text-text-secondary text-xs leading-relaxed mb-3 line-clamp-2">{project.tagline}</p>
          <p className="text-text-muted text-[11px] leading-relaxed mb-4 line-clamp-3">{project.description}</p>

          <div className="flex flex-wrap gap-1.5 mt-auto mb-4">
            {project.stack.slice(0, 6).map(tech => (
              <NeonBadge key={tech} size="sm">{tech}</NeonBadge>
            ))}
            {project.stack.length > 6 && (
              <span className="text-[10px] font-mono text-text-muted px-1">+{project.stack.length - 6}</span>
            )}
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-border-glass">
            {project.repo_url && (
              <a href={project.repo_url} target="_blank" rel="noopener noreferrer"
                className="text-text-muted hover:text-monarch transition-colors" data-cursor="hover">
                <GithubIcon size={15} />
              </a>
            )}
            {project.demo_url && (
              <a href={project.demo_url} target="_blank" rel="noopener noreferrer"
                className="text-text-muted hover:text-monarch transition-colors" data-cursor="hover">
                <ExternalLink size={15} />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [active, setActive] = useState('All')
  const [loading, setLoading] = useState(true)
  const trackRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)
  const sectionRef = useRef<HTMLDivElement>(null)
  const inView = useInView(sectionRef, { once: true })

  useEffect(() => {
    createClient()
      .from('projects').select('*').order('sort_order')
      .then(({ data }) => { if (data) setProjects(data as Project[]); setLoading(false) })
  }, [])

  const filtered = active === 'All' ? projects : projects.filter(p => p.category === active)

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const down = (e: MouseEvent) => {
      isDragging.current = true; startX.current = e.pageX - el.offsetLeft
      scrollLeft.current = el.scrollLeft; el.style.cursor = 'grabbing'
    }
    const up   = () => { isDragging.current = false; el.style.cursor = 'grab' }
    const move = (e: MouseEvent) => {
      if (!isDragging.current) return
      e.preventDefault()
      const x    = e.pageX - el.offsetLeft
      const walk = (x - startX.current) * 1.2
      el.scrollLeft = scrollLeft.current - walk
    }
    el.addEventListener('mousedown', down)
    window.addEventListener('mouseup', up)
    el.addEventListener('mousemove', move)
    return () => {
      el.removeEventListener('mousedown', down)
      window.removeEventListener('mouseup', up)
      el.removeEventListener('mousemove', move)
    }
  }, [])

  return (
    <section id="projects" className="section overflow-hidden" ref={sectionRef}>
      <div className="container mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mb-10"
        >
          <p className="section-heading-tag">{'// INVENTORY'}</p>
          <h2 className="section-heading mb-6">
            <span className="gradient-monarch">Projects</span>
          </h2>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                data-cursor="hover"
                className={`px-4 py-1.5 rounded-full font-mono text-xs border transition-all duration-300 ${
                  active === cat
                    ? 'bg-monarch/12 border-monarch/40 text-monarch'
                    : 'bg-transparent border-border-shadow text-text-muted hover:text-text-secondary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="flex items-center gap-2 mb-4 md:mb-6 text-text-muted font-mono text-[10px] tracking-widest uppercase md:hidden">
          <span>← Swipe to explore →</span>
          <motion.span
            animate={{ x: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="text-system-blue"
          >
            ▸
          </motion.span>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex gap-6 overflow-x-auto pb-8 select-none"
        style={{
          paddingLeft: 'max(28px, calc((100vw - 1200px) / 2 + 28px))',
          paddingRight: 'max(28px, calc((100vw - 1200px) / 2 + 28px))',
          scrollbarWidth: 'none',
          cursor: 'grab',
          perspective: '1200px',
        }}
      >
        {loading
          ? Array(4).fill(0).map((_, i) => (
              <div key={i} className="glass rounded-2xl animate-pulse flex-shrink-0"
                style={{ minWidth: 340, height: 360 }} />
            ))
          : filtered.map((p, i) => <TiltCard key={p.id} project={p} index={i} />)
        }
      </div>

      <div className="container mt-4 flex items-center justify-between">
        <p className="text-[10px] font-mono text-text-muted tracking-wider">← drag to explore →</p>
        <a
          href="https://github.com/Faris-Maulana"
          target="_blank" rel="noopener noreferrer"
          data-cursor="hover"
          className="text-xs font-mono text-text-muted hover:text-monarch transition-colors flex items-center gap-1"
        >
          View all on GitHub <GithubIcon size={12} />
        </a>
      </div>
    </section>
  )
}
