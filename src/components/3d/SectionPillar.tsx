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
  const { activeSectionId, enterPortal } = useRoam()
  const clockRef = useRef(0)

  const handleClick = () => {
    enterPortal(sectionId)
  }

  const isActive = activeSectionId === sectionId
  const pillarColor = new THREE.Color(color)

  // deterministic segment generation — each pillar gets unique geometry via index
  const segments = useMemo(() => {
    const arr: { y: number; w: number }[] = []
    for (let i = 0; i < 6; i++) {
      const seed = (index * 7 + i * 13) % 10
      arr.push({
        y: -4 + i * 1.6,
        w: 0.6 + (seed % 4) * 0.075,
      })
    }
    return arr
  }, [index])

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
