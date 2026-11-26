import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ScrollProgress } from '@/components/ui/ScrollProgress'
import { SectionRail } from '@/components/ui/SectionRail'
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider'
import { RevealProvider } from '@/components/providers/RevealProvider'
import { ChatWidget } from '@/components/chat/ChatWidget'
import { fontVariables } from '@/lib/fonts'
import { SITE_CONFIG } from '@/lib/constants'
import { SITE_URL } from '@/lib/site'
import { PALETTE, LIGHT_PALETTE } from '@/lib/design-tokens'
import { THEME_INIT_SCRIPT } from '@/lib/theme'
import './globals.css'

const DESCRIPTION = 'Faris Maulana is an AI Engineering Manager building governed data platforms, evaluated LLM systems and multi-agent architecture for critical infrastructure in Indonesia.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Faris Maulana, AI Engineering Manager', template: '%s · Faris Maulana' },
  description: DESCRIPTION,
  applicationName: 'Faris Maulana',
  authors: [{ name: SITE_CONFIG.name, url: SITE_URL }],
  creator: SITE_CONFIG.name,
  keywords: ['AI Engineering Manager', 'LangGraph', 'Multi-agent systems', 'RAG evaluation', 'Text2SQL', 'ClickHouse', 'Data platform', 'Indonesia'],
  alternates: { canonical: '/' },
  openGraph: { type: 'profile', url: SITE_URL, siteName: SITE_CONFIG.name, title: 'Faris Maulana, AI Engineering Manager', description: DESCRIPTION, locale: 'en_US' },
  twitter: { card: 'summary_large_image', title: 'Faris Maulana, AI Engineering Manager', description: DESCRIPTION, images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Faris Maulana, AI Engineering Manager' }] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: LIGHT_PALETTE.canvas },
    { media: '(prefers-color-scheme: dark)', color: PALETTE.canvas },
  ],
  colorScheme: 'light dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
}

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: SITE_CONFIG.name,
  url: SITE_URL,
  email: `mailto:${SITE_CONFIG.email}`,
  jobTitle: SITE_CONFIG.role,
  worksFor: { '@type': 'Organization', name: SITE_CONFIG.company },
  address: { '@type': 'PostalAddress', addressLocality: 'Jakarta', addressCountry: 'ID' },
  sameAs: [SITE_CONFIG.github, SITE_CONFIG.linkedin],
  knowsAbout: ['AI engineering leadership', 'Large Language Models', 'Multi-agent systems', 'AI evaluation', 'Data engineering', 'Smart contract security'],
  alumniOf: { '@type': 'CollegeOrUniversity', name: 'Universitas Pancasila' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables} data-theme="dark" data-theme-mode="system" suppressHydrationWarning>
      <head><script id="theme-init" dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} /></head>
      <body className="flex min-h-dvh flex-col bg-canvas antialiased">
        <a href="#main" className="skip-link">Skip to content</a>
        <ScrollProgress />
        <RevealProvider />
        <Navbar />
        <SectionRail />
        <SmoothScrollProvider><main id="main" tabIndex={-1} className="relative z-10 flex-1">{children}</main></SmoothScrollProvider>
        <div className="relative z-10"><Footer /></div>
        <ChatWidget />
        {process.env.VERCEL ? <Analytics /> : null}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      </body>
    </html>
  )
}
