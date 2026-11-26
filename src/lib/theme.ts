import { LIGHT_PALETTE, PALETTE } from '@/lib/design-tokens'

export const THEME_STORAGE_KEY = 'faris-theme'

export type ThemeMode = 'light' | 'dark' | 'system'
export type ResolvedTheme = Exclude<ThemeMode, 'system'>

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system'
}

export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode !== 'system') return mode
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(mode: ThemeMode, persist = true): ResolvedTheme {
  const resolved = resolveTheme(mode)
  const root = document.documentElement
  root.dataset.theme = resolved
  root.dataset.themeMode = mode
  root.style.colorScheme = resolved
  const color = resolved === 'dark' ? PALETTE.canvas : LIGHT_PALETTE.canvas
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach(meta => {
    meta.content = color
    meta.removeAttribute('media')
  })
  if (persist) {
    try { window.localStorage.setItem(THEME_STORAGE_KEY, mode) } catch { /* Storage can be blocked without breaking the theme. */ }
  }
  window.dispatchEvent(new Event('faris-themechange'))
  return resolved
}

/**
 * Parser-blocking, dependency-free bootstrap. It runs before the first paint and
 * leaves safe dark defaults in place when storage or matchMedia is unavailable.
 */
export const THEME_INIT_SCRIPT = `(function(){var r=document.documentElement,m='system';try{var v=localStorage.getItem('${THEME_STORAGE_KEY}');if(v==='light'||v==='dark'||v==='system')m=v}catch(e){}var t=m;if(m==='system'){try{t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}catch(e){t='dark'}}r.dataset.theme=t;r.dataset.themeMode=m;r.style.colorScheme=t;try{document.querySelectorAll('meta[name="theme-color"]').forEach(function(n){n.content=t==='dark'?'${PALETTE.canvas}':'${LIGHT_PALETTE.canvas}';n.removeAttribute('media')})}catch(e){}})();`
