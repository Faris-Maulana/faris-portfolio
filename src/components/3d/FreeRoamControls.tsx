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
  const { setActiveSectionId, setRoaming, enteringPortal, portalTargetId } = useRoam()
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const zoomRef = useRef({ active: false, target: new THREE.Vector3(), progress: 0, startPos: new THREE.Vector3(), startLook: new THREE.Vector3() })

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

  // Start camera zoom when portal activates
  useEffect(() => {
    if (portalTargetId && enteringPortal) {
      const idx = SECTION_IDS.indexOf(portalTargetId)
      if (idx >= 0) {
        const pos = SECTION_PILLAR_POSITIONS[idx]
        zoomRef.current = {
          active: true,
          target: new THREE.Vector3(pos[0], pos[1] + 2, pos[2] - 1.5),
          progress: 0,
          startPos: camera.position.clone(),
          startLook: new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).add(camera.position),
        }
      }
    }
  }, [portalTargetId, enteringPortal, camera])

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

    // Camera zoom toward portal
    if (zoomRef.current.active) {
      const z = zoomRef.current
      z.progress = Math.min(z.progress + delta * 1.2, 1)
      const ease = 1 - Math.pow(1 - z.progress, 3)

      camera.position.lerpVectors(z.startPos, z.target, ease)

      if (z.progress >= 1) {
        zoomRef.current.active = false
      }
      return
    }

    checkProximity()

    if (enteringPortal) return

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
