import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/react'
import { Toaster } from 'sonner'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CustomCursor } from '@/components/ui/CustomCursor'
import { ScrollProgress } from '@/components/ui/ScrollProgress'
import { SectionRail } from '@/components/ui/SectionRail'
import { AnalyticsTracker } from '@/components/AnalyticsTracker'
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider'
import { RevealProvider } from '@/components/providers/RevealProvider'
import { ChatWidget } from '@/components/chat/ChatWidget'
import { fontVariables } from '@/lib/fonts'
import { SITE_CONFIG } from '@/lib/constants'
import './globals.css'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
  'https://faris-portfolio-red.vercel.app'

const DESCRIPTION =
  'Faris Maulana builds production LLM systems, multi-agent architectures, and medallion data platforms on a 25,000 km national fiber backbone in Indonesia. Also a smart contract security researcher on Sherlock, Code4rena, and Immunefi.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Faris Maulana, AI Engineering Manager',
    template: '%s · Faris Maulana',
  },
  description: DESCRIPTION,
  applicationName: 'Faris Maulana',
  authors: [{ name: SITE_CONFIG.name, url: SITE_URL }],
  creator: SITE_CONFIG.name,
  keywords: [
    'AI Engineer',
    'AI Engineering Manager',
    'LangGraph',
    'Multi-agent systems',
    'RAG',
    'Text2SQL',
    'ClickHouse',
    'Data platform',
    'Smart contract audit',
    'Indonesia',
    'Jakarta',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'profile',
    url: SITE_URL,
    siteName: 'Faris Maulana',
    title: 'Faris Maulana, AI Engineering Manager',
    description: DESCRIPTION,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Faris Maulana, AI Engineering Manager',
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor: '#07080A',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

/**
 * Structured data. Recruiters and clients find this site through search far
 * more often than through a link, so the Person graph is worth the ~40 lines.
 */
const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: SITE_CONFIG.name,
  url: SITE_URL,
  email: `mailto:${SITE_CONFIG.email}`,
  jobTitle: SITE_CONFIG.role,
  worksFor: { '@type': 'Organization', name: SITE_CONFIG.company },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Jakarta',
    addressCountry: 'ID',
  },
  sameAs: [SITE_CONFIG.github, SITE_CONFIG.linkedin],
  knowsAbout: [
    'Large Language Models',
    'Multi-agent systems',
    'Retrieval-Augmented Generation',
    'Data engineering',
    'Business intelligence',
    'Smart contract security',
  ],
  alumniOf: {
    '@type': 'CollegeOrUniversity',
    name: 'Universitas Pancasila',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={fontVariables}>
      <body className="grain flex min-h-dvh flex-col bg-canvas antialiased">
        <a href="#main" className="skip-link">
          Skip to content
        </a>

        <ScrollProgress />
        <CustomCursor />
        <RevealProvider />
        <AnalyticsTracker />

        <Navbar />
        <SectionRail />
        <SmoothScrollProvider>
          <main id="main" className="relative flex-1">
            {children}
          </main>
        </SmoothScrollProvider>
        <Footer />
        <ChatWidget />

        <Toaster
          position="bottom-left"
          toastOptions={{
            style: {
              background: 'var(--color-surface)',
              border: '1px solid var(--color-line-2)',
              color: 'var(--color-ink)',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
            },
          }}
        />
        <Analytics />

        <script
          type="application/ld+json"
          // Serialised from a local literal, no user input reaches this string.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </body>
    </html>
  )
}
