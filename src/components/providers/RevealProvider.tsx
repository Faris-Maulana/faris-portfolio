'use client'

import { useEffect } from 'react'

/**
 * One IntersectionObserver for the entire page.
 *
 * Sections are code-split and mount long after first paint, so a per-component
 * observer would mean dozens of observer instances plus a hook in every file.
 * Instead a single observer watches for `[data-reveal]` and a MutationObserver
 * picks up nodes that arrive later. Elements are unobserved once revealed, * the reveal is a one-shot, so keeping them registered is pure overhead.
 */
export function RevealProvider() {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      document
        .querySelectorAll<HTMLElement>('[data-reveal]')
        .forEach(el => el.classList.add('is-in'))
      return
    }

    const io = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-in')
          io.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
    )

    const register = (root: ParentNode) => {
      root
        .querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)')
        .forEach(el => io.observe(el))
    }

    register(document)

    const mo = new MutationObserver(mutations => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (!(node instanceof HTMLElement)) continue
          if (node.matches('[data-reveal]')) io.observe(node)
          register(node)
        }
      }
    })
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      mo.disconnect()
      io.disconnect()
    }
  }, [])

  return null
}
