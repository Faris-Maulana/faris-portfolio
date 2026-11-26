'use client'

import { useEffect, useRef } from 'react'

const INTEGER = /^[\d,]+$/

/** Time-based counter that preserves the source value in server HTML. */
export function MetricCounter({ value }: { value: string }) {
  const node = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const element = node.current
    if (!element || !INTEGER.test(value)) return
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (preference.matches) return
    const target = Number(value.replaceAll(',', ''))
    const formatter = new Intl.NumberFormat('en-US')
    let frame = 0
    let started = false
    let observer: IntersectionObserver | null = null

    const finish = () => {
      started = true
      observer?.disconnect()
      cancelAnimationFrame(frame)
      frame = 0
      element.textContent = value
    }
    const onMotionChange = () => { if (preference.matches) finish() }
    const animate = () => {
      if (started || preference.matches) return
      started = true
      const begin = performance.now()
      const tick = (time: number) => {
        if (preference.matches) {
          finish()
          return
        }
        const progress = Math.min((time - begin) / 900, 1)
        const eased = 1 - Math.pow(1 - progress, 4)
        element.textContent = formatter.format(Math.round(target * eased))
        if (progress < 1) frame = requestAnimationFrame(tick)
        else finish()
      }
      element.textContent = formatter.format(0)
      frame = requestAnimationFrame(tick)
    }

    preference.addEventListener('change', onMotionChange)
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return
        observer?.disconnect()
        animate()
      }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' })
      observer.observe(element)
    }
    return () => {
      preference.removeEventListener('change', onMotionChange)
      observer?.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [value])

  return <span ref={node} data-counter>{value}</span>
}
