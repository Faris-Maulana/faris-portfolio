'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download } from 'lucide-react'
import { NAV_LINKS } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [active, setActive] = useState('')
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 })
  const navRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      const sections = document.querySelectorAll('section[id]')
      let current = ''
      sections.forEach(s => { if (s.getBoundingClientRect().top < 160) current = s.id })
      setActive(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const btn = buttonRefs.current.get(active)
    const nav = navRef.current
    if (!btn || !nav) { setPillStyle({ left: 0, width: 0 }); return }
    const nr = nav.getBoundingClientRect()
    const br = btn.getBoundingClientRect()
    setPillStyle({ left: br.left - nr.left, width: br.width })
  }, [active])

  const handleNav = (href: string) => {
    setMobileOpen(false)
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <header className={cn('fixed top-0 inset-x-0 z-[100] transition-all duration-400',
        scrolled ? 'glass border-b border-border-glass py-0' : 'bg-transparent py-1'
      )}>
        <nav className="container flex items-center justify-between h-16">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-xl font-display font-bold group"
            data-cursor="hover"
          >
            <span className="text-monarch group-hover:animate-pulse">F</span>
            <span className="text-text-primary">M</span>
            <span className="text-monarch text-sm">.</span>
          </button>

          <div ref={navRef} className="hidden md:flex items-center gap-0.5 relative">
            <motion.div
              className="absolute top-1 bottom-1 rounded-lg pointer-events-none"
              style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)' }}
              animate={{ left: pillStyle.left, width: pillStyle.width, opacity: pillStyle.width > 0 ? 1 : 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            />
            {NAV_LINKS.map(link => (
              <button
                key={link.href}
                ref={el => { if (el) buttonRefs.current.set(link.href.replace('#',''), el) }}
                onClick={() => handleNav(link.href)}
                data-cursor="hover"
                className={cn(
                  'relative z-10 px-3.5 py-2 text-[11px] font-mono tracking-wider uppercase transition-colors duration-200',
                  active === link.href.replace('#','') ? 'text-monarch' : 'text-text-muted hover:text-text-secondary'
                )}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a href="https://jbcicirrzswhzfabjwiz.supabase.co/storage/v1/object/public/cv/cv/1779442019833-CV_Faris_Maulana_Details.pdf" download data-cursor="hover"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-mono border border-amber/30 text-amber hover:bg-amber/10 transition-all">
              <Download size={11} /> CV
            </a>
          </div>

          <button onClick={() => setMobileOpen(v => !v)} className="md:hidden text-text-secondary" data-cursor="hover">
            <div className="flex flex-col gap-1.5 w-5">
              <motion.div animate={{ rotate: mobileOpen ? 45 : 0, y: mobileOpen ? 8 : 0 }} className="h-px bg-current origin-center" />
              <motion.div animate={{ opacity: mobileOpen ? 0 : 1 }} className="h-px bg-current" />
              <motion.div animate={{ rotate: mobileOpen ? -45 : 0, y: mobileOpen ? -8 : 0 }} className="h-px bg-current origin-center" />
            </div>
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99] flex flex-col justify-center items-center"
            style={{ background: 'rgba(2,4,8,0.97)', backdropFilter: 'blur(20px)' }}
          >
            <div className="space-y-2 text-center">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                >
                  <button
                    onClick={() => handleNav(link.href)}
                    className="block text-3xl font-display font-bold text-text-secondary hover:text-monarch transition-colors py-2 w-full"
                    data-cursor="hover"
                  >
                    {link.label}
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
