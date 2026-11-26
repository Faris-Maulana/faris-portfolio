'use client'

import { useClock } from '@/hooks/useClock'

export function LocalTime() {
  const clock = useClock('Asia/Jakarta')

  return <span className="tnum">{clock}</span>
}
