'use client'

import { useEffect, useState } from 'react'
import { Bloom, ChromaticAberration, Vignette, Noise } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

export function PostProcessing() {
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    const isMobile = typeof window !== 'undefined' &&
      window.matchMedia('(pointer: coarse)').matches
    setEnabled(!isMobile)
  }, [])

  if (!enabled) return null

  return (
    <>
      <Bloom
        intensity={0.15}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={[0.002, 0.002]}
      />
      <Vignette
        offset={0.3}
        darkness={0.8}
        eskil={false}
      />
      <Noise
        opacity={0.02}
        premultiply
      />
    </>
  )
}
