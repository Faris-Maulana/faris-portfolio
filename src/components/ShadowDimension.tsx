'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { PostProcessing } from '@/components/PostProcessing'
import { CHAMBERS } from '@/lib/chamberConfig'

function CameraRig() {
  const { camera } = useThree()

  useFrame((_, delta) => {
    const scrollY = (window as any).__scrollY ?? 0
    const targetY = -scrollY * 0.002
    camera.position.y += (targetY - camera.position.y) * Math.min(1, delta * 4)
    camera.lookAt(0, camera.position.y, 0)
  })

  return null
}

function MouseParallax() {
  const { camera } = useThree()
  const rotX = useRef(0)
  const rotY = useRef(0)

  useFrame((_, delta) => {
    const tx = (rotX.current - camera.rotation.x) * 0.05
    const ty = (rotY.current - camera.rotation.y) * 0.05
    camera.rotation.x += tx * Math.min(1, delta * 8)
    camera.rotation.y += ty * Math.min(1, delta * 8)
  })

  useFrame(() => {
    const el = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2)
    if (!el) return
    const section = el.closest('section')
    if (section) {
      const rect = section.getBoundingClientRect()
      const center = rect.top + rect.height / 2
      const viewCenter = window.innerHeight / 2
      const offset = (center - viewCenter) / viewCenter
      rotX.current = offset * 0.03
    }
  })

  return null
}

function GroundPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -10, 0]}>
      <planeGeometry args={[120, 120]} />
      <meshStandardMaterial
        color="#07061a"
        metalness={0.9}
        roughness={0.15}
        transparent
        opacity={0.6}
      />
    </mesh>
  )
}

function Pillars() {
  const positions = useMemo(() => {
    const pts: [number, number, number][] = []
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const r = 14 + Math.random() * 6
      pts.push([Math.cos(angle) * r, -2 + Math.random() * 4, Math.sin(angle) * r])
    }
    return pts
  }, [])

  return (
    <group>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <cylinderGeometry args={[0.12, 0.18, 6, 6]} />
          <meshStandardMaterial
            color="#a855f7"
            emissive="#a855f7"
            emissiveIntensity={0.15}
            transparent
            opacity={0.3}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      ))}
    </group>
  )
}

function RuneCircles() {
  const groupRef = useRef<THREE.Group>(null!)

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.06
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, -8]}>
      <mesh>
        <torusGeometry args={[4, 0.02, 16, 80]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.15} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 3]}>
        <torusGeometry args={[3.2, 0.015, 16, 64]} />
        <meshBasicMaterial color="#c084fc" transparent opacity={0.1} />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI / 4]}>
        <torusGeometry args={[4.8, 0.01, 16, 96]} />
        <meshBasicMaterial color="#7c3aed" transparent opacity={0.08} />
      </mesh>
    </group>
  )
}

function ShadowSoldiers() {
  const positions = useMemo(() => {
    const pts: [number, number, number][] = []
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + 0.3
      pts.push([Math.cos(angle) * 11, -6, Math.sin(angle) * 11])
    }
    return pts
  }, [])

  return (
    <group>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos} rotation={[0, -i * Math.PI / 2, 0]}>
          <boxGeometry args={[1, 2.8, 0.4]} />
          <meshBasicMaterial
            color="#a855f7"
            transparent
            opacity={0.04}
          />
        </mesh>
      ))}
    </group>
  )
}

function ShadowParticles() {
  const count = 5000
  const pointsRef = useRef<THREE.Points>(null!)

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const c = new THREE.Color()
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30 - 5
      c.setHSL(0.75 + Math.random() * 0.1, 0.7, 0.3 + Math.random() * 0.3)
      col[i * 3] = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
    }
    return { positions: pos, colors: col }
  }, [])

  useFrame((_, delta) => {
    if (!pointsRef.current) return
    const posAttr = pointsRef.current.geometry.attributes.position
    const posArray = posAttr.array as Float32Array
    for (let i = 0; i < count; i++) {
      posArray[i * 3 + 1] += delta * (0.2 + Math.random() * 0.3)
      if (posArray[i * 3 + 1] > 20) posArray[i * 3 + 1] = -20
    }
    posAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}

function SceneController() {
  const fogRef = useRef<THREE.FogExp2>(null!)
  const ambientRef = useRef<THREE.AmbientLight>(null!)
  const lerpColor = useRef(new THREE.Color())

  useFrame(() => {
    const activeId = (window as any).__activeChamber ?? 'hero'
    const cfg = CHAMBERS[activeId] ?? CHAMBERS.hero

    if (fogRef.current) {
      lerpColor.current = new THREE.Color(cfg.fogColor)
      fogRef.current.color.lerp(lerpColor.current, 0.03)
      fogRef.current.density += (cfg.fogDensity - fogRef.current.density) * 0.03
    }

    if (ambientRef.current) {
      lerpColor.current = new THREE.Color(cfg.ambientColor)
      ambientRef.current.color.lerp(lerpColor.current, 0.03)
      ambientRef.current.intensity += (cfg.ambientIntensity - ambientRef.current.intensity) * 0.03
    }
  })

  return (
    <>
      <fogExp2
        ref={fogRef}
        attach="fog"
        args={[CHAMBERS.hero.fogColor, CHAMBERS.hero.fogDensity]}
      />
      <ambientLight
        ref={ambientRef}
        color={CHAMBERS.hero.ambientColor}
        intensity={CHAMBERS.hero.ambientIntensity}
      />
    </>
  )
}

function SceneContent() {
  return (
    <>
      <SceneController />
      <pointLight position={[0, 15, 5]} color="#a855f7" intensity={0.8} distance={40} />
      <pointLight position={[-10, -5, 10]} color="#38bdf8" intensity={0.3} distance={30} />
      <CameraRig />
      <MouseParallax />
      <GroundPlane />
      <Pillars />
      <RuneCircles />
      <ShadowSoldiers />
      <ShadowParticles />
      <PostProcessing />
    </>
  )
}

export function ShadowDimension() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 60, near: 0.1, far: 80 }}
        gl={{
          antialias: false,
          powerPreference: 'high-performance',
          alpha: false,
        }}
        dpr={[1, 1.5]}
        style={{ background: '#030309' }}
      >
        <SceneContent />
      </Canvas>
    </div>
  )
}
