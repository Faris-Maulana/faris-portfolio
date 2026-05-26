'use client'

import { useRef, useEffect, useState } from 'react'

export function HoloDivider({
  label,
  index,
  total,
}: {
  label: string
  index: number
  total: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.unobserve(el)
        }
      },
      { threshold: 0.5 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="relative flex items-center justify-center py-16 gap-4"
    >
      <div
        className="h-px flex-1"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.3) 50%, transparent 100%)',
          transform: visible ? 'scaleX(1)' : 'scaleX(0)',
          transformOrigin: 'center',
          transition:
            'transform 1s cubic-bezier(0.19,1,0.22,1) 0.2s',
        }}
      />
      <span
        className="text-xs font-mono tracking-[0.3em] uppercase whitespace-nowrap"
        style={{
          color: 'rgba(59,130,246,0.6)',
          opacity: visible ? 1 : 0,
          transition:
            'opacity 0.6s cubic-bezier(0.19,1,0.22,1) 0.4s',
        }}
      >
        {String(index).padStart(2, '0')} / {String(total).padStart(2, '0')}
        <span className="mx-3 text-[rgba(59,130,246,0.3)]">{'//'}</span>
        {label}
      </span>
      <div
        className="h-px flex-1"
        style={{
          background:
            'linear-gradient(270deg, transparent 0%, rgba(59,130,246,0.3) 50%, transparent 100%)',
          transform: visible ? 'scaleX(1)' : 'scaleX(0)',
          transformOrigin: 'center',
          transition:
            'transform 1s cubic-bezier(0.19,1,0.22,1) 0.2s',
        }}
      />
    </div>
  )
}
