'use client'

import { useEffect, useRef } from 'react'
import { generateSessionId } from '@/lib/utils'

export function useAnalytics() {
  const tracked = useRef(false)

  useEffect(() => {
    if (tracked.current) return
    tracked.current = true

    const sessionId = generateSessionId()
    if (!sessionId) return

    const send = () => {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: window.location.pathname,
          referrer: document.referrer || null,
          sessionId,
        }),
      }).catch(() => {})
    }

    send()
  }, [])
}
