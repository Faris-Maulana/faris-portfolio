import type { ReactNode } from 'react'
import { Reveal, RevealLines } from '@/components/ui/Reveal'
import { cn } from '@/lib/utils'

export function SectionHeader({ label, title, lead, meta, index, className }: {
  label: string
  title: ReactNode[]
  lead?: ReactNode
  meta?: ReactNode
  index?: string
  className?: string
}) {
  return (
    <header className={cn('relative grid gap-7 lg:grid-cols-12 lg:gap-10', className)}>
      <Reveal className="lg:col-span-3">
        <div className="flex items-center gap-3 lg:block">
          {index ? <span className="t-meta text-signal">{index}</span> : null}
          <p className="kicker lg:mt-3">{label}</p>
          {meta ? <p className="t-meta mt-3">{meta}</p> : null}
        </div>
      </Reveal>
      <div className="lg:col-span-9">
        <h2 className="t-h2 text-ink"><RevealLines lines={title} /></h2>
        {lead ? <Reveal as="p" className="t-lead mt-7 max-w-3xl" delay={100}>{lead}</Reveal> : null}
      </div>
    </header>
  )
}
