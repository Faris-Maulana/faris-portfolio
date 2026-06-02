'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useRoam } from '@/contexts/RoamContext'

const PILLAR_POSITIONS: Record<string, [number, number, number]> = {
  hero:        [0, 0, 8],
  about:       [5, -1, 6],
  experience:  [8, -2, 3],
  projects:    [7, -3, -2],
  skills:      [3, -4, -5],
  research:    [-1, -5, -6],
  certificates:[-5, -6, -4],
  blog:        [-8, -7, -1],
  contact:     [-6, -8, 4],
}

function createRuneTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, 128, 128)
  ctx.strokeStyle = '#a855f7'
  ctx.lineWidth = 2
  for (let i = 0; i < 6; i++) {
    ctx.save()
    ctx.translate(20 + Math.random() * 88, 20 + Math.random() * 88)
    ctx.rotate(Math.random() * Math.PI)
    ctx.beginPath()
    ctx.moveTo(-8, -8)
    ctx.lineTo(8, 0)
    ctx.lineTo(-8, 8)
    ctx.closePath()
    ctx.stroke()
    ctx.restore()
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

export function PortalDoor() {
  const { portalTargetId, cancelPortal } = useRoam()
  const leftDoorRef = useRef<THREE.Mesh>(null)
  const rightDoorRef = useRef<THREE.Mesh>(null)
  const archRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const particlesRef = useRef<THREE.Points>(null)
  const progressRef = useRef(0)
  const targetSectionRef = useRef<string | null>(null)
  const runeTex = useMemo(() => createRuneTexture(), [])

  const particleGeo = useMemo(() => {
    const count = 200
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 0.5 + Math.random() * 2.5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI - Math.PI / 2
      pos[i * 3] = r * Math.cos(theta) * Math.cos(phi)
      pos[i * 3 + 1] = r * Math.sin(phi) + 2
      pos[i * 3 + 2] = r * Math.sin(theta) * Math.cos(phi)
      const c = new THREE.Color('#a855f7').lerp(new THREE.Color('#38bdf8'), Math.random())
      col[i * 3] = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
    return geo
  }, [])

  const noPos: [number, number, number] = [0, 0, 0]
  const position: [number, number, number] = portalTargetId ? PILLAR_POSITIONS[portalTargetId] ?? noPos : noPos

  useEffect(() => {
    if (portalTargetId) {
      targetSectionRef.current = portalTargetId
      progressRef.current = 0
    }
  }, [portalTargetId])

  useFrame((_, delta) => {
    const progress = progressRef.current
    if (!portalTargetId && progress <= 0) return

    if (portalTargetId && progress < 1) {
      progressRef.current = Math.min(progress + delta * 1.5, 1)
    }

    const p = progressRef.current
    const ease = 1 - Math.pow(1 - p, 3)

    // Doors slide open
    if (leftDoorRef.current) {
      leftDoorRef.current.position.x = -1.5 - ease * 1.8
      leftDoorRef.current.position.z = ease * 0.3
    }
    if (rightDoorRef.current) {
      rightDoorRef.current.position.x = 1.5 + ease * 1.8
      rightDoorRef.current.position.z = ease * 0.3
    }

    // Arch glow intensity
    if (archRef.current) {
      const archMat = archRef.current.material as THREE.MeshBasicMaterial
      archMat.opacity = 0.15 + ease * 0.5
    }

    // Ring expansion
    if (ringRef.current) {
      const s = 1 + ease * 2.5
      ringRef.current.scale.set(s, s, s)
      const ringMat = ringRef.current.material as THREE.MeshBasicMaterial
      ringMat.opacity = Math.max(0, 0.4 - ease * 0.38)
    }

    // Glow flash
    if (glowRef.current) {
      const glowMat = glowRef.current.material as THREE.MeshBasicMaterial
      glowMat.opacity = ease * 0.15
      const s = 1 + ease * 0.5
      glowRef.current.scale.set(s, s, s)
    }

    // Particles burst outward
    if (particlesRef.current) {
      const pos = particlesRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < pos.length / 3; i++) {
        const idx = i * 3
        const speed = 0.5 + (i % 10) * 0.1
        pos[idx] += delta * ease * speed * (pos[idx] / 3)
        pos[idx + 1] += delta * ease * speed * 0.5
        pos[idx + 2] += delta * ease * speed * (pos[idx + 2] / 3)
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true
      const ptMat = particlesRef.current.material as THREE.PointsMaterial
      ptMat.opacity = Math.max(0, 1 - ease * 1.2)
    }

    // Camera zoom toward portal
    if (p >= 1 && portalTargetId) {
      cancelPortal()
      progressRef.current = 0
    }
  })

  if (!portalTargetId && progressRef.current <= 0) return null

  return (
    <group position={position}>
      {/* Portal glow disc */}
      <mesh ref={glowRef} position={[0, 2, -0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 3.5, 48]} />
        <meshBasicMaterial
          color="#a855f7"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Expansion ring */}
      <mesh ref={ringRef} position={[0, 2, -0.3]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1.0, 48]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Left door */}
      <mesh ref={leftDoorRef} position={[-1.5, 2, 0]}>
        <boxGeometry args={[0.15, 3.5, 1.8]} />
        <meshBasicMaterial
          color="#1a1040"
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Left door glow edge */}
      <mesh position={[-1.5, 2, 0.9]}>
        <boxGeometry args={[0.08, 3.2, 0.02]} />
        <meshBasicMaterial
          color="#a855f7"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Right door */}
      <mesh ref={rightDoorRef} position={[1.5, 2, 0]}>
        <boxGeometry args={[0.15, 3.5, 1.8]} />
        <meshBasicMaterial
          color="#1a1040"
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Right door glow edge */}
      <mesh position={[1.5, 2, 0.9]}>
        <boxGeometry args={[0.08, 3.2, 0.02]} />
        <meshBasicMaterial
          color="#a855f7"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Arch top */}
      <mesh ref={archRef} position={[0, 3.8, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[1.6, 0.06, 8, 32, Math.PI]} />
        <meshBasicMaterial
          color="#a855f7"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Rune symbols on arch */}
      <mesh position={[0, 4, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.5, 0.8]} />
        <meshBasicMaterial
          map={runeTex}
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Particles */}
      <points ref={particlesRef} geometry={particleGeo}>
        <pointsMaterial
          size={0.08}
          vertexColors
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </group>
  )
}
