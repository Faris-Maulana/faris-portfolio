'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, ArrowRight } from 'lucide-react'
import { GithubIcon } from '@/components/ui/Icons'
import { GlassCard } from '@/components/ui/GlassCard'
import { NeonBadge } from '@/components/ui/NeonBadge'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { cn } from '@/lib/utils'
import type { Project } from '@/lib/supabase/types'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = ['All', 'LLM/AI', 'Data Engineering', 'Security', 'Full Stack'] as const

const categoryColor: Record<string, string> = {
  'LLM/AI': 'cyan',
  'Data Engineering': 'green',
  'Security': 'red',
  'Full Stack': 'violet',
  'Analytics': 'amber',
  'Other': 'muted',
}

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [active, setActive] = useState('All')
  const [loading, setLoading] = useState(true)
  const { ref, inView, variants, itemVariants } = useScrollAnimation()

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

  const filtered = active === 'All'
    ? projects
    : projects.filter(p => p.category === active)

  const featured = filtered.filter(p => p.featured)
  const normal = filtered.filter(p => !p.featured)

  return (
    <section id="projects" className="section">
      <div className="container" ref={ref}>
        <motion.div variants={variants} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">
            <span className="gradient-text">Projects</span>
          </h2>
          <div className="w-16 h-0.5 bg-cyan/50 mb-8" />
        </motion.div>

        {/* Filters */}
        <motion.div variants={variants} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={cn(
                'px-4 py-1.5 rounded-full font-mono text-xs border transition-all duration-300',
                active === cat
                  ? 'bg-cyan/15 border-cyan/40 text-cyan'
                  : 'bg-transparent border-border-glass text-text-muted hover:text-text-secondary hover:border-text-muted'
              )}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {loading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-deep rounded w-1/3 mb-3" />
                <div className="h-3 bg-deep rounded w-2/3 mb-2" />
                <div className="h-3 bg-deep rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Featured: bento grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {featured.map((project, i) => (
                <motion.div
                  key={project.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate={inView ? 'visible' : 'hidden'}
                  className={cn(i === 0 && 'md:col-span-2')}
                >
                  <ProjectCard project={project} large={i === 0} />
                </motion.div>
              ))}
            </div>

            {/* Normal */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {normal.map((project) => (
                <motion.div
                  key={project.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate={inView ? 'visible' : 'hidden'}
                >
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* View all CTA */}
        <motion.div
          variants={variants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="text-center mt-10"
        >
          <a
            href="https://github.com/Faris-Maulana"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-mono text-text-secondary hover:text-cyan transition-colors"
          >
            View All on GitHub
            <ArrowRight size={14} />
          </a>
        </motion.div>
      </div>
    </section>
  )
}

function ProjectCard({ project, large }: { project: Project; large?: boolean }) {
  return (
    <GlassCard className={cn('h-full flex flex-col', large && 'md:p-8')}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <NeonBadge color={categoryColor[project.category] || 'muted'}>
          {project.category}
        </NeonBadge>
        <span className="text-[10px] font-mono text-text-muted">{project.year}</span>
      </div>

      <h3 className={cn('font-display font-semibold text-text-primary mb-1', large ? 'text-xl' : 'text-base')}>
        {project.title}
      </h3>
      <p className="text-sm text-text-secondary mb-3 line-clamp-2">{project.tagline}</p>

      {large && (
        <p className="text-xs text-text-muted mb-4 leading-relaxed line-clamp-3">{project.description}</p>
      )}

      <div className="flex flex-wrap gap-1.5 mb-4">
        {project.stack.slice(0, large ? 8 : 5).map((tech) => (
          <NeonBadge key={tech} size="sm">{tech}</NeonBadge>
        ))}
      </div>

      <div className="mt-auto flex items-center gap-3">
        {project.repo_url && (
            <a
              href={project.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-cyan transition-colors"
            >
              <GithubIcon size={16} />
            </a>
        )}
        {project.demo_url && (
          <a
            href={project.demo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted hover:text-cyan transition-colors"
          >
            <ExternalLink size={16} />
          </a>
        )}
      </div>
    </GlassCard>
  )
}
