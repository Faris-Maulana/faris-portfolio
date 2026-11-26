'use client'

import { usePathname } from 'next/navigation'
import { NAV_LINKS } from '@/lib/constants'
import { useActiveSection } from '@/hooks/useActiveSection'

export function SectionRail() {
  const active = useActiveSection()
  const pathname = usePathname()
  if (pathname !== '/') return null
  return (
    <nav className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 2xl:block" aria-label="Page sections">
      <ol className="space-y-3">
        {NAV_LINKS.map(link => {
          const id = link.href.slice(1)
          return (
            <li key={id}>
              <a href={link.href} aria-label={link.label} aria-current={active === id ? 'location' : undefined} className="group flex items-center justify-end gap-3 py-1">
                <span className="t-meta translate-x-2 bg-canvas px-2 py-1 opacity-0 transition-[transform,opacity] group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100">{link.label}</span>
                <span className={`block h-px w-8 origin-right transition-transform ${active === id ? 'scale-x-100 bg-signal' : 'scale-x-50 bg-line-3 group-hover:scale-x-75 group-hover:bg-ink-2'}`} aria-hidden />
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
