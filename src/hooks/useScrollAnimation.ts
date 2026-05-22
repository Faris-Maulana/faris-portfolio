'use client'

import { useInView } from 'react-intersection-observer'
import type { Variants } from 'framer-motion'

interface ScrollAnimationOptions {
  threshold?: number
  triggerOnce?: boolean
  delay?: number
}

export function useScrollAnimation(options: ScrollAnimationOptions = {}) {
  const { threshold = 0.1, triggerOnce = true, delay = 0 } = options

  const [ref, inView] = useInView({ threshold, triggerOnce })

  const variants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        delay,
      }
    }
  }

  const staggerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: delay }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
    }
  }

  return { ref, inView, variants, staggerVariants, itemVariants }
}
