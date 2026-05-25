'use client'

import { useGSAPScrollAnimations } from '@/hooks/useGSAPAnimations'
import { useChamber } from '@/hooks/useChamber'

export function GSAPProvider() {
  useGSAPScrollAnimations()
  useChamber()
  return null
}
