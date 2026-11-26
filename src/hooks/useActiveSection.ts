'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { usePathname } from 'next/navigation'
import { NAV_LINKS } from '@/lib/constants'

const SECTION_IDS = NAV_LINKS.flatMap(link => link.href.startsWith('#') ? [link.href.slice(1)] : [])

let active = ''
const listeners = new Set<() => void>()
let frame = 0
let listening = false

function read() {
  frame = 0
  let next = ''

  if (window.location.pathname === '/') {
    const sections = SECTION_IDS.flatMap(id => {
      const element = document.getElementById(id)
      return element ? [{ id, element }] : []
    })

    if (sections.length) {
      const rootStyle = window.getComputedStyle(document.documentElement)
      const targetStyle = window.getComputedStyle(sections[0].element)
      const activationLine = (Number.parseFloat(rootStyle.scrollPaddingTop) || 0)
        + (Number.parseFloat(targetStyle.scrollMarginTop) || 0)
        + 1

      for (const { id, element } of sections) {
        if (element.getBoundingClientRect().top <= activationLine) next = id
      }
    }
  }

  if (next === active) return
  active = next
  listeners.forEach(listener => listener())
}

function schedule() {
  if (frame) return
  frame = requestAnimationFrame(read)
}

function start() {
  if (listening) return
  listening = true
  read()
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule, { passive: true })
}

function stop() {
  if (!listening || listeners.size) return
  listening = false
  cancelAnimationFrame(frame)
  frame = 0
  window.removeEventListener('scroll', schedule)
  window.removeEventListener('resize', schedule)
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  start()
  return () => { listeners.delete(listener); stop() }
}

export function useActiveSection() {
  const pathname = usePathname()

  useEffect(() => {
    schedule()
  }, [pathname])

  return useSyncExternalStore(subscribe, () => pathname === '/' ? active : '', () => '')
}
