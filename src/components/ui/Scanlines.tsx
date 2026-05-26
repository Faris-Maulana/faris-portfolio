'use client'

export function Scanlines({ opacity = 0.04, className = '' }: { opacity?: number; className?: string }) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        backgroundImage:
          'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(59,130,246,0.03) 1px, rgba(59,130,246,0.03) 2px)',
        backgroundSize: '100% 2px',
        opacity,
        mixBlendMode: 'overlay',
      }}
    />
  )
}
