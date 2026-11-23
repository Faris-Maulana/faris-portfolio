import type { ReactNode } from 'react'
import { Reveal, RevealLines } from '@/components/ui/Reveal'
import { cn } from '@/lib/utils'

export function SectionHeader({ label, title, lead, meta, className }: {
  label: string
  title: ReactNode[]
  lead?: ReactNode
  meta?: ReactNode
  className?: string
}) {
  return (
    <header className={cn('relative grid gap-7 lg:grid-cols-12 lg:gap-10', className)}>
      <Reveal className="lg:col-span-3">
        <div className="lg:pt-3">
          <p className="kicker">{label}</p>
          {meta ? <p className="t-meta mt-3 max-w-[24ch] leading-relaxed">{meta}</p> : null}
        </div>
      </Reveal>
      <div className="lg:col-span-9">
        <h2 className="t-h2 text-ink"><RevealLines lines={title} /></h2>
        {lead ? <Reveal as="p" className="t-lead mt-7 max-w-3xl" delay={100}>{lead}</Reveal> : null}
      </div>
    </header>
  )
}
