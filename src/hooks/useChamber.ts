'use client'

import { useEffect, useState } from 'react'
import { CHAMBERS, type ChamberConfig } from '@/lib/chamberConfig'
import { audioEngine } from '@/hooks/useAudioEngine'

export function useChamber() {
  const [activeId, setActiveId] = useState<string>('hero')

  useEffect(() => {
    const sectionIds = Object.keys(CHAMBERS)
    const observers: IntersectionObserver[] = []

    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(id)
              ;(window as any).__activeChamber = id
              const cfg = CHAMBERS[id]
              if (cfg) audioEngine.setDroneFrequency(cfg.audioFreq)
            }
          })
        },
        { threshold: 0.3 }
      )
      obs.observe(el)
      observers.push(obs)
    })

    return () => {
      observers.forEach((o) => o.disconnect())
    }
  }, [])

  const config: ChamberConfig = CHAMBERS[activeId] ?? CHAMBERS.hero

  return { activeChamber: activeId, chamberConfig: config }
}
