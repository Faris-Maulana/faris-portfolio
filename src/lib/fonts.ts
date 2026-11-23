import { Archivo, Source_Sans_3 } from 'next/font/google'

/** Display uses Archivo's width axis; long-form reading uses Source Sans 3. */
export const fontArchivo = Archivo({
  subsets: ['latin'],
  display: 'swap',
  variable: '--f-archivo',
  axes: ['wdth'],
})

export const fontSourceSans = Source_Sans_3({
  subsets: ['latin'],
  display: 'swap',
  variable: '--f-source-sans',
})

export const fontVariables = `${fontArchivo.variable} ${fontSourceSans.variable}`
