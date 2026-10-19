import { Archivo } from 'next/font/google'

/**
 * One variable family carries the whole system.
 *
 * Archivo ships both a weight and a width axis, so the expanded display cut and
 * the normal-width text cut are the same file. That is one font request instead
 * of four, and the headline and body type share their proportions by
 * construction rather than by pairing.
 *
 * Self-hosted at build time by next/font: no runtime request to Google.
 */
export const fontArchivo = Archivo({
  subsets: ['latin'],
  display: 'swap',
  variable: '--f-archivo',
  axes: ['wdth'],
})

export const fontVariables = fontArchivo.variable
