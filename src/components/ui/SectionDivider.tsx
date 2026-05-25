'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

export function SectionDivider({ label }: { label?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <div ref={ref} className="relative h-32 overflow-hidden">
      <motion.div
        initial={{ scaleY: 0, opacity: 0 }}
        animate={inView ? { scaleY: 1, opacity: 1 } : {}}
        transition={{ duration: 1, ease: [0.22,1,0.36,1] }}
        className="absolute left-1/2 top-0 -translate-x-1/2 w-px h-full"
        style={{
          background: 'linear-gradient(to bottom, transparent, #a855f7, transparent)',
          transformOrigin: 'center',
        }}
      />
      {inView && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24"
          style={{
            animation: 'ringBurst 1.2s ease-out forwards',
            border: '1px solid rgba(168,85,247,0.3)',
            borderRadius: '50%',
          }}
        />
      )}
      <motion.div
        initial={{ opacity: 0, rotate: 0, scale: 0 }}
        animate={inView ? { opacity: 1, rotate: 45, scale: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.4, ease: 'backOut' }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-monarch"
        style={{ filter: 'drop-shadow(0 0 12px #a855f7)' }}
      />
      {label && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="absolute left-1/2 top-[calc(50%+20px)] -translate-x-1/2 font-mono text-[9px] tracking-[0.4em] text-monarch-hi/50 uppercase whitespace-nowrap"
        >
          {label}
        </motion.span>
      )}
    </div>
  )
}
