'use client'

import { useClock } from '@/hooks/useClock'

export function LocalTime() {
  const clock = useClock('Asia/Jakarta')

  return <span className={`tnum inline-block min-w-[8ch]${clock ? '' : ' invisible'}`}>{clock || '00:00:00'}</span>
}
