'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'

let lenis: Lenis | null = null

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Scroll hijacking is exactly what "reduced motion" asks us not to do.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const instance = new Lenis({
      duration: 1.05,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    })
    lenis = instance

    // The previous implementation stored only the first frame id, so cleanup
    // cancelled a frame that had already fired and the loop ran for the life
    // of the tab. Tracking the live id is what actually stops it.
    let frame = 0
    const tick = (time: number) => {
      instance.raf(time)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      instance.destroy()
      if (lenis === instance) lenis = null
    }
  }, [])

  return <>{children}</>
}

export function getLenis() {
  return lenis
}
