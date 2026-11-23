import { createElement, type CSSProperties, type ElementType, type ReactNode } from 'react'

export function Reveal({ as = 'div', delay = 0, className, children, ...rest }: {
  as?: ElementType
  delay?: number
  className?: string
  children: ReactNode
} & Record<string, unknown>) {
  return createElement(as, {
    ...rest,
    'data-reveal': '',
    className,
    style: { '--reveal-delay': `${delay}ms` } as CSSProperties,
  }, children)
}

export function RevealLines({ lines, baseDelay = 0, step = 70 }: {
  lines: ReactNode[]
  baseDelay?: number
  step?: number
}) {
  return lines.map((line, i) => (
    <Reveal
      key={i}
      as="span"
      className="reveal-line"
      delay={baseDelay + i * step}
    >
      <span>{line}</span>
    </Reveal>
  ))
}
