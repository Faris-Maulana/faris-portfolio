'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'

let lenis: Lenis | null = null

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const init = () => {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.5,
        wheelMultiplier: 1,
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

      return rafId
    }

    // If boot is active, wait for it to finish before creating Lenis
    if ((window as any).__bootLocked) {
      const wait = setInterval(() => {
        if (!(window as any).__bootLocked) {
          clearInterval(wait)
          const rafId = init()
          cleanupRef = () => {
            cancelAnimationFrame(rafId)
            lenis?.destroy()
            lenis = null
          }
        }
      }, 100)
      let cleanupRef = () => clearInterval(wait)
      return () => cleanupRef()
    }

    const rafId = init()
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
