'use client'

import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { CameraRig } from './CameraRig'
import { FreeRoamControls } from './FreeRoamControls'
import { SceneObjects } from './SceneObjects'
import { PostProcessingFX } from './PostProcessing'
import { useRoam } from '@/contexts/RoamContext'

export function Scene3D() {
  const { isRoaming } = useRoam()
  const [enableHeavy, setEnableHeavy] = useState(true)

  useEffect(() => {
    const isMobile  = window.matchMedia('(max-width: 768px)').matches
    const reduced   = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const lowMem    = (navigator as Navigator & { deviceMemory?: number }).deviceMemory !== undefined && (navigator as Navigator & { deviceMemory?: number }).deviceMemory! < 4
    setEnableHeavy(!isMobile && !reduced && !lowMem)
  }, [])

  if (!enableHeavy) {
    return (
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 20% 20%, rgba(168,85,247,0.12), transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(59,130,246,0.10), transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(8,17,25,0.6), transparent 70%)
          `,
        }}
      />
    )
  }

  return (
    <div
      className={`fixed inset-0 z-0 transition-all duration-700 ${isRoaming ? 'z-50 pointer-events-auto' : 'pointer-events-none'}`}
    >
      <Canvas
        camera={{ position: [0, 0, 15], fov: 50, near: 0.1, far: 80 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          powerPreference: 'high-performance',
          alpha: false,
        }}
        style={{ background: '#030309' }}
      >
        <fogExp2 attach="fog" args={['#030309', 0.005]} />
        <ambientLight intensity={0.3} color="#3b82f6" />
        {isRoaming ? <FreeRoamControls /> : <CameraRig />}
        <SceneObjects />
        <PostProcessingFX />
      </Canvas>
    </div>
  )
}
