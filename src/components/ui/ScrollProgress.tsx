'use client'

import { useEffect, useRef } from 'react'

/**
 * Hairline reading-progress bar.
 *
 * Driven by transform on a rAF tick rather than React state + width. Animating
 * `width` forces layout on every scroll frame; `scaleX` stays on the compositor
 * and the component never re-renders.
 */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    let queued = false

    const paint = () => {
      queued = false
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0
      if (bar.current) bar.current.style.transform = `scaleX(${p})`
    }

    const onScroll = () => {
      if (queued) return
      queued = true
      raf = requestAnimationFrame(paint)
    }

    paint()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      className="fixed top-0 inset-x-0 h-px z-[9996] pointer-events-none"
      aria-hidden
    >
      <div
        ref={bar}
        className="h-full origin-left"
        style={{
          transform: 'scaleX(0)',
          background:
            'linear-gradient(90deg, var(--color-signal), var(--color-agent))',
          boxShadow: '0 0 12px rgba(92,242,192,0.5)',
        }}
      />
    </div>
  )
}
