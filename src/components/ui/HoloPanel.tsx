'use client'

import { useRef, useEffect, useState } from 'react'

interface HoloPanelProps {
  children: React.ReactNode
  variant?: 'full' | 'compact' | 'overlay'
  glowColor?: 'blue' | 'purple' | 'cyan'
  className?: string
  style?: React.CSSProperties
  delay?: number
}

const GLOW_MAP = {
  blue: {
    border: 'rgba(59,130,246,0.2)',
    borderActive: 'rgba(59,130,246,0.5)',
    shadow: '0 0 0.3125rem rgba(59,130,246,0.3), 0 0 0.75rem rgba(59,130,246,0.1)',
  },
  purple: {
    border: 'rgba(168,85,247,0.2)',
    borderActive: 'rgba(168,85,247,0.5)',
    shadow: '0 0 0.3125rem rgba(168,85,247,0.3), 0 0 0.75rem rgba(168,85,247,0.1)',
  },
  cyan: {
    border: 'rgba(56,189,248,0.2)',
    borderActive: 'rgba(56,189,248,0.5)',
    shadow: '0 0 0.3125rem rgba(56,189,248,0.3), 0 0 0.75rem rgba(56,189,248,0.1)',
  },
}

export function HoloPanel({
  children,
  variant = 'full',
  glowColor = 'blue',
  className = '',
  style,
  delay = 0,
}: HoloPanelProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const glow = GLOW_MAP[glowColor]

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
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const variantStyles = {
    full: 'w-full',
    compact: 'w-full max-w-md',
    overlay: 'w-full h-full',
  }

  return (
    <div
      ref={ref}
      className={`relative ${variantStyles[variant]} ${className}`}
      style={{
        clipPath:
          'polygon(0% 0%, 96% 0%, 100% 4%, 100% 100%, 4% 100%, 0% 96%)',
        border: `1px solid ${glow.border}`,
        background: 'rgba(8,17,25,0.5)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: visible ? glow.shadow : 'none',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        filter: visible ? 'blur(0)' : 'blur(4px)',
        transition: `opacity 0.8s cubic-bezier(0.19,1,0.22,1) ${delay}ms, transform 0.8s cubic-bezier(0.19,1,0.22,1) ${delay}ms, filter 0.8s cubic-bezier(0.19,1,0.22,1) ${delay}ms, box-shadow 0.8s cubic-bezier(0.19,1,0.22,1) ${delay}ms`,
        ...style,
      }}
    >
      {children}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(59,130,246,0.03) 1px, rgba(59,130,246,0.03) 2px)',
          backgroundSize: '100% 2px',
          opacity: 0.04,
          mixBlendMode: 'overlay',
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(180deg, transparent 0%, ${glow.borderActive} 50%, transparent 100%)`,
          filter: 'blur(40px)',
          mixBlendMode: 'overlay',
        }}
      />
    </div>
  )
}
