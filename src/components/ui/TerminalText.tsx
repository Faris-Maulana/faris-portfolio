'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

const TITLES = ['AI Engineer', 'RAG Architect', 'LLM Safety Researcher', 'Data Engineer', 'Smart Contract Auditor']

export function TerminalText() {
  const [index, setIndex] = useState(0)
  const [display, setDisplay] = useState('')
  const [deleting, setDeleting] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const tick = useCallback(() => {
    const current = TITLES[index]

    if (!deleting) {
      if (display.length < current.length) {
        setDisplay(current.slice(0, display.length + 1))
      } else {
        setDeleting(true)
      }
    } else {
      if (display.length > 0) {
        setDisplay(display.slice(0, -1))
      } else {
        setDeleting(false)
        setIndex((i) => (i + 1) % TITLES.length)
      }
    }
  }, [index, display, deleting])

  useEffect(() => {
    const current = TITLES[index]
    const delay = !deleting
      ? display.length < current.length ? 80 : 2000
      : display.length > 0 ? 40 : 500

    timeoutRef.current = setTimeout(tick, delay)
    return () => clearTimeout(timeoutRef.current)
  }, [tick, index, display, deleting])

  return (
    <span className="inline-flex items-center">
      <span className="text-cyan">{display}</span>
      <span className="w-[3px] h-[1em] bg-cyan ml-1 animate-pulse" />
    </span>
  )
}
