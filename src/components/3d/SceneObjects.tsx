'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function createParticleGeometry(count: number) {
  const pos = new Float32Array(count * 3)
  const col = new Float32Array(count * 3)
  const blue = new THREE.Color('#3b82f6')
  const purple = new THREE.Color('#a855f7')

  for (let i = 0; i < count; i++) {
    const radius = 6 + Math.random() * 20
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)

    pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    pos[i * 3 + 1] = (Math.random() - 0.5) * 30 - 8
    pos[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta) - 5

    const mix = Math.random()
    const c = blue.clone().lerp(purple, mix)
    col[i * 3] = c.r
    col[i * 3 + 1] = c.g
    col[i * 3 + 2] = c.b
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
  return geo
}

function createStrands() {
  const result: { points: THREE.Vector3[]; color: string }[] = []
  const colors = ['#3b82f6', '#60a5fa', '#a855f7', '#7c3aed', '#2563eb']

  for (let s = 0; s < 5; s++) {
    const pts: THREE.Vector3[] = []
    const baseY = -s * 2 - 2
    for (let i = 0; i < 6; i++) {
      const t = i / 5
      pts.push(
        new THREE.Vector3(
          Math.sin(t * Math.PI * 2 + s) * 3 + (Math.random() - 0.5) * 2,
          baseY + t * 8 + (Math.random() - 0.5) * 2,
          Math.cos(t * Math.PI * 2 + s) * 2 + (Math.random() - 0.5) * 2 - 5
        )
      )
    }
    result.push({ points: pts, color: colors[s % colors.length] })
  }
  return result
}

function createSoldierPositions(): [number, number, number][] {
  const positions: [number, number, number][] = []
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2
    const radius = 7 + Math.random() * 3
    positions.push([
      Math.cos(angle) * radius,
      -2 - Math.random() * 6,
      Math.sin(angle) * radius - 5,
    ])
  }
  return positions
}

function ArclightParticles({ count = 3000 }) {
  const meshRef = useRef<THREE.Points>(null)
  const clockRef = useRef(0)

  const geometry = useMemo(() => createParticleGeometry(count), [count])

  useFrame((_, delta) => {
    clockRef.current += delta
    if (!meshRef.current) return
    const pos = meshRef.current.geometry.attributes.position.array as Float32Array

    for (let i = 0; i < count; i++) {
      const idx = i * 3 + 1
      pos[idx] += delta * (0.1 + Math.sin(clockRef.current + i) * 0.02)
      if (pos[idx] > 22) pos[idx] = -8
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true
    meshRef.current.rotation.y += delta * 0.005
  })

  return (
    <points ref={meshRef} geometry={geometry}>
      <pointsMaterial
        size={0.05}
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

function ArclightStrands() {
  const groupRef = useRef<THREE.Group>(null)

  const strands = useMemo(() => createStrands(), [])

  const curves = useMemo(
    () =>
      strands.map(
        (s) => new THREE.CatmullRomCurve3(s.points, false)
      ),
    [strands]
  )

  const tubeGeos = useMemo(
    () =>
      curves.map((curve) => {
        const geo = new THREE.TubeGeometry(curve, 64, 0.03, 4, false)
        return geo
      }),
    [curves]
  )

  const strandColors = strands.map((s) => s.color)

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.01
    }
  })

  return (
    <group ref={groupRef}>
      {tubeGeos.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <meshBasicMaterial
            color={strandColors[i]}
            transparent
            opacity={0.25}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

function GateGeometry() {
  const gateRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (gateRef.current) {
      gateRef.current.rotation.y += delta * 0.1
      gateRef.current.rotation.x += delta * 0.03
    }
  })

  return (
    <group ref={gateRef} position={[0, 0, -5]}>
      <mesh>
        <torusGeometry args={[3.5, 0.08, 16, 64]} />
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh>
        <torusGeometry args={[3.2, 0.04, 16, 64]} />
        <meshBasicMaterial
          color="#60a5fa"
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh>
        <ringGeometry args={[3.8, 4.0, 64]} />
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.06}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

function ShadowSoldiers() {
  const groupRef = useRef<THREE.Group>(null)

  const soldierPositions = useMemo(() => createSoldierPositions(), [])

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        child.position.y += Math.sin(Date.now() * 0.001 + i) * 0.001
      })
    }
  })

  return (
    <group ref={groupRef}>
      {soldierPositions.map((pos, i) => (
        <group key={i} position={pos}>
          <mesh position={[0, 0.8, 0]}>
            <boxGeometry args={[0.5, 1.2, 0.3]} />
            <meshBasicMaterial
              color="#1a1040"
              transparent
              opacity={0.6}
            />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.7, 0.4, 0.3]} />
            <meshBasicMaterial
              color="#1a1040"
              transparent
              opacity={0.5}
            />
          </mesh>
          <mesh position={[0, -0.3, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.5, 4]} />
            <meshBasicMaterial
              color="#1a1040"
              transparent
              opacity={0.5}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function VoidFloor() {
  const gridHelper = useMemo(() => {
    const grid = new THREE.GridHelper(40, 40, 0x1a1040, 0x0c0820)
    grid.position.y = -8
    grid.material.transparent = true
    grid.material.opacity = 0.15
    return grid
  }, [])

  return <primitive object={gridHelper} />
}

export function SceneObjects() {
  return (
    <>
      <ArclightParticles />
      <ArclightStrands />
      <GateGeometry />
      <ShadowSoldiers />
      <VoidFloor />
    </>
  )
}
