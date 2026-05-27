'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
  const originalOverflow = useRef('')

  const lockScroll = () => {
    const html = document.documentElement
    const body = document.body
    originalOverflow.current = html.style.overflow || ''
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    body.style.touchAction = 'none'
    body.style.overscrollBehavior = 'none'
  }

  const unlockScroll = () => {
    const html = document.documentElement
    const body = document.body
    html.style.overflow = originalOverflow.current
    body.style.overflow = ''
    body.style.touchAction = ''
    body.style.overscrollBehavior = ''
  }

  const preventScroll = (e: Event) => {
    if (skipRef.current) return
    e.preventDefault()
  }

  useEffect(() => {
    const cached = typeof window !== 'undefined' && sessionStorage.getItem('system_boot_done')
    if (cached) {
      setPhase('hidden')
      return
    }

    lockScroll()
    window.addEventListener('wheel', preventScroll, { passive: false })
    window.addEventListener('touchmove', preventScroll, { passive: false })

    const keyHandler = (e: KeyboardEvent) => {
      const scrollKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'PageUp', 'PageDown', 'Home', 'End']
      if (scrollKeys.includes(e.key)) {
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', keyHandler)

    const start = performance.now()
    const tick = (now: number) => {
      if (skipRef.current) return
      const p = Math.min((now - start) / TOTAL_DURATION, 1)
      setProgress(p)
      if (p >= 1) {
        sessionStorage.setItem('system_boot_done', '1')
        unlockScroll()
        window.removeEventListener('wheel', preventScroll)
        window.removeEventListener('touchmove', preventScroll)
        window.removeEventListener('keydown', keyHandler)
        setPhase('done')
        setTimeout(() => setPhase('hidden'), 400)
      } else {
        requestAnimationFrame(tick)
      }
    }
    requestAnimationFrame(tick)

    return () => {
      unlockScroll()
      window.removeEventListener('wheel', preventScroll)
      window.removeEventListener('touchmove', preventScroll)
      window.removeEventListener('keydown', keyHandler)
    }
  }, [])

  const skip = () => {
    skipRef.current = true
    sessionStorage.setItem('system_boot_done', '1')
    unlockScroll()
    window.removeEventListener('wheel', preventScroll)
    window.removeEventListener('touchmove', preventScroll)
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
        className="fixed inset-0 z-[1000] flex items-center justify-center select-none"
        style={{ background: '#030309' }}
      >
        <div className="font-mono text-xs px-4 w-full max-w-lg mx-auto" style={{ color: 'rgba(59,130,246,0.6)' }}>
          <div className="mb-4 tracking-[0.2em] text-system-blue text-[9px] sm:text-[10px] truncate">
            S-CLASS ARCHITECT // JAKARTA INDONESIA
          </div>

          <div className="space-y-2 mb-5">
            {BOOT_LINES.map((line, idx) => (
              <div key={idx} className="flex gap-2 sm:gap-3 text-[10px] sm:text-xs">
                <span className="shrink-0" style={{ color: 'rgba(59,130,246,0.3)' }}>
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span
                  className="truncate"
                  style={{
                    opacity: idx < currentLine ? 1 : idx === currentLine ? 1 : 0.15,
                    color: idx <= currentLine ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)',
                    transition: 'color 0.2s, opacity 0.2s',
                  }}
                >
                  {line}
                </span>
                {idx === currentLine && (
                  <span className="animate-pulse shrink-0" style={{ color: '#3b82f6' }}>▊</span>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-px flex-1"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.4), transparent)' }} />
            <span className="text-[9px] sm:text-[10px] tracking-[0.2em] tabular-nums" style={{ color: 'rgba(59,130,246,0.4)' }}>
              {String(Math.floor(progress * 100)).padStart(2, '0')}%
            </span>
            <div className="h-px flex-1"
              style={{ background: 'linear-gradient(270deg, transparent, rgba(59,130,246,0.4), transparent)' }} />
          </div>

          <div className="mt-2 h-0.5 relative overflow-hidden rounded-full"
            style={{ background: 'rgba(59,130,246,0.1)' }}>
            <div className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `${progress * 100}%`,
                background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                boxShadow: '0 0 8px rgba(59,130,246,0.4)',
                transition: 'width 0.1s linear',
              }} />
          </div>

          <div className="mt-6 text-[8px] sm:text-[9px] text-system-blue/30 tracking-[0.3em] text-center">
            {progress < 1 ? 'SYSTEM INITIALIZING' : 'SYSTEM READY'}
          </div>

          <button
            onClick={skip}
            className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 font-mono text-[8px] sm:text-[9px] text-system-blue/30 hover:text-system-blue/70 tracking-widest border border-system-blue/10 px-2 py-1 sm:px-3 sm:py-1 transition-colors"
          >
            SKIP ▸
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
