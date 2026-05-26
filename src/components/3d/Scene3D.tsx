'use client'

import { Canvas } from '@react-three/fiber'
import { CameraRig } from './CameraRig'
import { SceneObjects } from './SceneObjects'
import { PostProcessingFX } from './PostProcessing'

export function Scene3D() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
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
        <CameraRig />
        <SceneObjects />
        <PostProcessingFX />
      </Canvas>
    </div>
  )
}
