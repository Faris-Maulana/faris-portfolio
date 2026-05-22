'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Download } from 'lucide-react'
import { NAV_LINKS } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)

      const sections = document.querySelectorAll('section[id]')
      let current = ''
      sections.forEach((section) => {
        const top = section.getBoundingClientRect().top
        if (top < 200) current = section.id
      })
      setActiveSection(current)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNav = (href: string) => {
    setMobileOpen(false)
    const el = document.querySelector(href)
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-[100] transition-all duration-300',
        scrolled ? 'glass border-b border-border-glass' : 'bg-transparent'
      )}
    >
      <nav className="container flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-xl font-display font-bold">
          <span className="text-cyan">F</span>
          <span className="text-text-primary">M</span>
          <span className="text-cyan animate-pulse">.</span>
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNav(link.href)}
              className={cn(
                'px-3 py-2 text-xs font-mono rounded-lg transition-all',
                activeSection === link.href.replace('#', '')
                  ? 'text-cyan'
                  : 'text-text-muted hover:text-text-primary'
              )}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* CTA + Mobile Toggle */}
        <div className="flex items-center gap-3">
          <a
            href="#"
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

      {/* Mobile menu */}
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
                href="#"
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
