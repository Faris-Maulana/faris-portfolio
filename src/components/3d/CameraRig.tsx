'use client'

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { getCameraState } from '@/hooks/useCameraPath'

export function CameraRig() {
  const { camera } = useThree()
  const currentPos = useRef(new THREE.Vector3(0, 0, 15))
  const lookAtTarget = useRef(new THREE.Vector3())
  const scrollYRef = useRef(0)

  useFrame(() => {
    scrollYRef.current = (window as unknown as Record<string, number>).__scrollY ?? 0
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight
    const progress = maxScroll > 0 ? scrollYRef.current / maxScroll : 0

    const state = getCameraState(progress)

    const targetPos = new THREE.Vector3(...state.position)
    const targetLook = new THREE.Vector3(...state.target)

    currentPos.current.lerp(targetPos, 0.04)
    lookAtTarget.current.lerp(targetLook, 0.04)

    camera.position.copy(currentPos.current)
    camera.lookAt(lookAtTarget.current)
  })

  return null
}
