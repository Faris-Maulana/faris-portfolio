'use client'

import dynamic from 'next/dynamic'
import { useCallback, useSyncExternalStore } from 'react'

/**
 * three.js is ~150 KB gzipped. Loading it client-only and after hydration
 * keeps it out of the server bundle and off the critical path: the page
 * paints its text first, the map arrives behind it.
 */
const BackboneScene = dynamic(() => import('./BackboneScene'), {
  ssr: false,
  loading: () => null,
})

/**
 * Read through useSyncExternalStore so the first client render already knows
 * the answer: no flash of a canvas on a device that is about to be told not
 * to run one.
 */
function useCanAnimate() {
  const subscribe = useCallback((onChange: () => void) => {
    const q = window.matchMedia('(prefers-reduced-motion: reduce)')
    q.addEventListener('change', onChange)
    return () => q.removeEventListener('change', onChange)
  }, [])

  const getSnapshot = useCallback(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    const nav = navigator as Navigator & { deviceMemory?: number }
    if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return false
    return true
  }, [])

  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}

export function SceneMount() {
  const animate = useCanAnimate()
  return <BackboneScene animate={animate} />
}
