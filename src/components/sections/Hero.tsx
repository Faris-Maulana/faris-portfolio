'use client'

import { useEffect, useRef } from 'react'
import { ChevronDown, Download } from 'lucide-react'
import { GithubIcon, LinkedinIcon } from '@/components/ui/Icons'
import { ParticleField } from '@/components/ui/ParticleField'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { SITE_CONFIG } from '@/lib/constants'

export function Hero() {
  const glitchRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()'
    let interval: ReturnType<typeof setInterval>

    const startDecode = () => {
      let iterations = 0
      const original = SITE_CONFIG.name

      interval = setInterval(() => {
        if (!glitchRef.current) return
        glitchRef.current.innerText = original
          .split('')
          .map((char, idx) => {
            if (char === ' ') return ' '
            if (idx < iterations) return original[idx] as string
            return chars[Math.floor(Math.random() * chars.length)]
          })
          .join('')

        if (iterations >= original.length) clearInterval(interval)
        iterations += 1 / 3
      }, 50)
    }

    startDecode()

    const bootLines = [
      '[BOOT] 0x7C00 — loading neural fabric kernel...',
      '[SYS]  CPU: quantum cores detected',
      '[NET]  synapse links established (43.2 Gbps)',
      '[SYS]  neural interface ready',
      '─'.repeat(36),
    ]

    if (subtitleRef.current) {
      subtitleRef.current.innerHTML = ''
      let lineIdx = 0
      let charIdx = 0
      let currentLine = ''

      const typeLine = () => {
        if (!subtitleRef.current) return
        if (lineIdx >= bootLines.length) return

        const line = bootLines[lineIdx]
        if (!line) return

        if (charIdx < line.length) {
          currentLine += line[charIdx]
          const lines = subtitleRef.current.querySelectorAll('.boot-line')
          if (lines.length > 0) {
            lines[lines.length - 1].innerHTML = currentLine + '<span class="term-cursor"></span>'
          }
          charIdx++
          setTimeout(typeLine, 16)
        } else {
          const lines = subtitleRef.current.querySelectorAll('.boot-line')
          if (lines.length > 0) {
            lines[lines.length - 1].innerHTML = line
          }
          lineIdx++
          charIdx = 0
          currentLine = ''
          if (lineIdx < bootLines.length) {
            const div = document.createElement('div')
            div.className = 'boot-line font-mono text-[10px] md:text-xs text-text-muted'
            subtitleRef.current.appendChild(div)
          }
          setTimeout(typeLine, 200)
        }
      }

      const firstLine = document.createElement('div')
      firstLine.className = 'boot-line font-mono text-[10px] md:text-xs text-text-muted'
      subtitleRef.current.appendChild(firstLine)
      typeLine()
    }

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <ParticleField />

      <div className="container relative z-10 text-center">
        <div className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-mono text-green border border-green/20 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
          SYSTEM ONLINE — accepting connections
        </div>

        <h1
          ref={glitchRef}
          data-text={SITE_CONFIG.name}
          className="glitch text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-6 gradient-text"
          style={{ minHeight: '1.2em' }}
        >
          {SITE_CONFIG.name}
        </h1>

        <p ref={subtitleRef} className="mb-8 max-w-xl mx-auto" style={{ minHeight: '6em' }} />

        <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
          <MagneticButton href="#projects" className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-full border border-cyan/40 text-cyan font-mono text-sm hover:bg-cyan/10 transition-all duration-300">
            <span className="text-cyan">$</span>
            explore_projects
          </MagneticButton>
          <MagneticButton
            href="https://jbcicirrzswhzfabjwiz.supabase.co/storage/v1/object/public/cv/cv/1779442019833-CV_Faris_Maulana_Details.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-full border border-amber/30 text-amber font-mono text-sm hover:bg-amber/10 transition-all duration-300"
          >
            <Download size={14} />
            download_cv
          </MagneticButton>
        </div>

        <div className="flex items-center justify-center gap-6">
          {[
            { icon: GithubIcon, href: SITE_CONFIG.github, label: 'GitHub' },
            { icon: LinkedinIcon, href: SITE_CONFIG.linkedin, label: 'LinkedIn' },
          ].map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-cyan transition-colors duration-300"
              aria-label={label}
            >
              <Icon size={18} />
            </a>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <ChevronDown size={20} className="text-text-muted animate-bounce" />
      </div>
    </section>
  )
}
