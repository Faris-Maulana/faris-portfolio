'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ParticleField } from '@/components/ui/ParticleField'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { Download, ArrowRight } from 'lucide-react'
import { GithubIcon, LinkedinIcon } from '@/components/ui/Icons'
import { SITE_CONFIG } from '@/lib/constants'
import { Mail } from 'lucide-react'

function GlitchDecoder({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState(() => text.split('').map(() => '█'))
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!'

  useEffect(() => {
    let iter = 0
    const total = text.length
    const interval = setInterval(() => {
      setDisplayed(text.split('').map((char, i) => {
        if (i < iter) return char
        if (char === ' ') return ' '
        return CHARS[Math.floor(Math.random() * CHARS.length)]
      }))
      if (iter >= total) clearInterval(interval)
      iter += 0.4
    }, 40)
    return () => clearInterval(interval)
  }, [text])

  return (
    <span
      data-text={text}
      className="glitch gradient-text inline-block font-display font-extrabold"
    >
      {displayed.join('')}
    </span>
  )
}

const ROLES = ['AI Engineer', 'RAG Architect', 'LLM Safety Researcher', 'Data Engineer', 'Smart Contract Auditor']

function TypingRoles() {
  const [roleIdx, setRoleIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [text, setText] = useState('')

  useEffect(() => {
    const role = ROLES[roleIdx]
    const timeout = setTimeout(() => {
      if (!deleting) {
        setText(role.slice(0, charIdx + 1))
        if (charIdx + 1 === role.length) setTimeout(() => setDeleting(true), 1800)
        else setCharIdx(c => c + 1)
      } else {
        setText(role.slice(0, charIdx - 1))
        if (charIdx === 0) {
          setDeleting(false)
          setRoleIdx(r => (r + 1) % ROLES.length)
        } else setCharIdx(c => c - 1)
      }
    }, deleting ? 35 : 70)
    return () => clearTimeout(timeout)
  }, [charIdx, deleting, roleIdx])

  return (
    <span className="text-cyan font-mono text-lg md:text-xl term-cursor">
      {text}
    </span>
  )
}

export function Hero() {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 60, damping: 18 })
  const sy = useSpring(my, { stiffness: 60, damping: 18 })

  const layer1x = useTransform(sx, [-0.5, 0.5], ['-12px', '12px'])
  const layer1y = useTransform(sy, [-0.5, 0.5], ['-8px', '8px'])
  const layer2x = useTransform(sx, [-0.5, 0.5], ['-6px', '6px'])
  const layer2y = useTransform(sy, [-0.5, 0.5], ['-4px', '4px'])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mx.set((e.clientX / window.innerWidth) - 0.5)
      my.set((e.clientY / window.innerHeight) - 0.5)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [mx, my])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden grid-bg">
      <ParticleField />

      <motion.div
        style={{ x: layer1x, y: layer1y }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
      >
        <div className="text-center">
          <div
            className="text-[clamp(5rem,14vw,12rem)] font-display font-extrabold leading-none select-none"
            style={{ opacity: 0.03, letterSpacing: '-0.04em' }}
            aria-hidden
          >
            FM
          </div>
        </div>
      </motion.div>

      <motion.div
        style={{ x: layer2x, y: layer2y }}
        className="absolute inset-0 pointer-events-none z-10"
      >
        {[30, 50, 70].map(pct => (
          <div
            key={pct}
            className="fiber-line absolute w-full"
            style={{ top: `${pct}%`, opacity: 0.15 }}
          />
        ))}
      </motion.div>

      <div className="container relative z-20 text-center">

        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, type: 'spring' }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2.5 glass rounded-full px-5 py-2 text-xs font-mono">
            <span className="relative flex w-2 h-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green opacity-75" />
              <span className="relative inline-flex rounded-full w-2 h-2 bg-green" />
            </span>
            <span className="text-text-secondary">Available for opportunities</span>
            <span className="w-px h-3 bg-border-glass" />
            <span className="neon-cyan">Jakarta / Remote</span>
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="mb-3"
        >
          <h1
            className="text-[clamp(3rem,9vw,8rem)] leading-none tracking-[-0.03em] mb-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <GlitchDecoder text="FARIS MAULANA" />
          </h1>
        </motion.div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.22,1,0.36,1] }}
          className="fiber-line w-48 mx-auto mb-6"
          style={{ transformOrigin: 'left' }}
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="h-8 mb-4 flex items-center justify-center"
        >
          <TypingRoles />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-text-secondary text-sm max-w-lg mx-auto mb-10 leading-relaxed font-mono"
        >
          {SITE_CONFIG.tagline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.4, type: 'spring' }}
          className="flex flex-wrap items-center justify-center gap-4 mb-12"
        >
          <MagneticButton
            href="#projects"
            className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-mono font-medium transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, rgba(0,245,255,0.12), rgba(0,245,255,0.06))',
              border: '1px solid rgba(0,245,255,0.35)',
              color: '#00f5ff',
            } as React.CSSProperties}
          >
            <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'radial-gradient(circle at center, rgba(0,245,255,0.1), transparent 70%)' }}
            />
            View Projects
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </MagneticButton>

          <MagneticButton
            href="https://jbcicirrzswhzfabjwiz.supabase.co/storage/v1/object/public/cv/cv/1779442019833-CV_Faris_Maulana_Details.pdf"
            download
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-mono font-medium border transition-all duration-300 hover:bg-amber/10"
            style={{ borderColor: 'rgba(255,184,0,0.35)', color: '#ffb800' } as React.CSSProperties}
          >
            <Download size={13} />
            Download CV
          </MagneticButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.6 }}
          className="flex items-center justify-center gap-8"
        >
          {[
            { icon: GithubIcon,   href: SITE_CONFIG.github,           label: 'GitHub' },
            { icon: LinkedinIcon, href: SITE_CONFIG.linkedin,          label: 'LinkedIn' },
            { icon: Mail,         href: `mailto:${SITE_CONFIG.email}`, label: 'Email' },
          ].map(({ icon: Icon, href, label }) => (
            <MagneticButton key={label} href={href} target="_blank" rel="noopener noreferrer"
              aria-label={label}
              className="flex flex-col items-center gap-1.5 text-text-muted hover:text-cyan transition-all duration-300 group"
            >
              <Icon size={18} className="group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-mono tracking-widest opacity-60 group-hover:opacity-100">{label}</span>
            </MagneticButton>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[9px] font-mono text-text-muted tracking-[0.3em] uppercase">scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-10 bg-gradient-to-b from-cyan/60 to-transparent"
        />
      </motion.div>
    </section>
  )
}
