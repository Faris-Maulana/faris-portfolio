'use client'

import { useEffect, useRef } from 'react'

export function CustomCursor() {
  const dotRef   = useRef<HTMLDivElement>(null)
  const ringRef  = useRef<HTMLDivElement>(null)
  const trailsRef = useRef<HTMLDivElement[]>([])
  const pos = useRef({ x: -100, y: -100 })
  const ring = useRef({ x: -100, y: -100 })
  const raf  = useRef<number>(0)
  const TRAIL_COUNT = 8

  useEffect(() => {
    const trails: HTMLDivElement[] = []
    for (let i = 0; i < TRAIL_COUNT; i++) {
      const el = document.createElement('div')
      el.className = 'cursor-trail'
      el.style.opacity = String((1 - i / TRAIL_COUNT) * 0.4)
      el.style.width = el.style.height = `${Math.max(2, 5 - i * 0.5)}px`
      document.body.appendChild(el)
      trails.push(el)
    }
    trailsRef.current = trails

    const history: { x: number; y: number }[] = Array(TRAIL_COUNT).fill({ x: -100, y: -100 })

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
      const el = document.elementFromPoint(e.clientX, e.clientY)
      const hoverable = el?.closest('a, button, [data-cursor="hover"], input, textarea')
      ringRef.current?.classList.toggle('hovering', !!hoverable)
    }
    window.addEventListener('mousemove', onMove, { passive: true })

    const animate = () => {
      if (dotRef.current) {
        dotRef.current.style.left = `${pos.current.x}px`
        dotRef.current.style.top  = `${pos.current.y}px`
      }
      ring.current.x += (pos.current.x - ring.current.x) * 0.12
      ring.current.y += (pos.current.y - ring.current.y) * 0.12
      if (ringRef.current) {
        ringRef.current.style.left = `${ring.current.x}px`
        ringRef.current.style.top  = `${ring.current.y}px`
      }
      history.unshift({ x: pos.current.x, y: pos.current.y })
      history.length = TRAIL_COUNT
      trails.forEach((t, i) => {
        const h = history[i]
        t.style.left = `${h.x}px`
        t.style.top  = `${h.y}px`
      })
      raf.current = requestAnimationFrame(animate)
    }
    animate()

    const show = () => { if (dotRef.current) dotRef.current.style.opacity = '1' }
    const hide = () => { if (dotRef.current) dotRef.current.style.opacity = '0' }
    document.addEventListener('mouseenter', show)
    document.addEventListener('mouseleave', hide)

    return () => {
      cancelAnimationFrame(raf.current)
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseenter', show)
      document.removeEventListener('mouseleave', hide)
      trails.forEach(t => t.remove())
    }
  }, [])

  return (
    <>
      <div ref={dotRef}  className="cursor-dot"  style={{ opacity: 0 }} />
      <div ref={ringRef} className="cursor-ring" />
    </>
  )
}
