'use client'

import { useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { NeonBadge } from '@/components/ui/NeonBadge'
import { EXPERIENCES } from '@/lib/constants'

const accentNeon: Record<string, string> = {
  cyan:   '#00f5ff',
  green:  '#39ff14',
  amber:  '#ffb800',
  violet: '#bf5fff',
  red:    '#ff3e3e',
  muted:  '#4a6272',
}

const statusLabel: Record<string, string> = {
  cyan:   'ACTIVE',
  green:  'ACTIVE',
  amber:  'COMPLETED',
  violet: 'COMPLETED',
  red:    'ACTIVE',
  muted:  'ARCHIVED',
}

function hashFromString(s: string): string {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return Math.abs(h).toString(16).slice(0, 7)
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1,3), 16)
  const g = parseInt(hex.slice(3,5), 16)
  const b = parseInt(hex.slice(5,7), 16)
  return `${r},${g},${b}`
}

function ExperienceEntry({ exp, index }: { exp: typeof EXPERIENCES[number]; index: number }) {
  const ref  = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const color = accentNeon[exp.accent] || '#4a6272'
  const hash  = hashFromString(exp.company + exp.role)
  const isActive = exp.accent === 'cyan' || exp.accent === 'green'

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -24 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22,1,0.36,1] }}
      className="relative pl-16 group"
    >
      <div className="absolute left-0 top-5 flex flex-col items-center">
        <div
          className="w-4 h-4 rounded-full border-2 z-10 transition-all duration-500 group-hover:scale-150"
          style={{
            borderColor: color,
            backgroundColor: isActive ? color : 'transparent',
            boxShadow: isActive ? `0 0 12px ${color}` : 'none',
          }}
        />
      </div>

      <div
        className="glass rounded-2xl overflow-hidden transition-all duration-300 group-hover:border-opacity-50 mb-8"
        style={{ borderLeftColor: color, borderLeftWidth: '1px' }}
      >
        <div
          className="flex items-center justify-between px-5 py-3 border-b border-border-glass"
          style={{ background: `linear-gradient(135deg, rgba(${hexToRgb(color)},0.06), transparent)` }}
        >
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-neon-red/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green/60" />
            </div>
            <span className="font-mono text-[10px] text-text-muted tracking-wider">
              deploy/{exp.company.toLowerCase().replace(/\s/g, '-').replace(/[^a-z0-9-]/g, '')}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="font-mono text-[9px] tracking-widest px-2 py-0.5 rounded"
              style={{
                color,
                background: `rgba(${hexToRgb(color)},0.1)`,
                border: `1px solid rgba(${hexToRgb(color)},0.2)`,
              }}
            >
              {statusLabel[exp.accent]}
            </span>
            <span className="font-mono text-[9px] text-text-muted">#{hash}</span>
          </div>
        </div>

        <div className="p-5">
          <div className="mb-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h3
                  className="text-lg font-display font-semibold mb-0.5"
                  style={{ color }}
                >
                  {exp.role}
                </h3>
                <p className="text-sm text-text-secondary">{exp.company}</p>
              </div>
              <span className="font-mono text-xs text-text-muted glass px-3 py-1.5 rounded-full self-start whitespace-nowrap">
                {exp.period}
              </span>
            </div>
          </div>

          <div className="space-y-2 mb-5 font-mono text-xs">
            {exp.bullets.map((bullet, j) => (
              <div key={j} className="flex gap-2 text-text-secondary">
                <span style={{ color }} className="opacity-60 select-none flex-shrink-0 mt-0.5">
                  {j === 0 ? '▶' : '·'}
                </span>
                <span className="leading-relaxed">{bullet}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {exp.stack.map((tech) => (
              <NeonBadge key={tech} color={exp.accent}>{tech}</NeonBadge>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function Experience() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const lineRef    = useRef<HTMLDivElement>(null)
  const inView = useInView(sectionRef, { once: true })

  useEffect(() => {
    if (!lineRef.current || !inView) return
    lineRef.current.style.transition = `height 2s cubic-bezier(0.22,1,0.36,1) 0.3s`
    lineRef.current.style.height = '100%'
  }, [inView])

  return (
    <section id="experience" className="section">
      <div className="container" ref={sectionRef}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="section-heading-tag">{'// chronicle.of.conquest'}</p>
          <h2 className="section-heading">
            <span className="gradient-monarch">Experience</span>
          </h2>
        </motion.div>

        <div className="relative">
          <div className="absolute left-[7px] top-0 w-px overflow-hidden" style={{ height: '100%' }}>
            <div className="w-full bg-border-glass" style={{ height: '100%' }} />
            <div
              ref={lineRef}
              className="absolute top-0 left-0 w-full fiber-line"
              style={{ height: '0%' }}
            />
          </div>

          <div className="space-y-2">
            {EXPERIENCES.map((exp, i) => (
              <ExperienceEntry key={`${exp.company}-${i}`} exp={exp} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
