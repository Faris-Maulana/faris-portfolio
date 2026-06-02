'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface RoamContextType {
  isRoaming: boolean
  setRoaming: (v: boolean) => void
  activeSectionId: string | null
  setActiveSectionId: (s: string | null) => void
  portalTargetId: string | null
  enteringPortal: boolean
  enterPortal: (sectionId: string) => void
  cancelPortal: () => void
}

const RoamContext = createContext<RoamContextType>({
  isRoaming: false,
  setRoaming: () => {},
  activeSectionId: null,
  setActiveSectionId: () => {},
  portalTargetId: null,
  enteringPortal: false,
  enterPortal: () => {},
  cancelPortal: () => {},
})

export function RoamProvider({ children }: { children: ReactNode }) {
  const [isRoaming, setRoaming] = useState(false)
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)
  const [portalTargetId, setPortalTargetId] = useState<string | null>(null)
  const [enteringPortal, setEnteringPortal] = useState(false)

  const enterPortal = useCallback((sectionId: string) => {
    setPortalTargetId(sectionId)
    setEnteringPortal(true)
  }, [])

  const cancelPortal = useCallback(() => {
    setPortalTargetId(null)
    setEnteringPortal(false)
  }, [])

  return (
    <RoamContext.Provider value={{
      isRoaming, setRoaming,
      activeSectionId, setActiveSectionId,
      portalTargetId, enteringPortal, enterPortal, cancelPortal,
    }}>
      {children}
    </RoamContext.Provider>
  )
}

export const useRoam = () => useContext(RoamContext)
