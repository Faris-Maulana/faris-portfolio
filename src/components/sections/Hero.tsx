'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ParticleField } from '@/components/ui/ParticleField'
import { Download, ArrowDown } from 'lucide-react'
import { GithubIcon, LinkedinIcon } from '@/components/ui/Icons'
import { Mail } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/constants'

function KineticName({ text }: { text: string }) {
  const words = text.split(' ')
  return (
    <h1 className="nameplate gradient-monarch" style={{ filter: 'drop-shadow(0 0 60px rgba(168,85,247,0.25))' }}>
      {words.map((word, wi) => (
        <span key={wi} className="kinetic-word in" style={{ marginRight: wi < words.length - 1 ? '0.3em' : 0 }}>
          {word.split('').map((char, ci) => (
            <span
              key={ci}
              style={{ transitionDelay: `${800 + (wi * word.length + ci) * 60}ms` }}
            >
              {char}
            </span>
          ))}
        </span>
      ))}
    </h1>
  )
}

function EditorialSubtitle({ phrases }: { phrases: string[] }) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % phrases.length), 3500)
    return () => clearInterval(t)
  }, [phrases.length])
  return (
    <div className="h-8 overflow-hidden relative">
      {phrases.map((p, i) => (
        <motion.p
          key={i}
          className="editorial text-xl md:text-2xl text-monarch-hi absolute inset-0 flex items-center justify-center"
          initial={false}
          animate={{
            y: i === idx ? 0 : (i < idx ? -30 : 30),
            opacity: i === idx ? 1 : 0,
          }}
          transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}
        >
          &ldquo;{p}&rdquo;
        </motion.p>
      ))}
    </div>
  )
}

export function Hero() {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 50, damping: 20 })
  const sy = useSpring(my, { stiffness: 50, damping: 20 })

  const layer1x = useTransform(sx, [-0.5, 0.5], ['-20px', '20px'])
  const layer1y = useTransform(sy, [-0.5, 0.5], ['-12px', '12px'])
  const layer2x = useTransform(sx, [-0.5, 0.5], ['-8px', '8px'])
  const layer2y = useTransform(sy, [-0.5, 0.5], ['-5px', '5px'])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5)
      my.set(e.clientY / window.innerHeight - 0.5)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [mx, my])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-abyss">
      <ParticleField />

      <motion.div
        style={{ x: layer1x, y: layer1y }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1]"
      >
        <svg
          width="900" height="900" viewBox="0 0 900 900"
          className="magic-circle"
          style={{ opacity: 0.12, filter: 'drop-shadow(0 0 80px rgba(168,85,247,0.4))' }}
        >
          <circle cx="450" cy="450" r="420" fill="none" stroke="rgba(168,85,247,0.5)" strokeWidth="0.5" strokeDasharray="2 12" />
          <circle cx="450" cy="450" r="380" fill="none" stroke="rgba(168,85,247,0.4)" strokeWidth="0.5" strokeDasharray="1 20" />
          <circle cx="450" cy="450" r="340" fill="none" stroke="rgba(168,85,247,0.3)" strokeWidth="0.8" />
          <circle cx="450" cy="450" r="280" fill="none" stroke="rgba(168,85,247,0.25)" strokeWidth="0.5" strokeDasharray="6 6" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
            <line key={deg} x1="450" y1="450" x2="450" y2="120"
              stroke="rgba(168,85,247,0.18)" strokeWidth="0.5"
              transform={`rotate(${deg} 450 450)`} />
          ))}
        </svg>
      </motion.div>

      <motion.div
        style={{ x: layer2x, y: layer2y }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-[2]"
      >
        <svg
          width="500" height="500" viewBox="0 0 500 500"
          className="magic-circle-rev"
          style={{ opacity: 0.18 }}
        >
          <circle cx="250" cy="250" r="220" fill="none" stroke="rgba(168,85,247,0.6)" strokeWidth="0.5" strokeDasharray="3 6" />
          <circle cx="250" cy="250" r="180" fill="none" stroke="rgba(168,85,247,0.4)" strokeWidth="0.5" />
          {[0, 60, 120, 180, 240, 300].map(deg => (
            <g key={deg} transform={`rotate(${deg} 250 250) translate(250 40)`}>
              <rect x="-3" y="-3" width="6" height="6" fill="rgba(168,85,247,0.6)" transform="rotate(45)" />
            </g>
          ))}
        </svg>
      </motion.div>

      <div className="relative z-10 text-center px-6 max-w-5xl">

        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 4.4 }}
          className="inline-flex items-center gap-3 mb-10"
        >
          <span className="font-mono text-[10px] text-monarch-hi tracking-[0.4em] uppercase opacity-80">
            ◆ Shadow Architect
          </span>
        </motion.div>

        <div className="mb-6">
          <KineticName text="FARIS MAULANA" />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 5.5 }}
          className="mb-12"
        >
          <EditorialSubtitle phrases={[
            'Build in the shadows.',
            'Command the agents.',
            'Engineer the unseen.',
            'Architect of intelligence.',
          ]} />
        </motion.div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 5.8, ease: [0.22,1,0.36,1] }}
          className="dagger-line w-64 mx-auto mb-12"
          style={{ transformOrigin: 'center' }}
        />

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 6 }}
          className="text-text-secondary text-sm md:text-base max-w-xl mx-auto leading-relaxed mb-12 font-mono"
        >
          {SITE_CONFIG.tagline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 6.3 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-16"
        >
          <a
            href="#projects"
            data-cursor="hover"
            className="group relative inline-flex items-center gap-3 px-8 py-3.5 font-mono text-xs tracking-[0.2em] uppercase clip-dagger transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(124,58,237,0.08))',
              border: '1px solid rgba(168,85,247,0.4)',
              color: '#c084fc',
            }}
          >
            <span className="relative z-10">View Domain</span>
            <ArrowDown size={13} className="group-hover:translate-y-0.5 transition-transform" />
            <span className="absolute inset-0 bg-monarch/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>

          <a
            href="/cv"
            download
            data-cursor="hover"
            className="inline-flex items-center gap-3 px-8 py-3.5 font-mono text-xs tracking-[0.2em] uppercase clip-dagger transition-all duration-300 hover:bg-crown/10"
            style={{
              border: '1px solid var(--color-border-crown)',
              color: 'var(--color-crown)',
            }}
          >
            <Download size={13} />
            Manifesto
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 6.6 }}
          className="flex items-center justify-center gap-10"
        >
          {[
            { icon: GithubIcon,   href: SITE_CONFIG.github,           label: 'GitHub' },
            { icon: LinkedinIcon, href: SITE_CONFIG.linkedin,          label: 'LinkedIn' },
            { icon: Mail,         href: `mailto:${SITE_CONFIG.email}`, label: 'Summon' },
          ].map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="hover"
              className="group flex flex-col items-center gap-1.5 text-text-muted hover:text-monarch transition-colors duration-300"
            >
              <Icon size={16} className="group-hover:scale-110 transition-transform" />
              <span className="text-[8px] font-mono tracking-[0.3em] uppercase opacity-50 group-hover:opacity-100">
                {label}
              </span>
            </a>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 7 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
      >
        <span className="font-mono text-[9px] text-monarch-hi/40 tracking-[0.4em] uppercase">descend</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-12 bg-gradient-to-b from-monarch/60 to-transparent"
        />
      </motion.div>

      <div className="absolute inset-y-0 left-8 w-px bg-gradient-to-b from-transparent via-monarch/15 to-transparent" />
      <div className="absolute inset-y-0 right-8 w-px bg-gradient-to-b from-transparent via-monarch/15 to-transparent" />
    </section>
  )
}
