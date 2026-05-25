'use client'

import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X, Download } from 'lucide-react'
import { NAV_LINKS } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 })
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)

      const sections = document.querySelectorAll('section[id]')
      let current = ''
      sections.forEach((section) => {
        const top = section.getBoundingClientRect().top
        if (top < 250) current = section.id
      })
      setActiveSection(current)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!navRef.current || !activeSection) return
    const activeBtn = navRef.current.querySelector(`[data-section="${activeSection}"]`) as HTMLElement | null
    if (activeBtn) {
      const { offsetLeft, offsetWidth } = activeBtn
      setPillStyle({ left: offsetLeft, width: offsetWidth })
    }
  }, [activeSection])

  const handleNav = (href: string) => {
    setMobileOpen(false)
    const el = document.querySelector(href)
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'glass border-b border-border-glass' : 'bg-transparent'
      )}
    >
      <nav className="container flex items-center justify-between h-16 md:h-20">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-xl font-display font-bold relative z-10">
          <span className="text-cyan">F</span>
          <span className="text-text-primary">M</span>
          <span className="text-cyan" style={{ animation: 'neonPulse 2s ease-in-out infinite' }}>.</span>
        </button>

        <div ref={navRef} className="hidden md:flex items-center gap-1 relative">
          <motion.div
            className="absolute top-0 h-full rounded-lg bg-cyan/8 border border-cyan/15"
            animate={{ left: pillStyle.left, width: pillStyle.width }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ pointerEvents: 'none' }}
          />
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              data-section={link.href.replace('#', '')}
              onClick={() => handleNav(link.href)}
              className={cn(
                'px-3 py-2 text-xs font-mono rounded-lg transition-all relative z-10',
                activeSection === link.href.replace('#', '')
                  ? 'text-cyan'
                  : 'text-text-muted hover:text-text-primary'
              )}
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://jbcicirrzswhzfabjwiz.supabase.co/storage/v1/object/public/cv/cv/1779442019833-CV_Faris_Maulana_Details.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber/30 text-amber font-mono text-xs hover:bg-amber/10 transition-all"
          >
            <Download size={12} />
            CV
          </a>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-text-primary"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-b border-border-glass"
          >
            <div className="container py-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNav(link.href)}
                  className={cn(
                    'block w-full text-left px-4 py-2 rounded-lg text-sm font-mono transition-all',
                    activeSection === link.href.replace('#', '')
                      ? 'text-cyan bg-cyan/5'
                      : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                  )}
                >
                  {link.label}
                </button>
              ))}
              <a
                href="https://jbcicirrzswhzfabjwiz.supabase.co/storage/v1/object/public/cv/cv/1779442019833-CV_Faris_Maulana_Details.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-amber font-mono text-sm"
              >
                <Download size={14} />
                Download CV
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
