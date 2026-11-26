'use client'

import { useEffect } from 'react'

const THRESHOLD = 0.05
const ROOT_MARGIN = '0px 0px -30px 0px'
const WATCHDOG_MS = 800

/**
 * Progressive reveal with two independent visibility paths. The observer handles
 * the normal entry; a bounded viewport watchdog covers failed mobile observers.
 */
export function RevealProvider() {
  useEffect(() => {
    const root = document.documentElement
    const pending = new Set<HTMLElement>()
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0

    const finish = (element: HTMLElement) => {
      element.classList.add('is-in')
      element.dataset.revealState = 'visible'
      pending.delete(element)
      observer?.unobserve(element)
    }
    const revealAll = () => {
      document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(finish)
      pending.clear()
    }
    const nearViewport = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect()
      if (!rect.width && !rect.height) return false
      return rect.top <= window.innerHeight - 30 && rect.bottom >= 0 && rect.right >= 0 && rect.left <= window.innerWidth
    }
    const checkPending = () => {
      frame = 0
      const visible = [...pending].filter(nearViewport)
      visible.forEach(finish)
    }
    const scheduleCheck = () => { if (!frame) frame = requestAnimationFrame(checkPending) }

    const observer = !reduced.matches && typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(entries => {
          for (const entry of entries) {
            if (entry.isIntersecting) finish(entry.target as HTMLElement)
          }
        }, { threshold: THRESHOLD, rootMargin: ROOT_MARGIN })
      : null

    const register = (node: ParentNode) => {
      const elements = node instanceof HTMLElement && node.hasAttribute('data-reveal')
        ? [node, ...node.querySelectorAll<HTMLElement>('[data-reveal]')]
        : [...node.querySelectorAll<HTMLElement>('[data-reveal]')]
      for (const element of elements) {
        if (element.classList.contains('is-in') || pending.has(element)) continue
        if (reduced.matches || nearViewport(element)) {
          finish(element)
          continue
        }
        pending.add(element)
        observer?.observe(element)
      }
      scheduleCheck()
    }

    root.classList.add('reveal-ready')
    register(document)
    if (!observer) revealAll()
    const watchdog = window.setInterval(checkPending, WATCHDOG_MS)
    const mutations = new MutationObserver(records => {
      for (const record of records) {
        record.addedNodes.forEach(node => {
          if (node instanceof HTMLElement) register(node)
        })
      }
    })
    mutations.observe(document.getElementById('main') ?? document.body, { childList: true, subtree: true })

    const onMotionChange = () => {
      root.dataset.motion = reduced.matches ? 'reduced' : 'full'
      if (reduced.matches) revealAll()
    }
    onMotionChange()
    reduced.addEventListener('change', onMotionChange)
    window.addEventListener('scroll', scheduleCheck, { passive: true })
    window.addEventListener('resize', scheduleCheck, { passive: true })
    window.addEventListener('pageshow', scheduleCheck)
    return () => {
      observer?.disconnect()
      mutations.disconnect()
      window.clearInterval(watchdog)
      cancelAnimationFrame(frame)
      reduced.removeEventListener('change', onMotionChange)
      window.removeEventListener('scroll', scheduleCheck)
      window.removeEventListener('resize', scheduleCheck)
      window.removeEventListener('pageshow', scheduleCheck)
      root.classList.remove('reveal-ready')
    }
  }, [])

  return null
}
