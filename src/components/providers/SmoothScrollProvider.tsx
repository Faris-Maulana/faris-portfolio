'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'

let lenis: Lenis | null = null

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
      infinite: false,
    })

    lenis.on('scroll', (e: { scroll: number }) => {
      ;(window as any).__scrollY = e.scroll
    })

    function raf(time: number) {
      lenis?.raf(time)
      requestAnimationFrame(raf)
    }
    const rafId = requestAnimationFrame(raf)

    ;(window as any).__isMobile =
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: coarse)').matches

    return () => {
      cancelAnimationFrame(rafId)
      lenis?.destroy()
      lenis = null
    }
  }, [])

  return <>{children}</>
}

export function getLenis() {
  return lenis
}
