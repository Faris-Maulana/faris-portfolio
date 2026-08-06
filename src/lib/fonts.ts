import { Inter, Inter_Tight, JetBrains_Mono, Instrument_Serif } from 'next/font/google'

/**
 * Self-hosted at build time by next/font, no runtime request to Google,
 * no render-blocking @import, no FOIT. Each font exposes a CSS variable
 * that globals.css maps onto the `--font-*` design tokens.
 */

export const fontBody = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--f-body',
  weight: ['300', '400', '500', '600'],
})

export const fontDisplay = Inter_Tight({
  subsets: ['latin'],
  display: 'swap',
  variable: '--f-display',
  weight: ['500', '600', '700', '800', '900'],
})

export const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--f-mono',
  weight: ['300', '400', '500', '700'],
})

/** Used sparingly, one italic accent word inside display headlines. */
export const fontSerif = Instrument_Serif({
  subsets: ['latin'],
  display: 'swap',
  variable: '--f-serif',
  weight: ['400'],
  style: ['italic'],
})

export const fontVariables = [
  fontBody.variable,
  fontDisplay.variable,
  fontMono.variable,
  fontSerif.variable,
].join(' ')
