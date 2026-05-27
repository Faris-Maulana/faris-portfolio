'use client'

import { useRoam } from '@/contexts/RoamContext'

export function ContentLayer({ children }: { children: React.ReactNode }) {
  const { isRoaming } = useRoam()
  return (
    <div className={`transition-all duration-700 ${isRoaming ? 'opacity-0 pointer-events-none' : ''}`}>
      {children}
    </div>
  )
}
