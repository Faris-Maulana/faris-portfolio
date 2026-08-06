'use client'

import { useEffect, useRef } from 'react'
import { getOrCreateSessionId } from '@/lib/utils'

export function useAnalytics() {
  const sentRef   = useRef(false)
  // Stamped on mount rather than during render. Date.now() in a render path is
  // impure, and on the server it would record a time that has nothing to do
  // with when this visitor actually arrived.
  const startTime = useRef(0)

  useEffect(() => {
    if (sentRef.current || typeof window === 'undefined') return
    sentRef.current = true
    startTime.current = Date.now()

    const sessionId = getOrCreateSessionId()
    if (!sessionId) return

    const send = async (durationSec?: number) => {
      try {
        await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path:        window.location.pathname,
            referrer:    document.referrer || null,
            sessionId,
            durationSec: durationSec ?? null,
          }),
        })
      } catch {
        // Silent fail, analytics is non-critical
      }
    }

    send()

    const onUnload = () => {
      const duration = Math.round((Date.now() - startTime.current) / 1000)
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics', JSON.stringify({
          path:        window.location.pathname,
          referrer:    null,
          sessionId,
          durationSec: duration,
          isUnload:    true,
        }))
      }
    }

    window.addEventListener('beforeunload', onUnload)
    return () => window.removeEventListener('beforeunload', onUnload)
  }, [])
}
