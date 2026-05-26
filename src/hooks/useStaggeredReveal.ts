'use client'

import { useEffect } from 'react'

export function useStaggeredReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('in-view')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    )

    document.querySelectorAll('[data-section-enter]').forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
}
