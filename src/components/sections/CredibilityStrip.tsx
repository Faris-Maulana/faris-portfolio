'use client'

import { motion } from 'framer-motion'

const PROOFS = [
  { label: 'CURRENT',   value: 'PT Trans Indonesia Superkoridor', detail: 'Manager · AI Engineering' },
  { label: 'NETWORK',   value: '25,000+ km',                       detail: 'DWDM fiber backbone' },
  { label: 'STACK',     value: 'LangGraph · ClickHouse',            detail: 'Multi-agent Text2SQL' },
  { label: 'RESEARCH',  value: 'Sherlock · Code4rena',              detail: 'Smart contract auditor' },
]

export function CredibilityStrip() {
  return (
    <section className="relative py-12 px-4 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-px bg-gradient-to-r from-transparent via-system-blue/25 to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-px bg-gradient-to-r from-transparent via-system-blue/25 to-transparent" />

      <div className="container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-8 max-w-5xl mx-auto">
          {PROOFS.map((p, i) => (
            <motion.div
              key={p.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative"
            >
              <p className="font-mono text-[9px] tracking-[0.3em] text-system-blue/70 uppercase mb-2">
                {p.label}
              </p>
              <p className="font-display text-base md:text-lg text-text-primary font-semibold leading-tight mb-1"
                style={{
                  background: 'linear-gradient(135deg, #f3e8ff 0%, #c084fc 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                {p.value}
              </p>
              <p className="text-[11px] text-text-muted leading-relaxed">
                {p.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
