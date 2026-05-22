'use client'

import { motion } from 'framer-motion'
import { Mail, ChevronDown, Download } from 'lucide-react'
import { GithubIcon, LinkedinIcon } from '@/components/ui/Icons'
import { ParticleField } from '@/components/ui/ParticleField'
import { TerminalText } from '@/components/ui/TerminalText'
import { SITE_CONFIG } from '@/lib/constants'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <ParticleField />

      <div className="container relative z-10 text-center">
        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-mono text-green">
            <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
            Available for opportunities
          </span>
        </motion.div>

        {/* Name */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-4"
        >
          <span className="gradient-text">{SITE_CONFIG.name}</span>
        </motion.h1>

        {/* Typewriter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-xl md:text-2xl font-mono mb-4 h-8"
        >
          <TerminalText />
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-text-secondary text-sm md:text-base max-w-2xl mx-auto mb-8 leading-relaxed"
        >
          {SITE_CONFIG.tagline}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-12"
        >
          <a
            href="#projects"
            className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-full bg-cyan/10 border border-cyan/30 text-cyan font-mono text-sm hover:bg-cyan/20 transition-all duration-300"
          >
            <span className="absolute inset-0 rounded-full bg-cyan/5 blur-xl group-hover:blur-2xl transition-all" />
            View Projects
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-amber/30 text-amber font-mono text-sm hover:bg-amber/10 transition-all duration-300"
          >
            <Download size={14} />
            Download CV
          </a>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="flex items-center justify-center gap-6"
        >
          {[
            { icon: GithubIcon, href: SITE_CONFIG.github, label: 'GitHub' },
            { icon: LinkedinIcon, href: SITE_CONFIG.linkedin, label: 'LinkedIn' },
            { icon: Mail, href: `mailto:${SITE_CONFIG.email}`, label: 'Email' },
          ].map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-cyan transition-colors duration-300"
              aria-label={label}
            >
              <Icon size={20} />
            </a>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-text-muted"
        >
          <ChevronDown size={24} />
        </motion.div>
      </motion.div>
    </section>
  )
}
