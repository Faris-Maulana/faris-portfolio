'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowUpRight, Download, Menu, X } from 'lucide-react'
import { NAV_LINKS, SITE_CONFIG } from '@/lib/constants'
import { useActiveSection } from '@/hooks/useActiveSection'
import { cn } from '@/lib/utils'

export function Navbar() {
  const pathname = usePathname()
  const active = useActiveSection()
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const href = (anchor: string) => pathname === '/' ? anchor : `/${anchor}`

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [open])

  const openMenu = () => {
    dialog.current?.showModal()
    setOpen(true)
  }
  const closeMenu = () => dialog.current?.close()

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-canvas/90 backdrop-blur-md">
      <div className="container flex h-20 items-center gap-6">
        <Link href="/" className="group flex items-center gap-3" title="Faris Maulana, home">
          <span className="grid h-9 w-9 place-items-center border border-signal font-display text-sm font-bold text-signal transition-colors group-hover:bg-signal group-hover:text-on-signal">FM</span>
          <span className="hidden sm:block"><span className="block font-display text-sm font-semibold text-ink">Faris Maulana</span><span className="t-meta block">AI engineering / Jakarta</span></span>
          <span className="sr-only">Home</span>
        </Link>

        <nav className="ml-auto hidden items-center gap-6 lg:flex" aria-label="Primary navigation">
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={href(link.href)} aria-current={active === link.href.slice(1) ? 'location' : undefined} className={cn('link-draw py-3 text-sm font-semibold transition-colors', active === link.href.slice(1) ? 'text-signal' : 'text-ink-2 hover:text-ink')}>{link.label}</Link>
          ))}
        </nav>
        <div className="hidden xl:block"><a href={SITE_CONFIG.cvPath} download className="btn btn-ghost min-h-10 px-3 text-xs"><Download size={14} aria-hidden /> CV</a></div>
        <div className="ml-auto lg:hidden">
          <button ref={trigger} type="button" className="icon-btn" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="site-navigation" onClick={open ? closeMenu : openMenu}>
            {open ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
          </button>
        </div>
      </div>

      <dialog
        ref={dialog}
        id="site-navigation"
        aria-label="Site navigation"
        className="atlas-dialog m-0 h-[100dvh] max-h-none w-[min(24rem,100vw)] max-w-none rounded-none border-y-0 border-l p-0 lg:hidden"
        onClose={() => { setOpen(false); trigger.current?.focus() }}
        onClick={event => { if (event.target === event.currentTarget) closeMenu() }}
      >
        <div className="safe-top safe-x flex items-center justify-between border-b border-line">
          <span className="t-meta text-signal">Navigation index</span>
          <button type="button" className="icon-btn" aria-label="Close menu" onClick={closeMenu} autoFocus><X size={20} aria-hidden /></button>
        </div>
        <nav className="safe-x overflow-y-auto py-6" aria-label="Mobile navigation">
          <ol>
            {NAV_LINKS.map((link, index) => (
              <li key={link.href} className="border-b border-line">
                <Link href={href(link.href)} onClick={closeMenu} className="flex min-h-20 items-center gap-4 py-4 font-display text-2xl font-semibold text-ink">
                  <span className="t-meta text-signal">0{index + 1}</span><span className="flex-1">{link.label}</span><ArrowUpRight size={19} className="text-ink-3" aria-hidden />
                </Link>
              </li>
            ))}
          </ol>
          <a href={SITE_CONFIG.cvPath} download onClick={closeMenu} className="btn btn-primary mt-8 w-full"><Download size={17} aria-hidden /> Download executive CV</a>
          <p className="t-meta mt-8 leading-relaxed">{SITE_CONFIG.location}<br />{SITE_CONFIG.email}</p>
        </nav>
      </dialog>
    </header>
  )
}
