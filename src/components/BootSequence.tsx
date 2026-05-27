'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const BOOT_LINES = [
  'IDENTITY VERIFIED               · FARIS_MAULANA',
  'ROLE ASSIGNED                   · AI ENGINEER · MANAGER',
  'DOMAIN ACCESS GRANTED           · JAKARTA NODE',
  'DEPLOYMENT ACTIVE               · 25,000+ KM NETWORK',
  'SECURITY CLEARANCE              · PP 71/2019 COMPLIANT',
]

const TOTAL_DURATION = 2200

export function BootSequence() {
  const [phase, setPhase] = useState<'boot' | 'done' | 'hidden'>('boot')
  const [progress, setProgress] = useState(0)
  const skipRef = useRef(false)

  useEffect(() => {
    const cached = typeof window !== 'undefined' && sessionStorage.getItem('system_boot_done')
    if (cached) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase('hidden')
      return
    }

    document.body.style.overflow = 'hidden'

    const start = performance.now()
    const tick = (now: number) => {
      if (skipRef.current) return
      const p = Math.min((now - start) / TOTAL_DURATION, 1)
      setProgress(p)
      if (p >= 1) {
        sessionStorage.setItem('system_boot_done', '1')
        document.body.style.overflow = ''
        setPhase('done')
        setTimeout(() => setPhase('hidden'), 400)
      } else {
        requestAnimationFrame(tick)
      }
    }
    requestAnimationFrame(tick)

    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const skip = () => {
    skipRef.current = true
    sessionStorage.setItem('system_boot_done', '1')
    document.body.style.overflow = ''
    setPhase('hidden')
  }

  if (phase === 'hidden') return null

  const currentLine = Math.min(
    Math.floor(progress * BOOT_LINES.length),
    BOOT_LINES.length - 1
  )

  return (
    <AnimatePresence>
      <motion.div
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-[1000] flex items-center justify-center"
        style={{ background: '#030309' }}
      >
        <div className="font-mono text-xs" style={{ color: 'rgba(59,130,246,0.6)' }}>
          <div className="mb-6 tracking-[0.2em] text-system-blue text-[10px]">
            S-CLASS ARCHITECT // JAKARTA INDONESIA
          </div>

          <div className="space-y-2.5 mb-6">
            {BOOT_LINES.map((line, idx) => (
              <div key={idx} className="flex gap-3">
                <span style={{ color: 'rgba(59,130,246,0.3)' }}>
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span
                  style={{
                    opacity: idx < currentLine ? 1 : idx === currentLine ? 1 : 0.15,
                    color: idx <= currentLine ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)',
                    transition: 'color 0.2s, opacity 0.2s',
                  }}
                >
                  {line}
                </span>
                {idx === currentLine && (
                  <span className="animate-pulse" style={{ color: '#3b82f6' }}>▊</span>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.4), transparent)' }} />
            <span className="text-[10px] tracking-[0.2em]" style={{ color: 'rgba(59,130,246,0.4)' }}>
              {Math.floor(progress * 100)}%
            </span>
            <div className="h-px flex-1"
              style={{ background: 'linear-gradient(270deg, transparent, rgba(59,130,246,0.4), transparent)' }} />
          </div>

          <div className="mt-3 h-0.5 relative overflow-hidden rounded-full"
            style={{ background: 'rgba(59,130,246,0.1)' }}>
            <div className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `${progress * 100}%`,
                background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                boxShadow: '0 0 8px rgba(59,130,246,0.4)',
                transition: 'width 0.1s linear',
              }} />
          </div>

          <button
            onClick={skip}
            className="absolute bottom-6 right-6 font-mono text-[9px] text-system-blue/40 hover:text-system-blue tracking-widest border border-system-blue/20 px-3 py-1 transition-colors"
          >
            SKIP ▸
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
