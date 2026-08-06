'use client'

import { createElement, type ElementType, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Declarative wrapper over the global reveal observer.
 * Staggering is expressed as a CSS custom property so no JS runs per item.
 *
 * Built with createElement rather than `<Tag>`: TypeScript cannot narrow the
 * props of a JSX tag whose type is a runtime variable, and every polymorphic
 * generic that fixes it costs more in complexity than this one call.
 */
export function Reveal({
  as = 'div',
  delay = 0,
  className,
  children,
  ...rest
}: {
  as?: ElementType
  delay?: number
  className?: string
  children: ReactNode
} & Record<string, unknown>) {
  return createElement(
    as,
    {
      ...rest,
      'data-reveal': '',
      className,
      style: { '--reveal-delay': `${delay}ms` } as React.CSSProperties,
    },
    children
  )
}

/**
 * Headline reveal: each line sits in an overflow-hidden track and slides up
 * from below the mask. Pass an array of strings, one per visual line, so the
 * break points are art-directed rather than left to the browser.
 */
export function RevealLines({
  lines,
  className,
  lineClassName,
  stagger = 90,
  delay = 0,
}: {
  lines: ReactNode[]
  className?: string
  lineClassName?: string
  stagger?: number
  delay?: number
}) {
  return (
    <span
      data-reveal=""
      className={cn('block', className)}
      style={{ '--reveal-delay': '0ms' } as React.CSSProperties}
    >
      {lines.map((line, i) => (
        <span key={i} className={cn('reveal-line', lineClassName)}>
          <span
            style={
              { '--reveal-delay': `${delay + i * stagger}ms` } as React.CSSProperties
            }
          >
            {line}
          </span>
        </span>
      ))}
    </span>
  )
}
