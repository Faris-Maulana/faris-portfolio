'use client'

import { useState } from 'react'
import { Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

export function PostProcessingFX() {
  const [enabled] = useState(() => {
    if (typeof window === 'undefined') return true
    return !window.matchMedia('(pointer: coarse)').matches
  })

  if (!enabled) return null

  return (
    <>
      <Bloom
        intensity={0.3}
        luminanceThreshold={0.15}
        luminanceSmoothing={0.85}
        mipmapBlur
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={[0.0015, 0.0005]}
      />
      <Vignette offset={0.25} darkness={0.7} eskil={false} />
    </>
  )
}
