'use client'

import { useCallback, useEffect, useRef, type PointerEvent, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Pointer-reactive depth with rAF coalescing and touch-native tactile states. */
export function TiltCard({ children, className, max = 2.5 }: {
  children: ReactNode
  className?: string
  max?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const bounds = useRef<DOMRect | null>(null)
  const point = useRef({ x: 0, y: 0 })
  const reset = useCallback(() => {
    cancelAnimationFrame(frame.current)
    frame.current = 0
    bounds.current = null
    const node = ref.current
    if (!node) return
    delete node.dataset.pointerActive
    delete node.dataset.pressed
    node.style.setProperty('--rx', '0deg')
    node.style.setProperty('--ry', '0deg')
  }, [])

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => { if (reduced.matches) reset() }
    reduced.addEventListener('change', onChange)
    window.addEventListener('blur', reset)
    return () => {
      reduced.removeEventListener('change', onChange)
      window.removeEventListener('blur', reset)
      cancelAnimationFrame(frame.current)
    }
  }, [reset])

  const paint = () => {
    frame.current = 0
    const node = ref.current
    const rect = bounds.current
    if (!node || !rect || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const x = Math.max(0, Math.min(point.current.x / rect.width, 1))
    const y = Math.max(0, Math.min(point.current.y / rect.height, 1))
    if (node.dataset.pointerActive === 'true') {
      node.style.setProperty('--ry', `${(x - 0.5) * max * 2}deg`)
      node.style.setProperty('--rx', `${(0.5 - y) * max * 2}deg`)
    }
    node.style.setProperty('--gx', `${point.current.x - 128}px`)
    node.style.setProperty('--gy', `${point.current.y - 128}px`)
  }
  const schedule = () => { if (!frame.current) frame.current = requestAnimationFrame(paint) }

  const onEnter = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch' || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !ref.current) return
    bounds.current = ref.current.getBoundingClientRect()
    ref.current.dataset.pointerActive = 'true'
  }
  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!bounds.current) onEnter(event)
    if (!bounds.current) return
    point.current = { x: event.clientX - bounds.current.left, y: event.clientY - bounds.current.top }
    schedule()
  }
  const onDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!ref.current) return
    ref.current.dataset.pressed = 'true'
    if (event.pointerType !== 'touch' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    bounds.current = ref.current.getBoundingClientRect()
    point.current = { x: event.clientX - bounds.current.left, y: event.clientY - bounds.current.top }
    schedule()
  }
  const onUp = () => reset()
  return (
    <div
      ref={ref}
      onPointerEnter={onEnter}
      onPointerMove={onMove}
      onPointerDown={onDown}
      onPointerUp={onUp}
      onPointerCancel={reset}
      onPointerLeave={reset}
      onTouchEnd={reset}
      onTouchCancel={reset}
      className={cn('tilt', className)}
    >
      <span className="tilt-glare" aria-hidden />
      {children}
    </div>
  )
}
