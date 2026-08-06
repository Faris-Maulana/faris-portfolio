'use client'

import { useCallback, useSyncExternalStore } from 'react'

/**
 * Ticking wall clock for a fixed IANA timezone.
 *
 * Read through useSyncExternalStore rather than useState + useEffect: the
 * server snapshot is an empty string, so SSR and the first client render agree
 * and React never reports a hydration mismatch on a value that is, by
 * definition, different on every render.
 */
export function useClock(timeZone = 'Asia/Jakarta') {
  const subscribe = useCallback((onChange: () => void) => {
    const id = setInterval(onChange, 1000)
    return () => clearInterval(id)
  }, [])

  const getSnapshot = useCallback(
    () =>
      new Intl.DateTimeFormat('en-GB', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(new Date()),
    [timeZone]
  )

  return useSyncExternalStore(subscribe, getSnapshot, () => '')
}
