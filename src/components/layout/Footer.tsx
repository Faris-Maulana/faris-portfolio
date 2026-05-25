'use client'

import { motion } from 'framer-motion'
import { SITE_CONFIG } from '@/lib/constants'
import { GithubIcon, LinkedinIcon } from '@/components/ui/Icons'
import { Mail } from 'lucide-react'

// Simplified fiber network SVG — Jakarta as center node
function NetworkMap() {
  const nodes = [
    { id: 'jakarta', x: 200, y: 60, label: 'Jakarta / HQ', primary: true },
    { id: 'bogor',   x: 120, y: 110, label: 'Bogor' },
    { id: 'remote',  x: 300, y: 40,  label: 'Remote' },
    { id: 'tis',     x: 260, y: 100, label: 'TIS Network' },
    { id: 'imerit',  x: 340, y: 90,  label: 'iMerit' },
  ]
  const links = [
    ['jakarta','bogor'], ['jakarta','remote'], ['jakarta','tis'], ['jakarta','imerit']
  ]

  return (
    <svg viewBox="0 0 400 140" className="w-full max-w-md opacity-30">
      {links.map(([a, b], i) => {
        const na = nodes.find(n => n.id === a)!
        const nb = nodes.find(n => n.id === b)!
        return (
          <line key={i}
            x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
            stroke="#00f5ff" strokeWidth="0.5" strokeDasharray="3 4"
          />
        )
      })}
      {nodes.map(n => (
        <g key={n.id}>
          {n.primary && <circle cx={n.x} cy={n.y} r="8" fill="rgba(0,245,255,0.08)" stroke="#00f5ff" strokeWidth="0.5" />}
          <circle cx={n.x} cy={n.y} r={n.primary ? 4 : 2.5}
            fill={n.primary ? '#00f5ff' : 'rgba(0,245,255,0.4)'}
            style={n.primary ? { filter: 'drop-shadow(0 0 4px #00f5ff)' } : undefined}
          />
          <text x={n.x + 8} y={n.y + 4} fill="rgba(0,245,255,0.5)"
            fontSize="7" fontFamily="JetBrains Mono">{n.label}</text>
        </g>
      ))}
    </svg>
  )
}

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative border-t border-border-glass mt-0">
      {/* Top fiber line with pulse */}
      <div className="fiber-line absolute top-0 left-0 right-0" />

      <div className="container py-16">
        <div className="grid md:grid-cols-3 gap-12 items-center mb-12">

          {/* Identity */}
          <div>
            <div className="text-3xl font-display font-extrabold mb-2">
              <span className="neon-cyan">F</span>
              <span className="text-text-primary">M</span>
              <span className="neon-cyan text-lg">.</span>
            </div>
            <p className="text-text-muted text-xs font-mono leading-relaxed max-w-xs">
              AI Engineer building production intelligence systems
              on national fiber infrastructure.
            </p>
          </div>

          {/* Network map */}
          <div className="flex justify-center">
            <NetworkMap />
          </div>

          {/* Links */}
          <div className="flex flex-col items-end gap-4">
            <div className="flex items-center gap-4">
              {[
                { icon: GithubIcon,   href: SITE_CONFIG.github,                  label: 'GitHub' },
                { icon: LinkedinIcon, href: SITE_CONFIG.linkedin,                 label: 'LinkedIn' },
                { icon: Mail,         href: `mailto:${SITE_CONFIG.email}`,        label: 'Email' },
              ].map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.15 }}
                  data-cursor="hover"
                  className="text-text-muted hover:text-cyan transition-colors"
                  aria-label={label}
                >
                  <Icon size={16} />
                </motion.a>
              ))}
            </div>
            <a
              href={`mailto:${SITE_CONFIG.email}`}
              className="font-mono text-[10px] text-text-muted hover:text-cyan transition-colors tracking-wider"
              data-cursor="hover"
            >
              {SITE_CONFIG.email}
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border-glass">
          <p className="font-mono text-[9px] text-text-muted tracking-wider">
            &copy; {year} FARIS MAULANA &middot; BUILT WITH NEXT.JS + SUPABASE &middot; DEPLOYED ON VERCEL
          </p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
            <span className="font-mono text-[9px] text-text-muted">ALL SYSTEMS OPERATIONAL</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
