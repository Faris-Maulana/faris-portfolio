'use client'

import { motion } from 'framer-motion'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'

export function About() {
  const { ref, inView, variants } = useScrollAnimation()

  return (
    <section id="about" className="section">
      <div className="container" ref={ref}>
        <motion.div variants={variants} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">
            <span className="gradient-text">About</span> Me
          </h2>
          <div className="w-16 h-0.5 bg-cyan/50 mb-12" />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Stats */}
          <motion.div
            variants={variants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="grid grid-cols-2 gap-6"
          >
            <div className="glass rounded-2xl p-6 text-center">
              <AnimatedCounter end={5} suffix="+" label="Years Experience" />
            </div>
            <div className="glass rounded-2xl p-6 text-center">
              <AnimatedCounter end={20} suffix="+" label="Production Dashboards" />
            </div>
            <div className="glass rounded-2xl p-6 text-center">
              <AnimatedCounter end={3} suffix="" label="Industries Served" />
            </div>
            <div className="glass rounded-2xl p-6 text-center">
              <AnimatedCounter end={25} suffix="K+ km" label="Fiber Network Operated" />
            </div>
          </motion.div>

          {/* Bio */}
          <motion.div
            variants={variants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="space-y-4"
          >
            <div className="glass rounded-2xl p-6 space-y-4">
              <p className="text-text-secondary leading-relaxed">
                I&apos;m an{' '}
                <span className="text-cyan font-medium">AI Engineer &amp; Researcher</span>{' '}
                currently leading AI Engineering at{' '}
                <span className="text-cyan">PT Trans Indonesia Superkoridor</span>,
                where I&apos;m building the company&apos;s Data &amp; AI platform from the ground up.
              </p>
              <p className="text-text-secondary leading-relaxed">
                My work spans the full LLM lifecycle &mdash; from{' '}
                <span className="text-cyan">RAG systems</span> and{' '}
                <span className="text-violet">multi-agent architectures</span> to{' '}
                <span className="text-amber">production data engineering</span>.
                I&apos;ve shipped AI solutions across telco, maritime, healthcare, and EdTech.
              </p>
              <p className="text-text-secondary leading-relaxed">
                Beyond AI, I&apos;m an active{' '}
                <span className="text-neon-red">smart contract security researcher</span>{' '}
                on Sherlock, Code4rena, and Immunefi &mdash; finding vulnerabilities in Solidity before they become exploits.
              </p>

              {/* Current role mini-strip */}
              <div className="mt-6 pt-4 border-t border-border-glass">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green animate-pulse" />
                  <div>
                    <span className="text-xs text-text-muted font-mono">CURRENT</span>
                    <p className="text-sm text-text-primary">
                      Manager AI Engineering @ PT Trans Indonesia Superkoridor
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills radar rings */}
            <div className="glass rounded-2xl p-6">
              <p className="text-xs text-text-muted font-mono mb-4 uppercase tracking-wider">Competency Map</p>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { label: 'AI/ML', pct: 95, color: 'bg-cyan' },
                  { label: 'Data Eng', pct: 90, color: 'bg-green' },
                  { label: 'Security', pct: 75, color: 'bg-neon-red' },
                  { label: 'BI', pct: 85, color: 'bg-amber' },
                  { label: 'Backend', pct: 80, color: 'bg-violet' },
                ].map((skill) => (
                  <div key={skill.label} className="text-center">
                    <div className="relative w-12 h-12 mx-auto mb-2">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                        <circle
                          cx="18" cy="18" r="15" fill="none"
                          stroke="currentColor" strokeWidth="3"
                          strokeDasharray={`${(skill.pct / 100) * 94.2} 94.2`}
                          className={skill.color.replace('bg-', 'text-')}
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <span className="text-[10px] text-text-muted font-mono">{skill.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
