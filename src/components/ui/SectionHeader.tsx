'use client'

import type { ReactNode } from 'react'
import { Reveal, RevealLines } from '@/components/ui/Reveal'
import { cn } from '@/lib/utils'

/**
 * The single heading treatment used by every section.
 *
 * Consistency here is what makes eight independently-built sections read as
 * one publication: same index numeral, same rule, same optical rhythm between
 * eyebrow, headline and lead.
 */
export function SectionHeader({
  index,
  label,
  title,
  lead,
  meta,
  align = 'left',
  className,
}: {
  index: string
  label: string
  title: ReactNode[]
  lead?: ReactNode
  meta?: ReactNode
  align?: 'left' | 'center'
  className?: string
}) {
  return (
    <header
      className={cn(
        'relative',
        align === 'center' && 'text-center flex flex-col items-center',
        className
      )}
    >
      <Reveal className="flex items-baseline gap-4 mb-7 w-full">
        <span className="t-label text-signal tnum">{index}</span>
        <span className="h-px flex-1 bg-line" />
        <span className="t-label">{label}</span>
        {meta ? <span className="t-label hidden sm:inline">{meta}</span> : null}
      </Reveal>

      <h2 className="t-h2 text-ink">
        <RevealLines lines={title} />
      </h2>

      {lead ? (
        <Reveal
          as="p"
          delay={140}
          className={cn(
            't-lead mt-6 max-w-[54ch]',
            align === 'center' && 'mx-auto'
          )}
        >
          {lead}
        </Reveal>
      ) : null}
    </header>
  )
}
