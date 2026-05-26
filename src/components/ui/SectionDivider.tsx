'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

export function SectionDivider({ label }: { label?: string }) {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <div ref={ref} className="relative h-20 flex items-center justify-center overflow-hidden">
      <div className="flex items-center gap-4 w-full max-w-2xl px-8">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
          className="flex-1 h-px bg-gradient-to-r from-transparent to-system-blue/40"
          style={{ transformOrigin: 'right' }}
        />

        {label && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex items-center gap-2 font-mono text-[10px] tracking-[0.4em] text-system-blue/70 uppercase whitespace-nowrap"
          >
            <span className="text-system-blue/40">[</span>
            <span>{label}</span>
            <span className="text-system-blue/40">]</span>
          </motion.div>
        )}

        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22,1,0.36,1] }}
          className="flex-1 h-px bg-gradient-to-l from-transparent to-system-blue/40"
          style={{ transformOrigin: 'left' }}
        />
      </div>
    </div>
  )
}
