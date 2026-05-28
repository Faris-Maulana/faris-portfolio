'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { HoloPanel } from '@/components/ui/HoloPanel'
import { TextReveal } from '@/components/ui/TextReveal'

function Counter({ end, suffix = '', label }: { end: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [display, setDisplay] = useState(end.toString())
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (!ref.current || started) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStarted(true)
      return
    }

    const el = ref.current
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
          io.disconnect()
          setDisplay('0')
          const duration = 1600
          const startTime = performance.now()
          const tick = (now: number) => {
            const t = Math.min((now - startTime) / duration, 1)
            const eased = 1 - Math.pow(1 - t, 4)
            setDisplay(Math.floor(eased * end).toString())
            if (t < 1) requestAnimationFrame(tick)
            else setDisplay(end.toString())
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [end, started])

  return (
    <div
      ref={ref}
      className="relative overflow-hidden group"
      style={{
        background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(168,85,247,0.04) 100%)',
        border: '1px solid rgba(59,130,246,0.18)',
        clipPath: 'polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)',
        padding: '20px 24px',
      }}
    >
      <div className="absolute top-2 right-3 font-mono text-[8px] text-system-blue/60 tracking-widest">
        STAT
      </div>
      <div className="relative z-10">
        <div
          className="text-4xl font-display font-extrabold text-system-blue mb-1 tabular-nums"
          style={{ textShadow: '0 0 24px rgba(59,130,246,0.4)' }}
        >
          {display}<span className="text-monarch text-2xl">{suffix}</span>
        </div>
        <div className="text-[10px] font-mono text-text-muted tracking-[0.18em] uppercase">
          {label}
        </div>
      </div>
    </div>
  )
}

function RadarChart() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.unobserve(el)
        }
      },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    const start = performance.now()
    const duration = 1800
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      setProgress(p)
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [visible])

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
    <svg
      ref={svgRef}
      viewBox="-10 -10 240 240"
      className="w-full max-w-[180px] sm:max-w-[220px] md:max-w-[260px] lg:max-w-[280px] mx-auto"
      role="img"
      aria-label="Competency radar: AI/LLM 95%, Data Engineering 90%, Security 75%, Machine Learning 85%, Backend 80%, BI 88%"
    >
      {[0.25, 0.5, 0.75, 1].map(r => (
        <polygon key={r}
          points={Array.from({ length: N }, (_, i) => {
            const a = (i / N) * 2 * Math.PI - Math.PI / 2
            return `${cx + R * r * Math.cos(a)},${cy + R * r * Math.sin(a)}`
          }).join(' ')}
          fill="none" stroke="rgba(59,130,246,0.08)" strokeWidth="1"
        />
      ))}
      {skills.map((_, i) => {
        const a = (i / N) * 2 * Math.PI - Math.PI / 2
        return <line key={i}
          x1={cx} y1={cy} x2={cx + R * Math.cos(a)} y2={cy + R * Math.sin(a)}
          stroke="rgba(59,130,246,0.06)" strokeWidth="1"
        />
      })}
      <polygon points={polygon} fill="rgba(59,130,246,0.08)" stroke="#3b82f6"
        strokeWidth="1.5" style={{ filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.4))' }} />
      {skills.map((s, i) => {
        const a = (i / N) * 2 * Math.PI - Math.PI / 2
        const lx = cx + (R + 22) * Math.cos(a)
        const ly = cy + (R + 22) * Math.sin(a)
        return (
          <text key={i} x={lx} y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#60a5fa"
            fontSize="9"
            fontFamily="JetBrains Mono, monospace"
            fontWeight="500"
            letterSpacing="0.08em"
            style={{ textTransform: 'uppercase' }}
          >
            <tspan x={lx} dy="0">{s.label}</tspan>
          </text>
        )
      })}
    </svg>
  )
}

export function About() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const scanRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          obs.unobserve(el)
        }
      },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!inView || !scanRef.current) return
    const el = scanRef.current
    el.style.opacity = '1'
    el.animate([
      { top: '-2px', opacity: 1 },
      { top: '100%', opacity: 0.4 },
      { top: '100%', opacity: 0 },
    ], { duration: 1600, easing: 'linear', fill: 'forwards' })
  }, [inView])

  return (
    <section id="about" className="section" ref={sectionRef}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mb-16"
        >
          <TextReveal mode="glitch" as="p" className="section-heading-tag">
            {'// STATUS_WINDOW'}
          </TextReveal>
          <h2 className="section-heading">
            <span className="gradient-monarch">About</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 lg:gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
              <Counter end={5} suffix="+" label="Years Experience" />
              <Counter end={20} suffix="+" label="Production Dashboards" />
              <Counter end={3} suffix="" label="Industries Served" />
              <Counter end={25} suffix="K+ km" label="Fiber Network Operated" />
            </div>

            <HoloPanel variant="compact" glowColor="purple" className="p-6 flex flex-col items-center mx-auto">
              <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest mb-4">
                Competency Radar
              </p>
              <RadarChart />
            </HoloPanel>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
              <div
                ref={scanRef}
                className="absolute left-0 right-0 h-px opacity-0"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.8), transparent)',
                  boxShadow: '0 0 16px rgba(59,130,246,0.4)',
                }}
              />
            </div>

            <HoloPanel glowColor="blue" className="p-7 space-y-5">
              <div className="font-mono text-[10px] text-system-blue/50 tracking-widest">
                ARCHIVE // ACCESS GRANTED
              </div>

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

              <div className="pt-4 border-t" style={{ borderColor: 'rgba(59,130,246,0.15)' }}>
                <div className="flex items-start gap-3">
                  <div className="relative mt-0.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-green" />
                    <div className="absolute inset-0 rounded-full bg-green animate-ping opacity-60" />
                  </div>
                  <div>
                    <div className="text-[9px] font-mono text-text-muted uppercase tracking-widest mb-0.5">
                      Current deployment
                    </div>
                    <p className="text-sm text-text-primary">
                      Manager AI Engineering @ PT Trans Indonesia Superkoridor
                    </p>
                    <p className="text-[10px] font-mono text-monarch/60 mt-0.5">
                      May 2026 – Present · Jakarta, Indonesia
                    </p>
                  </div>
                </div>
              </div>
            </HoloPanel>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
