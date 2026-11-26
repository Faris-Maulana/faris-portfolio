'use client'

import { useEffect, useRef, useSyncExternalStore } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { applyTheme, isThemeMode, THEME_STORAGE_KEY, type ResolvedTheme, type ThemeMode } from '@/lib/theme'

const ORDER: readonly ThemeMode[] = ['light', 'dark', 'system']
const LABELS: Record<ThemeMode, string> = { light: 'Light', dark: 'Dark', system: 'System' }
const ICONS = { light: Sun, dark: Moon, system: Monitor }

type TransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> }
}

function subscribe(onChange: () => void) {
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  const onSystemChange = () => {
    if (document.documentElement.dataset.themeMode === 'system') applyTheme('system', false)
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY) return
    if (event.newValue === null) {
      applyTheme('system', false)
      return
    }
    if (!isThemeMode(event.newValue)) return
    applyTheme(event.newValue, false)
  }
  media.addEventListener('change', onSystemChange)
  window.addEventListener('storage', onStorage)
  window.addEventListener('faris-themechange', onChange)
  return () => {
    media.removeEventListener('change', onSystemChange)
    window.removeEventListener('storage', onStorage)
    window.removeEventListener('faris-themechange', onChange)
  }
}

const getModeSnapshot = () => {
  const mode = document.documentElement.dataset.themeMode
  return isThemeMode(mode) ? mode : 'system'
}
const getResolvedSnapshot = () => document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const mode = useSyncExternalStore<ThemeMode>(subscribe, getModeSnapshot, () => 'system')
  const resolved = useSyncExternalStore<ResolvedTheme>(subscribe, getResolvedSnapshot, () => 'dark')
  const fallbackTimer = useRef(0)
  const Icon = ICONS[mode]
  const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length]

  useEffect(() => {
    applyTheme(getModeSnapshot(), false)
    return () => window.clearTimeout(fallbackTimer.current)
  }, [])

  const changeTheme = () => {
    const root = document.documentElement
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const update = () => applyTheme(next)

    const transitionDocument = document as TransitionDocument
    if (!reduced && transitionDocument.startViewTransition) {
      const transition = transitionDocument.startViewTransition(update)
      void transition.finished.catch(() => { /* A skipped transition keeps the applied theme. */ })
      return
    }

    update()
    if (reduced) return
    root.classList.remove('theme-fallback')
    requestAnimationFrame(() => {
      root.classList.add('theme-fallback')
      fallbackTimer.current = window.setTimeout(() => root.classList.remove('theme-fallback'), 240)
    })
  }

  return (
    <>
      <button
        type="button"
        className={compact ? 'theme-switch theme-switch-compact' : 'theme-switch'}
        onClick={changeTheme}
        aria-label={`Theme: ${LABELS[mode]}, ${resolved} appearance. Switch to ${LABELS[next].toLowerCase()} mode`}
        title={`Switch to ${LABELS[next].toLowerCase()} mode`}
        data-theme-mode={mode}
      >
        <span className="theme-icon" key={mode}><Icon size={16} strokeWidth={1.8} aria-hidden /></span>
        <span className="theme-switch-label">{LABELS[mode]}</span>
      </button>
      <span className="sr-only" role="status" aria-live="polite">{LABELS[mode]} theme preference, {resolved} appearance</span>
    </>
  )
}
