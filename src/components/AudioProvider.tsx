'use client'

import { useEffect, useRef } from 'react'
import { audioEngine } from '@/hooks/useAudioEngine'

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const initiated = useRef(false)

  useEffect(() => {
    function handleGesture() {
      if (initiated.current) return
      initiated.current = true
      audioEngine.init().then(() => {
        audioEngine.startAmbient()
      })
      document.removeEventListener('click', handleGesture)
      document.removeEventListener('touchstart', handleGesture)
    }
    document.addEventListener('click', handleGesture)
    document.addEventListener('touchstart', handleGesture)
    return () => {
      document.removeEventListener('click', handleGesture)
      document.removeEventListener('touchstart', handleGesture)
    }
  }, [])

  return <>{children}</>
}
