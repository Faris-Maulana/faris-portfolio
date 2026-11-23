'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    let instance: Lenis | null = null
    let frame = 0
    const tick = (time: number) => {
      instance?.raf(time)
      frame = requestAnimationFrame(tick)
    }
    const configure = () => {
      instance?.destroy()
      instance = null
      cancelAnimationFrame(frame)
      if (preference.matches) return
      instance = new Lenis({ duration: 0.9, smoothWheel: true, touchMultiplier: 1.25 })
      frame = requestAnimationFrame(tick)
    }
    configure()
    preference.addEventListener('change', configure)
    return () => {
      preference.removeEventListener('change', configure)
      cancelAnimationFrame(frame)
      instance?.destroy()
    }
  }, [])

  return children
}
