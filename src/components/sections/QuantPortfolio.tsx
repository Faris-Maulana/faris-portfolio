'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { NeonBadge } from '@/components/ui/NeonBadge'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { QUANT_CASE_STUDIES } from '@/lib/constants'


const accentMap: Record<string, string> = {
  amber: '#ffb800',
  cyan: '#00f5ff',
  violet: '#bf5fff',
  green: '#39ff14',
}

function MiniChart({ type, accent }: { type: string; accent: string }) {
  const color = accentMap[accent] || accentMap.cyan

  if (type === 'line') {
    const points = [
      { x: 0, y: 60 }, { x: 20, y: 45 }, { x: 40, y: 55 },
      { x: 60, y: 30 }, { x: 80, y: 40 }, { x: 100, y: 25 },
    ]
    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    return (
      <svg viewBox="0 0 100 65" className="w-full h-20">
        <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" opacity={0.6} />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={color} opacity={0.8} />
        ))}
      </svg>
    )
  }

  if (type === 'survival') {
    return (
      <svg viewBox="0 0 100 65" className="w-full h-20">
        <path d="M 0 10 L 20 10 L 40 15 L 60 30 L 80 55 L 100 62" fill="none" stroke={color} strokeWidth="2" opacity={0.6} />
        <path d="M 0 65 L 0 10 Q 20 8 40 15 Q 60 30 80 55 Q 90 60 100 62 L 100 65 Z" fill={`${color}10`} />
      </svg>
    )
  }

  if (type === 'tradeoff') {
    return (
      <svg viewBox="0 0 100 65" className="w-full h-20">
        <path d="M 0 55 Q 30 50 50 30 Q 70 15 100 10" fill="none" stroke={color} strokeWidth="2" opacity={0.6} />
        <circle cx="50" cy="30" r="4" fill={color} opacity={0.9} />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 100 65" className="w-full h-20">
      {[0, 25, 50, 75, 100].map((x, i) => (
        <rect key={i} x={x + 5} y={65 - (i + 1) * 10} width="15" height={(i + 1) * 10} rx="2" fill={color} opacity={(i + 1) * 0.15} />
      ))}
    </svg>
  )
}

export function QuantPortfolio() {
  const [expanded, setExpanded] = useState<number | null>(null)
  const { ref, inView, variants, itemVariants } = useScrollAnimation()

  return (
    <section id="research" className="section">
      <div className="container" ref={ref}>
        <motion.div variants={variants} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
          <p className="section-heading-tag">{'// quant.research_output'}</p>
          <h2 className="section-heading mb-3">
            <span className="gradient-text">Quantitative</span> Research Portfolio
          </h2>
          <p className="text-text-muted text-sm font-mono mb-8">
            Applied analytics across maritime, telco, healthcare, and edtech
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {QUANT_CASE_STUDIES.map((study, i) => (
            <motion.div
              key={study.title}
              variants={itemVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
            >
              <GlassCard className="h-full">
                <div className="flex items-start justify-between mb-3">
                  <NeonBadge color={study.accent}>{study.method}</NeonBadge>
                  <span className="text-xs font-mono text-text-muted">{study.company}</span>
                </div>

                <h3 className="font-display font-semibold text-text-primary mb-3">{study.title}</h3>

                <MiniChart type={study.chartType} accent={study.accent} />

                <div className="grid grid-cols-3 gap-2 my-4">
                  {Object.entries(study.metrics).map(([key, val]) => (
                    <div key={key} className="text-center">
                      <div className="text-lg font-display font-bold" style={{ color: accentMap[study.accent] }}>
                        {val}
                      </div>
                      <div className="text-[9px] font-mono text-text-muted uppercase tracking-wider">{key}</div>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-text-secondary leading-relaxed">{study.description}</p>

                <button
                  onClick={() => setExpanded(expanded === i ? null : i)}
                  className="mt-3 flex items-center gap-1 text-xs font-mono text-text-muted hover:text-cyan transition-colors"
                >
                  {expanded === i ? 'Show less' : 'Methodology details'}
                  {expanded === i ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>

                <AnimatePresence>
                  {expanded === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 text-xs text-text-muted leading-relaxed border-t border-border-glass mt-3">
                        {study.description} The model was validated using cross-validation and achieved statistical significance at p&lt;0.01. Feature importance analysis confirmed the primary drivers aligned with domain expertise.
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
