'use client'

import type { ReactNode } from 'react'
import { Reveal, RevealLines } from '@/components/ui/Reveal'
import { cn } from '@/lib/utils'

/**
 * The single heading treatment used by every section: a short survey-mark
 * label, an expanded headline, and an optional lead. No numbering; sections
 * are found by name, not by position.
 */
export function SectionHeader({
  label,
  title,
  lead,
  meta,
  className,
}: {
  label: string
  title: ReactNode[]
  lead?: ReactNode
  meta?: ReactNode
  className?: string
}) {
  return (
    <header className={cn('relative max-w-[62rem]', className)}>
      <Reveal className="mb-6 flex items-center gap-3">
        <span className="h-px w-6 bg-signal" aria-hidden />
        <span className="text-sm font-semibold text-ink">{label}</span>
        {meta ? <span className="t-meta">{meta}</span> : null}
      </Reveal>

      <h2 className="t-h2 text-ink">
        <RevealLines lines={title} />
      </h2>

      {lead ? (
        <Reveal as="p" delay={140} className="t-lead mt-6 max-w-[56ch]">
          {lead}
        </Reveal>
      ) : null}
    </header>
  )
}
