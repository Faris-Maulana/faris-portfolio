'use client'

import { useRef, useEffect, useState } from 'react'

const STATS = [
  { label: 'Years Experience', value: 5, suffix: '+' },
  { label: 'Prod Dashboards', value: 20, suffix: '+' },
  { label: 'Industries', value: 3, suffix: '' },
  { label: 'Fiber Network', value: 25, suffix: 'K+ km' },
]

const COMPETENCIES = [
  { label: 'AI/ML', pct: 95, color: '#00f5ff' },
  { label: 'Data Eng', pct: 90, color: '#39ff14' },
  { label: 'Security', pct: 75, color: '#ff3e3e' },
  { label: 'BI', pct: 85, color: '#ffb800' },
  { label: 'Backend', pct: 80, color: '#bf5fff' },
]

function AnimatedCount({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const counted = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true
          const duration = 1200
          const steps = 30
          const increment = end / steps
          let current = 0
          const interval = setInterval(() => {
            current += increment
            if (current >= end) {
              setCount(end)
              clearInterval(interval)
            } else {
              setCount(Math.floor(current))
            }
          }, duration / steps)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [end])

  return <span ref={ref}>{count}{suffix}</span>
}

function RadarRing({ pct, color }: { pct: number; color: string }) {
  const r = 15
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
      <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5" />
      <circle
        cx="18" cy="18" r={r} fill="none"
        stroke={color} strokeWidth="2.5"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  )
}

export function About() {
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
    <section id="about" className="section" ref={ref}>
      <div className="container">
        <div
          className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <span className="section-heading-tag">{'// BIO'}</span>
          <h2 className="section-heading gradient-text">Biometric Scan</h2>
          <div className="fiber-line mt-4" />
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mt-10">
          {/* Left — Stats */}
          <div
            className={`grid grid-cols-2 gap-4 transition-all duration-700 delay-100 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            {STATS.map((stat) => (
              <div key={stat.label} className="glass rounded-xl p-5 text-center border border-border-glass">
                <span className="block text-2xl md:text-3xl font-display font-bold text-cyan">
                  <AnimatedCount end={stat.value} suffix={stat.suffix} />
                </span>
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}

            {/* Bio panel */}
            <div className="col-span-2 glass rounded-xl p-5 border border-border-glass space-y-3">
              <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
                I&apos;m an <span className="text-cyan">AI Engineer &amp; Researcher</span> leading AI
                at <span className="text-cyan">PT Trans Indonesia Superkoridor</span>, building the
                company&apos;s Data &amp; AI platform from scratch.
              </p>
              <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
                My work spans <span className="text-cyan">RAG systems</span>,{' '}
                <span className="text-violet">multi-agent architectures</span>, and{' '}
                <span className="text-amber">production data engineering</span> across
                telco, maritime, healthcare, and EdTech.
              </p>
              <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
                I&apos;m also an active <span className="text-neon-red">smart contract security
                researcher</span> on Sherlock, Code4rena, and Immunefi.
              </p>
              <div className="pt-2 border-t border-border-glass flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
                <span className="text-[10px] font-mono text-text-muted">
                  Manager AI Engineering @ PT Trans Indonesia Superkoridor
                </span>
              </div>
            </div>
          </div>

          {/* Right — Radar */}
          <div
            className={`transition-all duration-700 delay-200 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <div className="glass rounded-xl p-5 md:p-6 border border-border-glass">
              <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-5">Competency Radar</p>
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-48 h-48 md:w-56 md:h-56">
                  <svg viewBox="0 0 120 120" className="w-full h-full">
                    {COMPETENCIES.map((s, i) => {
                      const angle = (i / COMPETENCIES.length) * Math.PI * 2 - Math.PI / 2
                      const r = (s.pct / 100) * 50
                      const x = 60 + r * Math.cos(angle)
                      const y = 60 + r * Math.sin(angle)
                      return <line key={s.label} x1="60" y1="60" x2={x} y2={y} stroke={s.color} strokeWidth="0.8" opacity="0.25" />
                    })}
                    {[0.25, 0.5, 0.75, 1].map((scale) => (
                      <polygon
                        key={scale}
                        points={COMPETENCIES.map((_, i) => {
                          const angle = (i / COMPETENCIES.length) * Math.PI * 2 - Math.PI / 2
                          const r = scale * 50
                          return `${60 + r * Math.cos(angle)},${60 + r * Math.sin(angle)}`
                        }).join(' ')}
                        fill="none"
                        stroke="rgba(0,245,255,0.08)"
                        strokeWidth="0.5"
                      />
                    ))}
                    <polygon
                      points={COMPETENCIES.map((s, i) => {
                        const angle = (i / COMPETENCIES.length) * Math.PI * 2 - Math.PI / 2
                        const r = (s.pct / 100) * 50
                        return `${60 + r * Math.cos(angle)},${60 + r * Math.sin(angle)}`
                      }).join(' ')}
                      fill="rgba(0,245,255,0.04)"
                      stroke="#00f5ff"
                      strokeWidth="1"
                    />
                  </svg>
                  {COMPETENCIES.map((s, i) => {
                    const angle = (i / COMPETENCIES.length) * Math.PI * 2 - Math.PI / 2
                    const r = (s.pct / 100) * 50 + 2
                    const x = 60 + r * Math.cos(angle)
                    const y = 60 + r * Math.sin(angle)
                    const px = (x / 120) * 100
                    const py = (y / 120) * 100
                    return (
                      <div
                        key={s.label}
                        className="absolute w-2 h-2 rounded-full"
                        style={{
                          left: `${px}%`,
                          top: `${py}%`,
                          background: s.color,
                          boxShadow: `0 0 8px ${s.color}`,
                          transform: 'translate(-50%, -50%)',
                        }}
                      />
                    )
                  })}
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {COMPETENCIES.map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="w-10 h-10 mx-auto mb-1">
                      <RadarRing pct={s.pct} color={s.color} />
                    </div>
                    <span className="text-[8px] font-mono text-text-muted block">{s.label}</span>
                    <span className="text-[9px] font-mono" style={{ color: s.color }}>{s.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
