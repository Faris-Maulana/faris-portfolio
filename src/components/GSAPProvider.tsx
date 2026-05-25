'use client'

import { useGSAPScrollAnimations } from '@/hooks/useGSAPAnimations'

export function GSAPProvider() {
  useGSAPScrollAnimations()
  return null
}
