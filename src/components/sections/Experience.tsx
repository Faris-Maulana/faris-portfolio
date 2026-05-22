'use client'

import { motion } from 'framer-motion'
import { NeonBadge } from '@/components/ui/NeonBadge'
import { GlassCard } from '@/components/ui/GlassCard'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { EXPERIENCES } from '@/lib/constants'
import { cn } from '@/lib/utils'

const accentColors = {
  cyan: 'border-cyan/30',
  green: 'border-green/30',
  amber: 'border-amber/30',
  violet: 'border-violet/30',
  red: 'border-neon-red/30',
  muted: 'border-text-muted/30',
}

const dotColors = {
  cyan: 'bg-cyan',
  green: 'bg-green',
  amber: 'bg-amber',
  violet: 'bg-violet',
  red: 'bg-neon-red',
  muted: 'bg-text-muted',
}

export function Experience() {
  const { ref, inView, variants, itemVariants } = useScrollAnimation()

  return (
    <section id="experience" className="section">
      <div className="container" ref={ref}>
        <motion.div variants={variants} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">
            <span className="gradient-text">Experience</span>
          </h2>
          <div className="w-16 h-0.5 bg-cyan/50 mb-12" />
        </motion.div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border-glass hidden md:block" />

          <div className="space-y-8">
            {EXPERIENCES.map((exp, i) => (
              <motion.div
                key={`${exp.company}-${i}`}
                variants={itemVariants}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
                className="relative pl-0 md:pl-12"
              >
                {/* Timeline dot */}
                <div className={cn(
                  'absolute left-[11px] top-6 w-[18px] h-[18px] rounded-full border-2 border-deep hidden md:block',
                  dotColors[exp.accent as keyof typeof dotColors]
                )} />

                <GlassCard className={cn('border-l-2', accentColors[exp.accent as keyof typeof accentColors])}>
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn('w-2 h-2 rounded-full', dotColors[exp.accent as keyof typeof dotColors])} />
                        <span className="text-xs font-mono text-text-muted">{exp.period}</span>
                      </div>
                      <h3 className="text-lg font-display font-semibold text-text-primary">{exp.role}</h3>
                      <p className="text-sm text-text-secondary">{exp.company}</p>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-4">
                    {exp.bullets.map((bullet, j) => (
                      <li key={j} className="flex gap-2 text-sm text-text-secondary">
                        <span className="text-cyan mt-1.5 flex-shrink-0">▹</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-2">
                    {exp.stack.map((tech) => (
                      <NeonBadge key={tech} color={exp.accent}>{tech}</NeonBadge>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
