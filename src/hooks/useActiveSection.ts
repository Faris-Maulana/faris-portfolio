'use client'

import { useSyncExternalStore } from 'react'

let active = ''
const listeners = new Set<() => void>()
let frame = 0
let listening = false

function read() {
  frame = 0
  let next = ''
  for (const section of document.querySelectorAll<HTMLElement>('main section[id]')) {
    if (section.getBoundingClientRect().top <= Math.min(180, window.innerHeight * 0.35)) next = section.id
  }
  if (next === active) return
  active = next
  listeners.forEach(listener => listener())
}

function schedule() {
  if (frame) return
  frame = requestAnimationFrame(read)
}

function start() {
  if (listening) return
  listening = true
  read()
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule, { passive: true })
}

function stop() {
  if (!listening || listeners.size) return
  listening = false
  cancelAnimationFrame(frame)
  frame = 0
  window.removeEventListener('scroll', schedule)
  window.removeEventListener('resize', schedule)
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  start()
  return () => { listeners.delete(listener); stop() }
}

export function useActiveSection() {
  return useSyncExternalStore(subscribe, () => active, () => '')
}
