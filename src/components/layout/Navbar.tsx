'use client'

import { useEffect, useRef, useState, type FocusEvent, type MouseEvent } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowUpRight, Download, Menu, X } from 'lucide-react'
import { NAV_LINKS, SITE_CONFIG } from '@/lib/constants'
import { useActiveSection } from '@/hooks/useActiveSection'
import { trackPortfolioEvent } from '@/lib/analytics'
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher'

export function Navbar() {
  const pathname = usePathname()
  const active = useActiveSection()
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const desktopNav = useRef<HTMLElement>(null)
  const pill = useRef<HTMLSpanElement>(null)
  const wasOpen = useRef(false)
  const closeTimer = useRef(0)
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const href = (path: string) => path.startsWith('#') && pathname !== '/' ? `/${path}` : path
  const current = (path: string) => path.startsWith('#')
    ? pathname === '/' && active === path.slice(1) ? 'location' as const : undefined
    : pathname === path ? 'page' as const : undefined

  const movePill = (target?: Element | null) => {
    const navigation = desktopNav.current
    const indicator = pill.current
    if (!navigation || !indicator) return
    const selected = target ?? navigation.querySelector('[aria-current]')
    if (!selected) {
      indicator.dataset.visible = 'false'
      return
    }
    const navBounds = navigation.getBoundingClientRect()
    const bounds = selected.getBoundingClientRect()
    indicator.style.transform = `translate3d(${bounds.left - navBounds.left}px, 0, 0) scaleX(${bounds.width})`
    indicator.dataset.visible = 'true'
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => movePill())
    const navigation = desktopNav.current
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => movePill()) : null
    if (navigation) observer?.observe(navigation)
    return () => {
      cancelAnimationFrame(frame)
      observer?.disconnect()
    }
  }, [active, pathname])

  useEffect(() => {
    const resetPill = () => movePill()
    window.addEventListener('blur', resetPill)
    return () => window.removeEventListener('blur', resetPill)
  }, [])

  useEffect(() => {
    if (!open) {
      if (!wasOpen.current) return
      wasOpen.current = false
      const target = trigger.current?.getClientRects().length
        ? trigger.current
        : desktopNav.current?.querySelector('a')
      target?.focus()
      return
    }
    wasOpen.current = true
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [open])

  useEffect(() => () => window.clearTimeout(closeTimer.current), [])

  const openMenu = () => {
    dialog.current?.showModal()
    setOpen(true)
  }
  const finishClose = () => dialog.current?.close()
  const closeMenu = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finishClose()
      return
    }
    setClosing(true)
    closeTimer.current = window.setTimeout(finishClose, 170)
  }
  const trackCv = (placement: 'navbar' | 'mobile_menu') => {
    trackPortfolioEvent({ name: 'cv_download', document: 'executive', placement })
  }
  const focusLink = (event: FocusEvent<HTMLAnchorElement>) => movePill(event.currentTarget)
  const hoverLink = (event: MouseEvent<HTMLAnchorElement>) => movePill(event.currentTarget)

  return (
    <header className="site-header">
      <div className="container">
        <div className="nav-frame">
          <Link href="/" className="nav-brand" title="Faris Maulana, home">
            <span className="nav-brand-mark">FM</span>
            <span className="hidden sm:block"><span className="block font-display text-sm font-semibold text-ink">Faris Maulana</span><span className="t-meta block">Signal cartography / AI systems</span></span>
            <span className="sr-only">Home</span>
          </Link>

          <nav ref={desktopNav} className="desktop-nav" aria-label="Primary navigation" onMouseLeave={() => movePill()} onBlur={event => {
            if (!event.currentTarget.contains(event.relatedTarget)) movePill()
          }}>
            <span ref={pill} className="nav-active-pill" data-visible="false" aria-hidden />
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={href(link.href)} prefetch={link.href === '/simpul' ? false : undefined} aria-current={current(link.href)} className="nav-link" onMouseEnter={hoverLink} onFocus={focusLink}>{link.label}</Link>
            ))}
          </nav>
          <div className="header-actions">
            <ThemeSwitcher compact />
            <a href={SITE_CONFIG.cvPath} download onClick={() => trackCv('navbar')} className="btn btn-ghost nav-cv"><Download size={14} aria-hidden /> CV</a>
          </div>
          <div className="mobile-actions lg:hidden">
            <ThemeSwitcher compact />
            <button ref={trigger} type="button" className="icon-btn" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="site-navigation" onClick={open ? closeMenu : openMenu}>
              {open ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
            </button>
          </div>
        </div>
      </div>

      <dialog
        ref={dialog}
        id="site-navigation"
        aria-label="Site navigation"
        className="mobile-drawer"
        data-closing={closing}
        data-lenis-prevent
        onClose={() => { setOpen(false); setClosing(false) }}
        onCancel={event => {
          event.preventDefault()
          closeMenu()
        }}
        onClick={event => { if (event.target === event.currentTarget) closeMenu() }}
      >
        <div className="safe-top safe-x flex min-h-20 items-center justify-between border-b border-line">
          <span className="t-meta text-signal">Navigation / 07 coordinates</span>
          <button type="button" className="icon-btn" aria-label="Close menu" onClick={closeMenu}><X size={20} aria-hidden /></button>
        </div>
        <nav className="mobile-drawer-links safe-x max-h-[calc(100dvh-5rem)] overflow-y-auto" aria-label="Mobile navigation">
          <ol>
            {NAV_LINKS.map((link, index) => (
              <li key={link.href}>
                <Link href={href(link.href)} prefetch={link.href === '/simpul' ? false : undefined} onClick={closeMenu} className="mobile-drawer-link">
                  <span className="t-meta text-signal">0{index + 1}</span><span className="flex-1">{link.label}</span><ArrowUpRight size={19} className="text-ink-3" aria-hidden />
                </Link>
              </li>
            ))}
          </ol>
          <a href={SITE_CONFIG.cvPath} download onClick={() => { trackCv('mobile_menu'); closeMenu() }} className="btn btn-primary mt-8 w-full"><Download size={17} aria-hidden /> Download executive CV</a>
          <p className="t-meta mt-8 leading-relaxed">{SITE_CONFIG.location}<br />{SITE_CONFIG.email}</p>
        </nav>
      </dialog>
    </header>
  )
}
