'use client'

import { Canvas } from '@react-three/fiber'
import { CameraRig } from './CameraRig'
import { FreeRoamControls } from './FreeRoamControls'
import { SceneObjects } from './SceneObjects'
import { PostProcessingFX } from './PostProcessing'
import { useRoam } from '@/contexts/RoamContext'

export function Scene3D() {
  const { isRoaming } = useRoam()
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
