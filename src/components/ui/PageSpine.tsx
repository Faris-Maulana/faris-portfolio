'use client'

import { useEffect, useRef } from 'react'

export function PageSpine() {
  const pulseRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let offset = 0
    let raf: number

    const animate = () => {
      offset = (offset + 0.4) % 100
      if (pulseRef.current) {
        pulseRef.current.style.top = `${offset}%`
      }
      raf = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      className="fixed left-5 top-0 bottom-0 w-px pointer-events-none z-[5] hidden lg:block"
      style={{ background: 'linear-gradient(to bottom, transparent, rgba(168,85,247,0.06) 20%, rgba(168,85,247,0.06) 80%, transparent)' }}
    >
      <div
        ref={pulseRef}
        className="absolute left-0 w-full"
        style={{
          height: '8%',
          background: 'linear-gradient(to bottom, transparent, rgba(168,85,247,0.5), transparent)',
          borderRadius: '100%',
          filter: 'blur(1px)',
        }}
      />
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-monarch/30" />
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-monarch/30" />
    </div>
  )
}
