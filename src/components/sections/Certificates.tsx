'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ExternalLink, ShieldCheck, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Certificate } from '@/lib/supabase/types'
import { cn } from '@/lib/utils'

const CATEGORIES = ['All', 'AI/ML', 'Security', 'Engineering', 'Data'] as const

const CLEARANCE_LEVEL: Record<string, { label: string; color: string; glow: string }> = {
  'AI/ML':       { label: 'TS/SCI', color: '#bf5fff', glow: 'rgba(191,95,255,0.2)' },
  'Security':    { label: 'SECRET', color: '#ff3e3e', glow: 'rgba(255,62,62,0.2)' },
  'Engineering': { label: 'TOP SECRET', color: '#a855f7', glow: 'rgba(168,85,247,0.2)' },
  'Data':        { label: 'CONFIDENTIAL', color: '#39ff14', glow: 'rgba(57,255,20,0.2)' },
  'Leadership':  { label: 'CLASSIFIED', color: '#ffb800', glow: 'rgba(255,184,0,0.2)' },
  'Other':       { label: 'UNCLASSIFIED', color: '#4a6272', glow: 'rgba(74,98,114,0.1)' },
}

function CertCard({ cert, index }: { cert: Certificate; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const cl = CLEARANCE_LEVEL[cert.category] || CLEARANCE_LEVEL['Other']
  const [shimmer, setShimmer] = useState({ x: '50%', y: '50%' })
  const [hovering, setHovering] = useState(false)

  const handleMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%'
    const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1) + '%'
    setShimmer({ x, y })
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20, rotateX: -10 }}
      animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ delay: (index % 6) * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      data-cursor="hover"
      className="relative cursor-pointer"
      style={{ perspective: '600px' }}
    >
      <div
        className={cn(
          'relative rounded-xl overflow-hidden transition-all duration-300 h-full',
          'glass border',
        )}
        style={{
          borderColor: hovering ? cl.color + '40' : 'rgba(168,85,247,0.07)',
          boxShadow: hovering ? `0 0 30px ${cl.glow}, 0 0 0 1px ${cl.color}20` : 'none',
        }}
      >
        {/* Holographic shimmer overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-300"
          style={{
            opacity: hovering ? 1 : 0,
            background: `radial-gradient(circle at ${shimmer.x} ${shimmer.y}, rgba(255,255,255,0.08) 0%, transparent 60%)`,
          }}
        />

        {/* Classification header bar */}
        <div
          className="flex items-center justify-between px-4 py-2 border-b"
          style={{
            borderColor: cl.color + '20',
            background: `linear-gradient(135deg, ${cl.color}0f, transparent)`,
          }}
        >
          <div className="flex items-center gap-1.5">
            <Lock size={9} style={{ color: cl.color }} />
            <span
              className="font-mono text-[8px] tracking-[0.25em] font-semibold"
              style={{ color: cl.color }}
            >
              {cl.label}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full animate-pulse" style={{ background: cl.color }} />
            <span className="font-mono text-[7px] text-text-muted">VERIFIED</span>
          </div>
        </div>

        {/* Certificate image */}
        <div className="relative bg-deep/50 overflow-hidden" style={{ aspectRatio: '16/9' }}>
          {cert.image_url ? (
            cert.image_url.endsWith('.pdf') ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                <ShieldCheck size={28} style={{ color: cl.color }} />
                <span className="text-[9px] font-mono" style={{ color: cl.color }}>CERTIFICATE (PDF)</span>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cert.image_url}
                alt={cert.title}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                style={{ filter: hovering ? 'brightness(1.1)' : 'brightness(0.9)' }}
                loading="lazy"
              />
            )
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <ShieldCheck size={32} style={{ color: cl.color, opacity: 0.4 }} />
              <span className="text-[9px] font-mono text-text-muted tracking-widest">NO IMAGE</span>
            </div>
          )}
          {/* Scan line on load */}
          {inView && (
            <motion.div
              className="absolute left-0 right-0 h-px pointer-events-none"
              style={{ background: `linear-gradient(90deg, transparent, ${cl.color}, transparent)` }}
              initial={{ top: '0%', opacity: 1 }}
              animate={{ top: '100%', opacity: 0 }}
              transition={{ duration: 0.8, delay: (index % 6) * 0.07 + 0.3, ease: 'linear' }}
            />
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-mono text-xs font-semibold text-text-primary mb-0.5 leading-snug line-clamp-2">
            {cert.title}
          </h3>
          <p className="text-[10px] text-text-muted mb-3 font-mono">{cert.issuer}</p>

          <div className="flex items-center justify-between">
            {cert.issued_date && (
              <span className="font-mono text-[9px] text-text-muted tracking-wider">
                {new Date(cert.issued_date).getFullYear()}
              </span>
            )}
            {cert.verify_url && (
              <a
                href={cert.verify_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[9px] font-mono transition-colors"
                style={{ color: cl.color }}
                onClick={e => e.stopPropagation()}
              >
                VERIFY <ExternalLink size={8} />
              </a>
            )}
          </div>
        </div>

        {/* Corner decoration */}
        <div
          className="absolute bottom-0 right-0 w-6 h-6"
          style={{
            background: `linear-gradient(135deg, transparent 50%, ${cl.color}15 50%)`,
          }}
        />
      </div>
    </motion.div>
  )
}

export function Certificates() {
  const [certs, setCerts] = useState<Certificate[]>([])
  const [active, setActive] = useState('All')
  const [loading, setLoading] = useState(true)
  const sectionRef = useRef<HTMLDivElement>(null)
  const inView = useInView(sectionRef, { once: true })

  useEffect(() => {
    async function loadCerts() {
      const supabase = createClient()
      const { data } = await supabase
        .from('certificates')
        .select('*')
        .order('sort_order', { ascending: true })
      if (data) setCerts(data as Certificate[])
      setLoading(false)
    }
    loadCerts()
  }, [])

  const filtered = active === 'All' ? certs : certs.filter(c => c.category === active)

  return (
    <section id="certificates" className="section" ref={sectionRef}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mb-12"
        >
          <p className="section-heading-tag">// TITLES_OBTAINED</p>
          <h2 className="section-heading">
            <span className="gradient-monarch">Certificates</span>
          </h2>
          <p className="text-text-muted text-xs font-mono mt-2 tracking-wider">
            {certs.length} credentials authenticated &middot; hover to reveal
          </p>
        </motion.div>

        {/* Category filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2 mb-10"
        >
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              data-cursor="hover"
              className={cn(
                'px-4 py-1.5 rounded-full font-mono text-xs border transition-all duration-300',
                active === cat
                  ? 'bg-monarch/12 border-monarch/40 text-monarch'
                  : 'bg-transparent border-border-shadow text-text-muted hover:text-text-secondary'
              )}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="glass rounded-xl animate-pulse" style={{ height: 240 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 glass rounded-2xl">
            <ShieldCheck size={40} className="mx-auto mb-4 text-text-muted" />
            <p className="text-text-muted font-mono text-xs tracking-wider">
              NO CLEARANCES IN THIS CATEGORY
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {filtered.map((cert, i) => (
              <CertCard key={cert.id} cert={cert} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
