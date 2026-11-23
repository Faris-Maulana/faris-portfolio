export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function scrollToTarget(id: string) {
  const target = document.getElementById(id)
  if (!target) return
  target.scrollIntoView({ behavior: prefersReducedMotion() ? 'instant' : 'smooth', block: 'start' })
}

export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'instant' : 'smooth' })
}

export function scrollContainerToBottom(container: HTMLElement | null) {
  if (!container) return
  // Chat transcripts jump to the newest line. Animating here races message
  // updates and briefly shows a stale position mid-conversation.
  container.scrollTo({ top: container.scrollHeight, behavior: 'auto' })
}
