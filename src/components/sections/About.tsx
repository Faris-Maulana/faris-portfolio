'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useMotionValue, animate } from 'framer-motion'

function Counter({ end, suffix = '', label }: { end: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const count = useMotionValue(0)
  const [display, setDisplay] = useState('0')
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const controls = animate(count, end, { duration: 2, ease: [0.22,1,0.36,1] })
    const unsub = count.on('change', v => setDisplay(Math.floor(v).toString()))
    return () => { controls.stop(); unsub() }
  }, [inView, count, end])

  return (
    <div ref={ref} className="glass rounded-2xl p-5 relative overflow-hidden group">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.04), transparent)' }} />
      <div className="relative z-10">
        <div className="text-3xl font-display font-extrabold gradient-monarch mb-1">
          {display}{suffix}
        </div>
        <div className="text-[10px] font-mono text-text-muted tracking-wider uppercase">{label}</div>
      </div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-monarch/20 rounded-br-2xl" />
    </div>
  )
}

function RadarChart() {
  const svgRef = useRef<SVGSVGElement>(null)
  const inView = useInView(svgRef, { once: true })
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    const duration = 1800
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      setProgress(p)
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView])

  const skills = [
    { label: 'AI/LLM', value: 0.95 },
    { label: 'Data Eng', value: 0.90 },
    { label: 'Security', value: 0.75 },
    { label: 'ML', value: 0.85 },
    { label: 'Backend', value: 0.80 },
    { label: 'BI', value: 0.88 },
  ]
  const N = skills.length
  const cx = 110; const cy = 110; const R = 80

  function getPoint(i: number, value: number) {
    const angle = (i / N) * 2 * Math.PI - Math.PI / 2
    const r = R * value * progress
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)]
  }

  const points = skills.map((s, i) => getPoint(i, s.value))
  const polygon = points.map(p => p.join(',')).join(' ')

  return (
    <svg ref={svgRef} viewBox="0 0 220 220" className="w-full max-w-[220px]">
      {[0.25,0.5,0.75,1].map(r => (
        <polygon key={r}
          points={Array.from({length: N}, (_, i) => {
            const a = (i/N)*2*Math.PI - Math.PI/2
            return `${cx+R*r*Math.cos(a)},${cy+R*r*Math.sin(a)}`
          }).join(' ')}
          fill="none" stroke="rgba(168,85,247,0.08)" strokeWidth="1"
        />
      ))}
      {skills.map((_, i) => {
        const a = (i/N)*2*Math.PI - Math.PI/2
        return <line key={i}
          x1={cx} y1={cy} x2={cx+R*Math.cos(a)} y2={cy+R*Math.sin(a)}
          stroke="rgba(168,85,247,0.06)" strokeWidth="1"
        />
      })}
      <polygon points={polygon} fill="rgba(168,85,247,0.08)" stroke="#a855f7"
        strokeWidth="1.5" style={{ filter: 'drop-shadow(0 0 6px rgba(168,85,247,0.4))' }} />
      {skills.map((s, i) => {
        const a = (i/N)*2*Math.PI - Math.PI/2
        const lx = cx + (R + 18) * Math.cos(a)
        const ly = cy + (R + 18) * Math.sin(a)
        return <text key={i} x={lx} y={ly}
          textAnchor="middle" dominantBaseline="central"
          fill="rgba(168,85,247,0.6)" fontSize="8" fontFamily="JetBrains Mono">{s.label}</text>
      })}
    </svg>
  )
}

export function About() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const scanRef    = useRef<HTMLDivElement>(null)
  const inView = useInView(sectionRef, { once: true })

  useEffect(() => {
    if (!inView || !scanRef.current) return
    const el = scanRef.current
    el.style.opacity = '1'
    el.animate([
      { top: '-2px', opacity: 1 },
      { top: '100%', opacity: 0.4 },
      { top: '100%', opacity: 0 }
    ], { duration: 1600, easing: 'linear', fill: 'forwards' })
  }, [inView])

  return (
    <section id="about" className="section" ref={sectionRef}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="mb-16">
          <p className="section-heading-tag">{'// the.archive'}</p>
          <h2 className="section-heading"><span className="gradient-monarch">About</span></h2>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -24 }} animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <Counter end={5}  suffix="+"     label="Years Experience" />
              <Counter end={20} suffix="+"     label="Production Dashboards" />
              <Counter end={3}  suffix=""      label="Industries Served" />
              <Counter end={25} suffix="K+ km" label="Fiber Network Operated" />
            </div>

            <div className="glass rounded-2xl p-6 flex flex-col items-center">
              <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest mb-4">Competency Radar</p>
              <RadarChart />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }} animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl z-20">
              <div
                ref={scanRef}
                className="absolute left-0 right-0 h-px opacity-0"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.8), transparent)', boxShadow: '0 0 16px rgba(168,85,247,0.4)' }}
              />
            </div>

            <div className="glass rounded-2xl p-7 space-y-5 relative">
              {['top-0 left-0 border-t border-l','top-0 right-0 border-t border-r','bottom-0 left-0 border-b border-l','bottom-0 right-0 border-b border-r'].map((cls,i) => (
                <div key={i} className={`absolute w-4 h-4 ${cls} border-monarch/30 rounded-sm`} />
              ))}

              <div className="font-mono text-[10px] text-monarch/50 tracking-widest">ARCHIVE // ACCESS GRANTED</div>

              <p className="text-text-secondary leading-relaxed text-sm">
                I&apos;m an{' '}
                <span className="text-monarch-hi font-medium">AI Engineer &amp; Researcher</span>{' '}
                currently leading AI Engineering at{' '}
                <span className="text-monarch">PT Trans Indonesia Superkoridor</span>,
                building the company&apos;s Data &amp; AI platform from zero.
              </p>
              <p className="text-text-secondary leading-relaxed text-sm">
                My work spans the full LLM lifecycle —{' '}
                <span className="text-monarch-hi">RAG systems</span>,{' '}
                <span className="text-violet font-medium">multi-agent LangGraph architectures</span>,{' '}
                <span className="text-amber font-medium">medallion data engineering</span>.
                I&apos;ve shipped AI solutions across telco, maritime, healthcare, and EdTech.
              </p>
              <p className="text-text-secondary leading-relaxed text-sm">
                Beyond AI: active{' '}
                <span className="text-neon-red font-medium">smart contract security researcher</span>{' '}
                on Sherlock, Code4rena, and Immunefi — finding Solidity vulnerabilities before they become exploits.
              </p>

              <div className="pt-4 border-t border-border-glass">
                <div className="flex items-start gap-3">
                  <div className="relative mt-0.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-green" />
                    <div className="absolute inset-0 rounded-full bg-green animate-ping opacity-60" />
                  </div>
                  <div>
                    <div className="text-[9px] font-mono text-text-muted uppercase tracking-widest mb-0.5">Current deployment</div>
                    <p className="text-sm text-text-primary">Manager AI Engineering @ PT Trans Indonesia Superkoridor</p>
                    <p className="text-[10px] font-mono text-monarch/60 mt-0.5">May 2026 – Present · Jakarta, Indonesia</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
