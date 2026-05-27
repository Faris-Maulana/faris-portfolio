'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface RoamContextType {
  isRoaming: boolean
  setRoaming: (v: boolean) => void
  activeSectionId: string | null
  setActiveSectionId: (s: string | null) => void
}

const RoamContext = createContext<RoamContextType>({
  isRoaming: false,
  setRoaming: () => {},
  activeSectionId: null,
  setActiveSectionId: () => {},
})

export function RoamProvider({ children }: { children: ReactNode }) {
  const [isRoaming, setRoaming] = useState(false)
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)
  return (
    <RoamContext.Provider value={{ isRoaming, setRoaming, activeSectionId, setActiveSectionId }}>
      {children}
    </RoamContext.Provider>
  )
}

export const useRoam = () => useContext(RoamContext)
