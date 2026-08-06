'use client'

import { useEffect, useState } from 'react'
import { NAV_LINKS } from '@/lib/constants'
import { cn } from '@/lib/utils'

/**
 * Fixed index rail down the right gutter.
 *
 * It answers two questions a long single-page site normally leaves unanswered:
 * how far in am I, and how much is left. A scroll bar shows the first but
 * carries no meaning; this shows both, and each tick is a jump target.
 *
 * Hidden below xl, where there is no gutter to put it in.
 */
export function SectionRail() {
  const [active, setActive] = useState('')
  const [hovered, setHovered] = useState<string | null>(null)

  useEffect(() => {
    const ids = NAV_LINKS.map(l => l.href.slice(1))
    let queued = false

    const read = () => {
      queued = false
      let current = ''
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.4) {
          current = id
        }
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

  return (
    <nav
      aria-label="Section index"
      className="fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-3 xl:flex"
    >
      {NAV_LINKS.map((link, i) => {
        const id = link.href.slice(1)
        const isActive = active === id
        const isHover = hovered === id
        const lit = isActive || isHover

        return (
          <a
            key={link.href}
            href={link.href}
            data-cursor="hover"
            aria-current={isActive ? 'true' : undefined}
            onMouseEnter={() => setHovered(id)}
            onMouseLeave={() => setHovered(null)}
            className="group flex h-5 items-center justify-end gap-2.5"
          >
            {/* Label rides in from the right only while lit, so the resting
                state stays a set of quiet ticks rather than a second menu. */}
            <span
              className={cn(
                'font-mono text-[10px] uppercase tracking-[0.16em] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]',
                lit
                  ? 'translate-x-0 opacity-100'
                  : 'pointer-events-none translate-x-2 opacity-0',
                isActive ? 'text-ink' : 'text-ink-3'
              )}
            >
              {link.label}
            </span>

            <span
              className={cn(
                'font-mono text-[9px] tabular-nums transition-colors duration-300',
                lit ? 'text-signal' : 'text-transparent'
              )}
              aria-hidden
            >
              {String(i + 1).padStart(2, '0')}
            </span>

            <span
              className={cn(
                'h-px transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
                isActive
                  ? 'w-6 bg-signal'
                  : isHover
                    ? 'w-4 bg-ink-2'
                    : 'w-2.5 bg-ink-4'
              )}
              aria-hidden
            />
          </a>
        )
      })}
    </nav>
  )
}
