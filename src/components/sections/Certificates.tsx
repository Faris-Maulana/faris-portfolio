'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Shield, Award } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { NeonBadge } from '@/components/ui/NeonBadge'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { Certificate } from '@/lib/supabase/types'

const CATEGORIES = ['All', 'AI/ML', 'Security', 'Engineering', 'Data'] as const

const categoryColor: Record<string, string> = {
  'AI/ML': 'violet',
  'Security': 'red',
  'Engineering': 'cyan',
  'Data': 'green',
  'Leadership': 'amber',
  'Other': 'muted',
}

export function Certificates() {
  const [certs, setCerts] = useState<Certificate[]>([])
  const [active, setActive] = useState('All')
  const [loading, setLoading] = useState(true)
  const { ref, inView, variants, itemVariants } = useScrollAnimation()

  useEffect(() => {
    async function fetch() {
      const supabase = createClient()
      const { data } = await supabase
        .from('certificates')
        .select('*')
        .order('sort_order', { ascending: true })
      if (data) setCerts(data as Certificate[])
      setLoading(false)
    }
    fetch()
  }, [])

  const filtered = active === 'All' ? certs : certs.filter(c => c.category === active)

  return (
    <section id="certificates" className="section">
      <div className="container" ref={ref}>
        <motion.div variants={variants} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
          <p className="section-heading-tag">{'// certifications.verified'}</p>
          <h2 className="section-heading">
            <span className="gradient-text">Certificates</span>
          </h2>
        </motion.div>

        <motion.div variants={variants} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={cn(
                'px-4 py-1.5 rounded-full font-mono text-xs border transition-all duration-300',
                active === cat
                  ? 'bg-cyan/15 border-cyan/40 text-cyan'
                  : 'bg-transparent border-border-glass text-text-muted hover:text-text-secondary'
              )}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-deep rounded w-2/3 mb-3" />
                <div className="h-3 bg-deep rounded w-1/2 mb-2" />
                <div className="h-3 bg-deep rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Award size={48} className="mx-auto mb-4 text-text-muted" />
            <p className="text-text-muted font-mono text-sm">No certificates yet. Upload via the certificates upload script.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((cert) => (
              <motion.div key={cert.id} variants={itemVariants} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
                <GlassCard className="h-full flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <NeonBadge color={categoryColor[cert.category] || 'muted'}>{cert.category}</NeonBadge>
                    {cert.featured && <Shield size={14} className="text-cyan" />}
                  </div>

                  <h3 className="font-display font-semibold text-sm text-text-primary mb-1">{cert.title}</h3>
                  <p className="text-xs text-text-secondary mb-3">{cert.issuer}</p>

                  {cert.image_url && (
                    <a
                      href={cert.verify_url || cert.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative aspect-[4/3] rounded-lg overflow-hidden mb-3 bg-deep block group"
                    >
                      {cert.image_url.endsWith('.pdf') ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-deep group-hover:bg-elevated transition-colors">
                          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ffb800" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                          </svg>
                          <span className="text-[10px] font-mono text-amber">View Certificate (PDF)</span>
                        </div>
                      ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={cert.image_url} alt={cert.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                      )}
                    </a>
                  )}

                  <div className="mt-auto flex items-center justify-between">
                    {cert.issued_date && (
                      <span className="text-[10px] font-mono text-text-muted">{cert.issued_date}</span>
                    )}
                    {cert.verify_url && (
                      <a
                        href={cert.verify_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-muted hover:text-cyan transition-colors"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
