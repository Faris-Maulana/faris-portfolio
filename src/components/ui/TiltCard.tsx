'use client'

import { useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Perspective tilt that follows the pointer.
 *
 * Writes four custom properties straight onto the element and lets CSS do the
 * easing, so a moving pointer costs no React renders. Disabled for touch
 * input, where there is no hover to follow, and for reduced motion via CSS.
 */
export function TiltCard({
  children,
  className,
  max = 5,
}: {
  children: ReactNode
  className?: string
  max?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    const s = ref.current.style
    s.setProperty('--ry', `${(x - 0.5) * max * 2}deg`)
    s.setProperty('--rx', `${(0.5 - y) * max * 2}deg`)
    s.setProperty('--mx', `${x * 100}%`)
    s.setProperty('--my', `${y * 100}%`)
  }

  const onLeave = () => {
    const s = ref.current?.style
    if (!s) return
    s.setProperty('--rx', '0deg')
    s.setProperty('--ry', '0deg')
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn('tilt relative', className)}
    >
      <span className="tilt-glare" aria-hidden />
      {children}
    </div>
  )
}
