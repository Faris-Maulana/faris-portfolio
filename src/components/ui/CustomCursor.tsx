'use client'

import { useEffect, useRef } from 'react'

export function CustomCursor() {
  const coreRef  = useRef<HTMLDivElement>(null)
  const ringRef  = useRef<HTMLDivElement>(null)
  const lightRef = useRef<HTMLDivElement>(null)
  const pos      = useRef({ x: -100, y: -100 })
  const ring     = useRef({ x: -100, y: -100 })
  const light    = useRef({ x: -100, y: -100 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
      const el = document.elementFromPoint(e.clientX, e.clientY)
      const hover = el?.closest('a, button, [data-cursor="hover"], input, textarea')
      ringRef.current?.classList.toggle('hovering', !!hover)
    }
    window.addEventListener('mousemove', onMove, { passive: true })

    let raf: number
    const tick = () => {
      if (coreRef.current) {
        coreRef.current.style.left = `${pos.current.x}px`
        coreRef.current.style.top  = `${pos.current.y}px`
      }
      ring.current.x += (pos.current.x - ring.current.x) * 0.15
      ring.current.y += (pos.current.y - ring.current.y) * 0.15
      if (ringRef.current) {
        ringRef.current.style.left = `${ring.current.x}px`
        ringRef.current.style.top  = `${ring.current.y}px`
      }
      light.current.x += (pos.current.x - light.current.x) * 0.06
      light.current.y += (pos.current.y - light.current.y) * 0.06
      if (lightRef.current) {
        lightRef.current.style.left = `${light.current.x}px`
        lightRef.current.style.top  = `${light.current.y}px`
      }
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('mousemove', onMove) }
  }, [])

  return (
    <>
      <div ref={lightRef} className="cursor-light" />
      <div ref={ringRef}  className="cursor-ring" />
      <div ref={coreRef}  className="cursor-core" />
    </>
  )
}
