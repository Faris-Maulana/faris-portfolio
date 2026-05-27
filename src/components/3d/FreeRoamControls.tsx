'use client'

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import * as THREE from 'three'

export function FreeRoamControls() {
  const { camera } = useThree()
  const keys = useRef({ w: false, a: false, s: false, d: false, shift: false })
  const clock = useRef(0)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': keys.current.w = true; break
        case 'KeyA': keys.current.a = true; break
        case 'KeyS': keys.current.s = true; break
        case 'KeyD': keys.current.d = true; break
        case 'ShiftLeft': case 'ShiftRight': keys.current.shift = true; break
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
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  useFrame((_, delta) => {
    clock.current += delta
    const speed = keys.current.shift ? 10 : 4
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion)
    forward.y = 0; right.y = 0
    forward.normalize(); right.normalize()

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
