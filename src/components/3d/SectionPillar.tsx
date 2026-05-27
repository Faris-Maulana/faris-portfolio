'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import { useRoam } from '@/contexts/RoamContext'

interface SectionPillarProps {
  position: [number, number, number]
  sectionId: string
  label: string
  index: number
  color?: string
}

export function SectionPillar({ position, sectionId, label, index, color = '#3b82f6' }: SectionPillarProps) {
  const groupRef = useRef<THREE.Group>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const { activeSectionId, setActiveSectionId, setRoaming } = useRoam()
  const clockRef = useRef(0)
  const hovered = useRef(false)

  const handleClick = () => {
    setRoaming(false)
    setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const isActive = activeSectionId === sectionId
  const pillarColor = new THREE.Color(color)

  const segments = useMemo(() => {
    const arr: { y: number; w: number; speed: number; phase: number }[] = []
    for (let i = 0; i < 6; i++) {
      arr.push({
        y: -4 + i * 1.6,
        w: 0.6 + Math.random() * 0.3,
        speed: 0.8 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
      })
    }
    return arr
  }, [])

  useFrame((_, delta) => {
    clockRef.current += delta
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(clockRef.current * 0.3 + index) * 0.15
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Glow base */}
      <mesh position={[0, -4.5, 0]}>
        <ringGeometry args={[0.8, 2.0, 32]} />
        <meshBasicMaterial
          color={pillarColor}
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Segments */}
      {segments.map((seg, i) => (
        <mesh
          key={i}
          position={[0, seg.y, 0]}
          onPointerEnter={() => { hovered.current = true; setActiveSectionId(sectionId) }}
          onPointerLeave={() => { hovered.current = false; setActiveSectionId(null) }}
          onClick={handleClick}
        >
          <boxGeometry args={[seg.w, 0.08, seg.w]} />
          <meshBasicMaterial
            color={pillarColor}
            transparent
            opacity={isActive ? 0.9 : 0.4}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* Label */}
      <Text
        position={[0, -5.5, 0]}
        fontSize={0.25}
        color={color}
        font="/fonts/JetBrainsMono-Regular.ttf"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.2}
        fillOpacity={0.6}
      >
        {`[${String(index).padStart(2, '0')}] ${label}`}
      </Text>
    </group>
  )
}
