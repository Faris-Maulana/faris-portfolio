'use client'

import { useRef, useEffect, useState } from 'react'
import { EXPERIENCES } from '@/lib/constants'

const accentHex: Record<string, string> = {
  cyan:  '#00f5ff',
  green: '#39ff14',
  amber: '#ffb800',
  violet: '#bf5fff',
  red:   '#ff3e3e',
  muted: '#4a6272',
}

export function Experience() {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="experience" className="section" ref={ref}>
      <div className="container">
        <div className="mb-12">
          <span className="section-heading-tag">{'// DEPLOY_LOG'}</span>
          <h2 className="section-heading gradient-text">System Deployments</h2>
          <div className="fiber-line mt-4" />
        </div>

        <div className="space-y-0 overflow-hidden rounded-xl border border-border-glass font-mono text-xs md:text-sm">
          {EXPERIENCES.map((exp, i) => (
            <div
              key={`${exp.company}-${i}`}
              className={`
                transition-all duration-700
                ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
              `}
              style={{
                transitionDelay: `${i * 120}ms`,
              }}
            >
              <div
                className="px-4 md:px-6 py-3 md:py-4 flex items-start gap-3 md:gap-4 border-b border-border-glass last:border-b-0 hover:bg-white/[0.015] transition-colors"
              >
                <span
                  className="flex-shrink-0 font-bold text-[10px] md:text-xs mt-0.5"
                  style={{ color: accentHex[exp.accent] || '#4a6272' }}
                >
                  [{i + 1}]
                </span>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="text-text-primary font-semibold">{exp.role}</span>
                    <span
                      className="text-[10px] md:text-xs tracking-wider uppercase"
                      style={{ color: accentHex[exp.accent] || '#4a6272', opacity: 0.8 }}
                    >
                      @ {exp.company}
                    </span>
                    <span className="text-text-muted text-[10px] md:text-xs ml-auto">{exp.period}</span>
                  </div>

                  <div className="space-y-0.5">
                    {exp.bullets.map((bullet, j) => (
                      <p key={j} className="text-text-secondary leading-relaxed flex gap-2">
                        <span className="text-text-muted">▹</span>
                        <span>{bullet}</span>
                      </p>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {exp.stack.map((tech) => (
                      <span
                        key={tech}
                        className="text-[9px] md:text-[10px] px-1.5 py-0.5 rounded"
                        style={{
                          color: accentHex[exp.accent] || '#4a6272',
                          border: `1px solid ${accentHex[exp.accent] || '#4a6272'}30`,
                          background: `${accentHex[exp.accent] || '#4a6272'}08`,
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="fiber-line mt-6" />
      </div>
    </section>
  )
}
