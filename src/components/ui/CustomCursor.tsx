'use client'

import { useEffect, useRef } from 'react'

/**
 * Two-element cursor: a hard dot pinned to the pointer, and a ring that trails
 * behind it.
 *
 * Position is written straight to `style.transform` inside a rAF loop rather
 * than through React state. On a 120Hz pointer, state-driven tracking would
 * queue ~120 renders of the whole tree per second; this touches two DOM nodes
 * and never re-renders anything.
 */
export function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return

    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const trail = { ...pointer }
    let raf = 0
    let seen = false

    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX
      pointer.y = e.clientY

      if (!seen) {
        seen = true
        trail.x = pointer.x
        trail.y = pointer.y
        if (dot.current) dot.current.style.opacity = '1'
        if (ring.current) ring.current.style.opacity = '1'
      }

      const el = e.target as HTMLElement | null
      const interactive = !!el?.closest(
        'a, button, [data-cursor="hover"], input, textarea, select, [role="button"]'
      )
      ring.current?.setAttribute('data-active', String(interactive))
    }

    const hide = () => {
      seen = false
      if (dot.current) dot.current.style.opacity = '0'
      if (ring.current) ring.current.style.opacity = '0'
    }

    const loop = () => {
      // Eased follow, the lag reads as weight rather than latency.
      trail.x += (pointer.x - trail.x) * 0.16
      trail.y += (pointer.y - trail.y) * 0.16

      if (dot.current) {
        dot.current.style.transform =
          `translate3d(${pointer.x - 3}px, ${pointer.y - 3}px, 0)`
      }
      if (ring.current) {
        const r = ring.current.offsetWidth / 2
        ring.current.style.transform =
          `translate3d(${trail.x - r}px, ${trail.y - r}px, 0)`
      }
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', hide)
    raf = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', hide)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div ref={dot} className="cursor-dot" style={{ opacity: 0 }} aria-hidden />
      <div ref={ring} className="cursor-ring" style={{ opacity: 0 }} aria-hidden />
    </>
  )
}
