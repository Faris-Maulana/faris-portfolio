'use client'

import { useEffect, useRef } from 'react'

/** A single composited ambient layer, with native CSS drift on touch devices. */
export function AmbientField() {
  const field = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = field.current
    const host = node?.parentElement
    if (!node || !host) return
    const precise = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let point = { x: 0, y: 0 }

    const paint = () => {
      frame = 0
      if (reduced.matches || !precise.matches) return
      node.style.setProperty('--ambient-x', `${point.x * 28}px`)
      node.style.setProperty('--ambient-y', `${point.y * 20}px`)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint) }
    const reset = () => {
      cancelAnimationFrame(frame)
      frame = 0
      point = { x: 0, y: 0 }
      delete node.dataset.pointerActive
      node.style.setProperty('--ambient-x', '0px')
      node.style.setProperty('--ambient-y', '0px')
    }
    const onPointer = (event: PointerEvent) => {
      if (!precise.matches || reduced.matches || event.pointerType === 'touch') return
      const bounds = host.getBoundingClientRect()
      point = {
        x: ((event.clientX - bounds.left) / bounds.width - 0.5) * 2,
        y: ((event.clientY - bounds.top) / bounds.height - 0.5) * 2,
      }
      node.dataset.pointerActive = 'true'
      schedule()
    }
    const onPreferenceChange = () => { if (reduced.matches || !precise.matches) reset() }
    host.addEventListener('pointermove', onPointer, { passive: true })
    host.addEventListener('pointerup', reset, { passive: true })
    host.addEventListener('pointercancel', reset, { passive: true })
    host.addEventListener('pointerleave', reset, { passive: true })
    host.addEventListener('touchend', reset, { passive: true })
    host.addEventListener('touchcancel', reset, { passive: true })
    window.addEventListener('blur', reset)
    precise.addEventListener('change', onPreferenceChange)
    reduced.addEventListener('change', onPreferenceChange)
    return () => {
      host.removeEventListener('pointermove', onPointer)
      host.removeEventListener('pointerup', reset)
      host.removeEventListener('pointercancel', reset)
      host.removeEventListener('pointerleave', reset)
      host.removeEventListener('touchend', reset)
      host.removeEventListener('touchcancel', reset)
      window.removeEventListener('blur', reset)
      precise.removeEventListener('change', onPreferenceChange)
      reduced.removeEventListener('change', onPreferenceChange)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div ref={field} className="ambient-field" aria-hidden>
      <span className="ambient-aura" />
      <span className="ambient-route ambient-route-a" />
      <span className="ambient-route ambient-route-b" />
      <span className="ambient-packet ambient-packet-a" />
      <span className="ambient-packet ambient-packet-b" />
    </div>
  )
}
