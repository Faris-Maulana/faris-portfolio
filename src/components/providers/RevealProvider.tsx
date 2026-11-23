'use client'

import { useEffect } from 'react'

/** Progressive enhancement only: content is visible before and without this. */
export function RevealProvider() {
  useEffect(() => {
    const root = document.documentElement
    const revealAll = () => {
      document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(el => el.classList.add('is-in'))
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduced.matches || typeof IntersectionObserver === 'undefined') {
      revealAll()
      return
    }

    const observed = new WeakSet<Element>()
    const io = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-in')
        io.unobserve(entry.target)
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' })

    const register = (node: ParentNode) => {
      const elements = node instanceof HTMLElement && node.hasAttribute('data-reveal')
        ? [node, ...node.querySelectorAll('[data-reveal]')]
        : node.querySelectorAll('[data-reveal]')
      for (const el of elements) {
        if (observed.has(el)) continue
        observed.add(el)
        io.observe(el)
      }
    }

    register(document)
    root.classList.add('reveal-ready')
    const mutations = new MutationObserver(records => {
      for (const record of records) {
        record.addedNodes.forEach(node => {
          if (node instanceof HTMLElement) register(node)
        })
      }
    })
    mutations.observe(document.getElementById('main') ?? document.body, { childList: true, subtree: true })

    const onMotionChange = () => { if (reduced.matches) revealAll() }
    reduced.addEventListener('change', onMotionChange)
    return () => {
      io.disconnect()
      mutations.disconnect()
      reduced.removeEventListener('change', onMotionChange)
      root.classList.remove('reveal-ready')
    }
  }, [])

  return null
}
