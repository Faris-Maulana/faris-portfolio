'use client'

import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { SKILLS } from '@/lib/constants'
import { cn } from '@/lib/utils'

const skillColors = {
  cyan: 'border-cyan/30 text-cyan',
  green: 'border-green/30 text-green',
  violet: 'border-violet/30 text-violet',
  red: 'border-neon-red/30 text-neon-red',
  amber: 'border-amber/30 text-amber',
  'cyan-dim': 'border-cyan-dim/30 text-cyan-dim',
}

const glowColors = {
  cyan: 'shadow-cyan/20',
  green: 'shadow-green/20',
  violet: 'shadow-violet/20',
  red: 'shadow-neon-red/20',
  amber: 'shadow-amber/20',
  'cyan-dim': 'shadow-cyan-dim/20',
}

export function Skills() {
  const { ref, inView, variants, staggerVariants, itemVariants } = useScrollAnimation()

  return (
    <section id="skills" className="section">
      <div className="container" ref={ref}>
        <motion.div variants={variants} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">
            <span className="gradient-text">Skills</span> & Expertise
          </h2>
          <div className="w-16 h-0.5 bg-cyan/50 mb-12" />
        </motion.div>

        <motion.div
          variants={staggerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-2 gap-6"
        >
          {SKILLS.map((group) => (
            <motion.div key={group.category} variants={itemVariants}>
              <GlassCard>
                <h3 className={cn(
                  'font-display font-semibold text-sm mb-4',
                  group.color === 'cyan' && 'text-cyan',
                  group.color === 'green' && 'text-green',
                  group.color === 'violet' && 'text-violet',
                  group.color === 'red' && 'text-neon-red',
                  group.color === 'amber' && 'text-amber',
                  group.color === 'cyan-dim' && 'text-cyan-dim',
                )}>
                  {group.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((skill) => (
                    <span
                      key={skill}
                      className={cn(
                        'px-3 py-1 rounded-full border text-xs font-mono transition-all duration-300 cursor-default',
                        skillColors[group.color as keyof typeof skillColors],
                        `hover:shadow-lg ${glowColors[group.color as keyof typeof glowColors]} hover:scale-105`
                      )}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
