'use client'
/* eslint-disable react-hooks/purity */

import { useRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import * as THREE from 'three'
import { useRoam } from '@/contexts/RoamContext'

const SECTION_PILLAR_POSITIONS: [number, number, number][] = [
  [0, 0, 8], [5, -1, 6], [8, -2, 3], [7, -3, -2], [3, -4, -5],
  [-1, -5, -6], [-5, -6, -4], [-8, -7, -1], [-6, -8, 4],
]
const SECTION_IDS = ['hero', 'about', 'experience', 'projects', 'skills', 'research', 'certificates', 'blog', 'contact']
const PROXIMITY_THRESHOLD = 4

export function FreeRoamControls() {
  const { camera, gl } = useThree()
  const keys = useRef({ w: false, a: false, s: false, d: false, shift: false })
  const clock = useRef(0)
  const closestSection = useRef<string | null>(null)
  const { setActiveSectionId, setRoaming } = useRoam()
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches)
  }, [])

  if (isTouchDevice) return null

  // Proximity detection: find closest pillar within threshold
  const checkProximity = () => {
    let nearest: string | null = null
    let nearestDist = PROXIMITY_THRESHOLD
    for (let i = 0; i < SECTION_PILLAR_POSITIONS.length; i++) {
      const pos = SECTION_PILLAR_POSITIONS[i]
      const dx = camera.position.x - pos[0]
      const dz = camera.position.z - pos[2]
      const dist = Math.sqrt(dx * dx + dz * dz)
      if (dist < nearestDist) {
        nearestDist = dist
        nearest = SECTION_IDS[i]
      }
    }
    if (nearest !== closestSection.current) {
      closestSection.current = nearest
      setActiveSectionId(nearest)
    }
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': keys.current.w = true; break
        case 'KeyA': keys.current.a = true; break
        case 'KeyS': keys.current.s = true; break
        case 'KeyD': keys.current.d = true; break
        case 'ShiftLeft': case 'ShiftRight': keys.current.shift = true; break
        case 'Escape':
          document.exitPointerLock()
          setRoaming(false)
          break
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': keys.current.w = false; break
        case 'KeyA': keys.current.a = false; break
        case 'KeyS': keys.current.s = false; break
        case 'KeyD': keys.current.d = false; break
        case 'ShiftLeft': case 'ShiftRight': keys.current.shift = false; break
      }
    }
    const onPointerLockChange = () => {
      if (!document.pointerLockElement) {
        setRoaming(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    document.addEventListener('pointerlockchange', onPointerLockChange)
    // Auto-lock pointer on mount
    gl.domElement.addEventListener('click', () => {
      gl.domElement.requestPointerLock()
    })
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      document.removeEventListener('pointerlockchange', onPointerLockChange)
      if (document.pointerLockElement) document.exitPointerLock()
    }
  }, [gl.domElement, setRoaming])

  useFrame((_, delta) => {
    clock.current += delta
    checkProximity()
    const speed = keys.current.shift ? 10 : 4
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion)
    forward.y = 0; right.y = 0
    if (forward.lengthSq() > 1e-6) forward.normalize()
    if (right.lengthSq() > 1e-6) right.normalize()

    const move = new THREE.Vector3()
    if (keys.current.w) move.add(forward)
    if (keys.current.s) move.sub(forward)
    if (keys.current.a) move.sub(right)
    if (keys.current.d) move.add(right)

    if (move.length() > 0) {
      move.normalize().multiplyScalar(speed * delta)
      camera.position.add(move)
    }

    camera.position.y = 1.6
    camera.position.x = Math.max(-28, Math.min(28, camera.position.x))
    camera.position.z = Math.max(-28, Math.min(28, camera.position.z))
  })

  return <PointerLockControls />
}
