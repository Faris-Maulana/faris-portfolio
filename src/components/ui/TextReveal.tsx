'use client'

import { useEffect, useRef, useState } from 'react'

type RevealMode = 'wipe' | 'glitch' | 'fade'

const GLITCH_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?'

function useOnScreen(threshold = 0.3) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.unobserve(el)
        }
      },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return { ref, visible }
}

function GlitchText({ text, visible }: { text: string; visible: boolean }) {
  const [display, setDisplay] = useState('')

  useEffect(() => {
    if (!visible) return
    let frame = 0
    const totalFrames = 30

    const interval = setInterval(() => {
      frame++
      const progress = frame / totalFrames
      const revealCount = Math.floor(progress * text.length)

      setDisplay(
        text
          .split('')
          .map((char, i) => {
            if (i < revealCount) return char
            if (i === revealCount && progress < 1)
              return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
            return ' '
          })
          .join('')
      )

      if (frame >= totalFrames) {
        setDisplay(text)
        clearInterval(interval)
      }
    }, 40)

    return () => clearInterval(interval)
  }, [text, visible])

  return <>{display}</>
}

export function TextReveal({
  children,
  as: Tag = 'div',
  mode = 'fade',
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  as?: 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'p'
  mode?: RevealMode
  delay?: number
  className?: string
}) {
  const { ref, visible } = useOnScreen(0.2)

  if (mode === 'glitch' && typeof children === 'string') {
    return (
      <Tag ref={ref} className={className}>
        <GlitchText text={children} visible={visible} />
      </Tag>
    )
  }

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        filter: visible ? 'blur(0)' : 'blur(4px)',
        transition: `opacity 0.8s cubic-bezier(0.19,1,0.22,1) ${delay}ms, transform 0.8s cubic-bezier(0.19,1,0.22,1) ${delay}ms, filter 0.8s cubic-bezier(0.19,1,0.22,1) ${delay}ms`,
      }}
    >
      {children}
    </Tag>
  )
}
