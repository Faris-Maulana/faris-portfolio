'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { audioEngine } from '@/hooks/useAudioEngine'

export function BootSequence() {
  const [phase, setPhase] = useState<'init' | 'name' | 'tagline' | 'exit' | 'done'>('init')
  const [progress, setProgress] = useState(0)
  const hasShown = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem('shadow_boot_done') === '1') {
      setPhase('done')
      return
    }
    if (hasShown.current) return
    hasShown.current = true

    document.body.style.overflow = 'hidden'

    const t1 = setTimeout(() => setPhase('name'),     200)
    const t2 = setTimeout(() => setPhase('tagline'), 1800)
    const t3 = setTimeout(() => {
      setPhase('exit')
      audioEngine.playBootCrescendo(3.6)
    }, 3400)
    const t4 = setTimeout(() => {
      setPhase('done')
      sessionStorage.setItem('shadow_boot_done', '1')
      document.body.style.overflow = ''
    }, 4400)

    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const p = Math.min(elapsed / 3400, 1)
      setProgress(p)
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)

    return () => { [t1,t2,t3,t4].forEach(clearTimeout); document.body.style.overflow = '' }
  }, [])

  if (phase === 'done') return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: [0.65,0,0.35,1] }}
        className="fixed inset-0 z-[1000] bg-abyss flex items-center justify-center overflow-hidden"
      >
        <svg
          className="absolute inset-0 m-auto magic-circle pointer-events-none"
          width="600" height="600" viewBox="0 0 600 600"
          style={{ filter: 'drop-shadow(0 0 40px rgba(168,85,247,0.3))' }}
        >
          <circle cx="300" cy="300" r="280" fill="none" stroke="url(#g1)" strokeWidth="0.5" strokeDasharray="2 8" />
          <circle cx="300" cy="300" r="240" fill="none" stroke="url(#g1)" strokeWidth="0.5" strokeDasharray="1 16" />
          <circle cx="300" cy="300" r="200" fill="none" stroke="url(#g1)" strokeWidth="0.8" />
          {[0,60,120,180,240,300].map(deg => (
            <line key={deg} x1="300" y1="300" x2="300" y2="80"
              stroke="rgba(168,85,247,0.15)" strokeWidth="0.5"
              transform={`rotate(${deg} 300 300)`} />
          ))}
          <defs>
            <radialGradient id="g1">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>

        <svg
          className="absolute inset-0 m-auto magic-circle-rev pointer-events-none"
          width="360" height="360" viewBox="0 0 360 360"
        >
          <circle cx="180" cy="180" r="160" fill="none" stroke="rgba(168,85,247,0.2)" strokeWidth="0.5" strokeDasharray="4 4" />
          <circle cx="180" cy="180" r="120" fill="none" stroke="rgba(168,85,247,0.3)" strokeWidth="0.5" />
        </svg>

        <div className="relative z-10 text-center">
          <AnimatePresence mode="wait">
            {phase === 'name' && (
              <motion.div
                key="name"
                initial={{ opacity: 0, y: 40, filter: 'blur(12px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
                transition={{ duration: 0.8, ease: [0.22,1,0.36,1] }}
              >
                <p className="text-[10px] font-mono text-monarch tracking-[0.4em] uppercase mb-4 opacity-60">
                  AWAKENING . . .
                </p>
                <h1
                  className="font-display font-extrabold text-5xl md:text-7xl tracking-tight uppercase gradient-monarch"
                  style={{ letterSpacing: '-0.04em' }}
                >
                  Faris Maulana
                </h1>
              </motion.div>
            )}

            {phase === 'tagline' && (
              <motion.div
                key="tagline"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6 }}
                className="space-y-3"
              >
                <p className="editorial text-2xl md:text-4xl text-monarch-hi italic">
                  &ldquo;Build in the shadows.&rdquo;
                </p>
                <p className="font-mono text-xs text-text-secondary tracking-[0.3em] uppercase opacity-60">
                  Shadow Architect
                </p>
              </motion.div>
            )}

            {phase === 'exit' && (
              <motion.div
                key="exit"
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: 0, scale: 1.3 }}
                transition={{ duration: 0.8 }}
                className="font-mono text-xs text-monarch tracking-[0.5em]"
              >
                ARISE
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-64 max-w-[60vw]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[9px] text-monarch/60 tracking-widest">SUMMONING</span>
            <span className="font-mono text-[9px] text-monarch/60 tabular-nums">
              {Math.floor(progress * 100).toString().padStart(3, '0')}%
            </span>
          </div>
          <div className="h-px bg-monarch/15 relative overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-monarch"
              style={{ width: `${progress * 100}%` }}
              transition={{ duration: 0, ease: 'linear' }}
            />
            <div
              className="absolute top-0 h-px w-4 bg-white"
              style={{ left: `${progress * 100}%`, filter: 'blur(2px)' }}
            />
          </div>
        </div>

        <div className="absolute inset-y-0 left-12 w-px bg-gradient-to-b from-transparent via-monarch/20 to-transparent" />
        <div className="absolute inset-y-0 right-12 w-px bg-gradient-to-b from-transparent via-monarch/20 to-transparent" />

        {[
          'top-8 left-8 border-t border-l',
          'top-8 right-8 border-t border-r',
          'bottom-8 left-8 border-b border-l',
          'bottom-8 right-8 border-b border-r',
        ].map((cls, i) => (
          <div key={i} className={`absolute w-6 h-6 ${cls} border-monarch/40`} />
        ))}
      </motion.div>
    </AnimatePresence>
  )
}
