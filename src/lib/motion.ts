import type { Variants, Transition } from 'framer-motion'

export const EASE = {
  out:    [0.19, 1, 0.22, 1],
  smooth: [0.22, 1, 0.36, 1],
  spring: [0.34, 1.56, 0.64, 1],
} as const

export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE.smooth } },
}

export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: EASE.smooth } },
}

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: EASE.smooth } },
}

export const staggerChildren = (delay = 0.08): Transition => ({
  staggerChildren: delay,
  delayChildren: 0.05,
})

export const slideInFromLeft: Variants = {
  hidden:  { opacity: 0, x: -28 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE.smooth } },
}

export const slideInFromRight: Variants = {
  hidden:  { opacity: 0, x: 28 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE.smooth } },
}

export const viewportOnce = { once: true, margin: '-80px' }
