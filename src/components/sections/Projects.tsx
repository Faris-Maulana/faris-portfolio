'use client'

import { useState, useEffect, useRef, type ReactNode } from 'react'
import { ExternalLink, ArrowRight } from 'lucide-react'
import { GithubIcon } from '@/components/ui/Icons'
import type { Project } from '@/lib/supabase/types'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = ['All', 'LLM/AI', 'Data Engineering', 'Security', 'Full Stack'] as const
const categoryAccent: Record<string, string> = {
  'LLM/AI': '#00f5ff',
  'Data Engineering': '#39ff14',
  'Security': '#ff3e3e',
  'Full Stack': '#bf5fff',
  'Analytics': '#ffb800',
}

function TiltCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width  - 0.5
    const y = (e.clientY - rect.top)  / rect.height - 0.5
    el.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`
  }
  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg)'
  }
  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`transition-transform duration-200 ease-out ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  )
}

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [active, setActive] = useState('All')
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  useEffect(() => {
    async function fetchProjects() {
      const supabase = createClient()
      const { data } = await supabase
        .from('projects')
        .select('*')
        .order('sort_order', { ascending: true })
      if (data) setProjects(data as Project[])
      setLoading(false)
    }
    fetchProjects()
  }, [])

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const filtered = active === 'All'
    ? projects
    : projects.filter(p => p.category === active)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    isDragging.current = true
    startX.current = e.pageX - scrollRef.current.offsetLeft
    scrollLeft.current = scrollRef.current.scrollLeft
    scrollRef.current.style.cursor = 'grabbing'
  }
  const handleMouseUp = () => {
    isDragging.current = false
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab'
  }
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX.current) * 1.5
    scrollRef.current.scrollLeft = scrollLeft.current - walk
  }

  return (
    <section id="projects" className="section" ref={sectionRef}>
      <div className="container mb-8">
        <div
          className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <span className="section-heading-tag">{'// PORTFOLIO'}</span>
          <h2 className="section-heading gradient-text">Projects</h2>
          <div className="fiber-line mt-4" />
        </div>

        <div
          className={`flex flex-wrap gap-2 mt-8 transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-4 py-1.5 rounded-full font-mono text-xs border transition-all duration-300 cursor-default ${
                active === cat
                  ? 'bg-cyan/15 border-cyan/40 text-cyan'
                  : 'border-border-glass text-text-muted hover:text-text-secondary hover:border-text-muted'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="container">
          <div className="flex gap-6 overflow-hidden">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex-shrink-0 w-[320px] glass rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-deep rounded w-1/3 mb-3" />
                <div className="h-3 bg-deep rounded w-2/3 mb-2" />
                <div className="h-3 bg-deep rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="container text-center py-12">
          <p className="text-text-muted font-mono text-sm">No projects match the filter.</p>
        </div>
      ) : (
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseUp}
          className="flex gap-6 px-8 overflow-x-auto pb-4 select-none"
          style={{ cursor: 'grab', scrollbarWidth: 'thin', scrollBehavior: 'smooth' }}
        >
          {filtered.map((project) => (
            <div
              key={project.id}
              className="flex-shrink-0 w-[340px] md:w-[380px]"
            >
              <TiltCard>
                <div className="glass rounded-2xl p-5 md:p-6 h-full flex flex-col border border-border-glass hover:border-cyan/20 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span
                      className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                      style={{
                        color: categoryAccent[project.category] || '#4a6272',
                        borderColor: `${categoryAccent[project.category] || '#4a6272'}40`,
                      }}
                    >
                      {project.category}
                    </span>
                    <span className="text-[10px] font-mono text-text-muted">{project.year}</span>
                  </div>

                  <h3 className="font-display font-semibold text-text-primary text-base mb-1">{project.title}</h3>
                  <p className="text-xs text-text-secondary mb-3 line-clamp-2">{project.tagline}</p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.stack.slice(0, 6).map((tech) => (
                      <span key={tech} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-text-muted border border-white/5">
                        {tech}
                      </span>
                    ))}
                    {project.stack.length > 6 && (
                      <span className="text-[9px] font-mono text-text-muted">+{project.stack.length - 6}</span>
                    )}
                  </div>

                  <div className="mt-auto flex items-center gap-3">
                    {project.repo_url && (
                      <a href={project.repo_url} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-cyan transition-colors">
                        <GithubIcon size={14} />
                      </a>
                    )}
                    {project.demo_url && (
                      <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-cyan transition-colors">
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </TiltCard>
            </div>
          ))}
        </div>
      )}

      <div className="container text-center mt-8">
        <a
          href="https://github.com/Faris-Maulana"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs font-mono text-text-secondary hover:text-cyan transition-colors"
        >
          View All on GitHub
          <ArrowRight size={12} />
        </a>
      </div>
    </section>
  )
}
