'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Download } from 'lucide-react'
import { NAV_LINKS, SITE_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')

  /* Scroll state + active section, coalesced into a single rAF per frame.
     The previous implementation ran a full querySelectorAll + getBoundingClientRect
     loop on every scroll event, which is a forced reflow per event. */
  useEffect(() => {
    let queued = false

    const read = () => {
      queued = false
      setScrolled(window.scrollY > 24)

      let current = ''
      for (const section of document.querySelectorAll<HTMLElement>('section[id]')) {
        if (section.getBoundingClientRect().top <= 140) current = section.id
      }
      setActive(current)
    }

    const onScroll = () => {
      if (queued) return
      queued = true
      requestAnimationFrame(read)
    }

    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock the page while the mobile sheet is open.
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const go = (href: string) => {
    setOpen(false)
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <header
        className={cn(
          'fixed top-0 inset-x-0 z-[100] transition-[background,border-color,backdrop-filter] duration-500',
          scrolled
            ? 'border-b border-line bg-canvas/72 backdrop-blur-xl backdrop-saturate-150'
            : 'border-b border-transparent bg-transparent'
        )}
      >
        {/* Three independent tracks. The nav is absolutely centred so that a
            long brand or a wide action group can never push it into either. */}
        <nav className="container relative flex h-16 items-center justify-between gap-4">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            data-cursor="hover"
            className="group relative z-10 flex h-11 items-center gap-[3px] font-display text-lg font-extrabold tracking-tight"
            aria-label="Back to top"
          >
            <span className="text-ink">FM</span>
            <span className="h-1 w-1 rounded-full bg-signal transition-transform duration-300 group-hover:scale-150" />
          </button>

          <div className="pointer-events-none absolute inset-0 hidden items-center justify-center xl:flex">
            <div className="pointer-events-auto flex items-center gap-1">
              {NAV_LINKS.map(link => {
                const id = link.href.slice(1)
                const isActive = active === id
                return (
                  <button
                    key={link.href}
                    onClick={() => go(link.href)}
                    data-cursor="hover"
                    aria-current={isActive ? 'true' : undefined}
                    className={cn(
                      'relative px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors duration-300',
                      isActive ? 'text-ink' : 'text-ink-3 hover:text-ink-2'
                    )}
                  >
                    {link.label}
                    <span
                      className={cn(
                        'absolute inset-x-3 bottom-1 h-px origin-center bg-signal transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]',
                        isActive ? 'scale-x-100' : 'scale-x-0'
                      )}
                    />
                  </button>
                )
              })}
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2">
            <a
              href={SITE_CONFIG.cvPath}
              download
              data-cursor="hover"
              className="hidden min-h-10 items-center gap-2 rounded-full border border-line-2 px-4 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-2 transition-colors duration-300 hover:border-line-3 hover:text-ink sm:inline-flex"
            >
              <Download size={12} />
              CV
            </a>
            <button
              onClick={() => go('#contact')}
              data-cursor="hover"
              className="hidden min-h-10 items-center gap-1.5 rounded-full bg-ink px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-canvas transition-transform duration-300 hover:scale-[1.03] md:inline-flex"
            >
              Hire me
              <ArrowUpRight size={12} />
            </button>

            <button
              onClick={() => setOpen(v => !v)}
              data-cursor="hover"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              className="flex h-10 w-10 items-center justify-center xl:hidden"
            >
              <span className="flex w-5 flex-col gap-[5px]">
                <span
                  className={cn(
                    'h-px w-full origin-center bg-ink transition-transform duration-300',
                    open && 'translate-y-[3px] rotate-45'
                  )}
                />
                <span
                  className={cn(
                    'h-px w-full origin-center bg-ink transition-transform duration-300',
                    open && '-translate-y-[3px] -rotate-45'
                  )}
                />
              </span>
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="safe-top safe-bottom safe-x fixed inset-0 z-[99] flex flex-col justify-center bg-canvas/97 px-[var(--gutter)] backdrop-blur-2xl xl:hidden"
          >
            <nav className="flex flex-col">
              {NAV_LINKS.map((link, i) => (
                <motion.button
                  key={link.href}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: 0.04 + i * 0.045, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => go(link.href)}
                  className="group flex items-baseline justify-between border-b border-line py-4 text-left"
                >
                  <span className="t-h3 text-ink transition-colors group-hover:text-signal">
                    {link.label}
                  </span>
                  <span className="t-label tnum">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </motion.button>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.34 }}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              <a href={SITE_CONFIG.cvPath} download className="btn btn-ghost">
                <Download size={13} /> Download CV
              </a>
              <a href={`mailto:${SITE_CONFIG.email}`} className="btn btn-primary">
                Hire me <ArrowUpRight size={13} />
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
