'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { PostProcessing } from '@/components/PostProcessing'

const FOG_COLORS: Record<string, THREE.Color> = {
  hero: new THREE.Color(0x010105),
  about: new THREE.Color(0x010206),
  experience: new THREE.Color(0x040301),
  projects: new THREE.Color(0x020104),
  skills: new THREE.Color(0x000103),
  research: new THREE.Color(0x010305),
  certificates: new THREE.Color(0x040300),
  blog: new THREE.Color(0x030201),
  contact: new THREE.Color(0x020004),
}

const AMBIENT_COLORS: Record<string, string> = {
  hero: '#a855f7',
  about: '#38bdf8',
  experience: '#fbbf24',
  projects: '#c084fc',
  skills: '#7c3aed',
  research: '#22d3ee',
  certificates: '#fbbf24',
  blog: '#f59e0b',
  contact: '#a855f7',
}

const AVATAR_URL = 'https://avatars.githubusercontent.com/u/104351844?v=4'

function CameraRig() {
  const { camera } = useThree()
  const yTarget = useRef(0)

  useEffect(() => {
    function onScroll() {
      yTarget.current = (window as any).__scrollY ?? 0
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useFrame((_, delta) => {
    const targetY = -yTarget.current * 0.002
    camera.position.y += (targetY - camera.position.y) * Math.min(1, delta * 4)
    camera.lookAt(0, camera.position.y, 0)
  })

  return null
}

function MouseParallax() {
  const { camera } = useThree()
  const rotX = useRef(0)
  const rotY = useRef(0)

  useEffect(() => {
    function onMouse(e: MouseEvent) {
      rotX.current = (e.clientY / window.innerHeight - 0.5) * 0.05
      rotY.current = (e.clientX / window.innerWidth - 0.5) * 0.05
    }
    window.addEventListener('mousemove', onMouse)
    return () => window.removeEventListener('mousemove', onMouse)
  }, [])

  useFrame((_, delta) => {
    const tx = (rotX.current - camera.rotation.x) * 0.05
    const ty = (rotY.current - camera.rotation.y) * 0.05
    camera.rotation.x += tx * Math.min(1, delta * 8)
    camera.rotation.y += ty * Math.min(1, delta * 8)
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
  const count = 4
  const positions = useMemo(() => {
    const pts: [number, number, number][] = []
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + 0.3
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
            wireframe={false}
          />
        </mesh>
      ))}
    </group>
  )
}

function ShadowParticles() {
  const count = 5000
  const pointsRef = useRef<THREE.Points>(null!)

  const { positions, colors, sizes } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const siz = new Float32Array(count)
    const c = new THREE.Color()
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30 - 5
      c.setHSL(0.75 + Math.random() * 0.1, 0.7, 0.3 + Math.random() * 0.3)
      col[i * 3] = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
      siz[i] = 0.03 + Math.random() * 0.06
    }
    return { positions: pos, colors: col, sizes: siz }
  }, [count])

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
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
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

function SceneContent() {
  return (
    <>
      <fogExp2 attach="fog" args={[FOG_COLORS.hero, 0.016]} />
      <ambientLight color="#a855f7" intensity={0.4} />
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
