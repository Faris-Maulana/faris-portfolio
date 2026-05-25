'use client'

import { useEffect, useRef } from 'react'
import { audioEngine } from '@/hooks/useAudioEngine'

export function CustomCursor() {
  const coreRef  = useRef<HTMLDivElement>(null)
  const ringRef  = useRef<HTMLDivElement>(null)
  const lightRef = useRef<HTMLDivElement>(null)
  const pos      = useRef({ x: -100, y: -100 })
  const ring     = useRef({ x: -100, y: -100 })
  const light    = useRef({ x: -100, y: -100 })
  const hovered  = useRef(false)
  const trailIdx = useRef(0)

  function spawnParticle(x: number, y: number) {
    const p = document.createElement('div')
    p.className = 'cursor-particle'
    p.style.left = `${x}px`
    p.style.top = `${y}px`
    document.body.appendChild(p)
    requestAnimationFrame(() => p.classList.add('out'))
    setTimeout(() => p.remove(), 600)
  }

  useEffect(() => {
    let throttle = 0
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
      const el = document.elementFromPoint(e.clientX, e.clientY)
      const isHover = !!el?.closest('a, button, [data-cursor="hover"], input, textarea')
      ringRef.current?.classList.toggle('hovering', isHover)
      if (isHover && !hovered.current) {
        hovered.current = true
        audioEngine.playHover()
      }
      if (!isHover) hovered.current = false
      throttle++
      if (throttle % 4 === 0) spawnParticle(e.clientX, e.clientY)
    }
    window.addEventListener('mousemove', onMove, { passive: true })

    const onClick = () => audioEngine.playClick()
    document.addEventListener('mousedown', onClick)

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
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mousedown', onClick)
    }
  }, [])

  return (
    <>
      <div ref={lightRef} className="cursor-light" />
      <div ref={ringRef}  className="cursor-ring" />
      <div ref={coreRef}  className="cursor-core" />
    </>
  )
}
