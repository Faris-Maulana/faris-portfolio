'use client'

import { useRef, type ReactNode, type AnchorHTMLAttributes, type ButtonHTMLAttributes } from 'react'

interface Props {
  children: ReactNode
  className?: string
  strength?: number
  onClick?: () => void
  href?: string
  type?: 'button' | 'submit' | 'reset'
  target?: string
  rel?: string
  download?: boolean
  'aria-label'?: string
  style?: React.CSSProperties
}

export function MagneticButton({ children, className = '', strength = 0.35, href, onClick, type, ...rest }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) * strength
    const dy = (e.clientY - cy) * strength
    el.style.transform = `translate(${dx}px, ${dy}px)`
  }

  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = 'translate(0, 0)'
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ display: 'inline-block', transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
    >
      {href ? (
        <a href={href} className={className} data-cursor="hover" {...rest as AnchorHTMLAttributes<HTMLAnchorElement>}>{children}</a>
      ) : (
        <button onClick={onClick} type={type} className={className} data-cursor="hover" {...rest as ButtonHTMLAttributes<HTMLButtonElement>}>{children}</button>
      )}
    </div>
  )
}
