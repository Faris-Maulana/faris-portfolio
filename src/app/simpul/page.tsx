import type { Metadata } from 'next'
import { SimpulExplorer } from '@/components/simpul/SimpulExplorer'
import { SITE_CONFIG } from '@/lib/constants'
import { SITE_URL } from '@/lib/site'
import { createRun } from '@/lib/simpul'
import '@/components/simpul/simpul.tokens.css'

const TITLE = 'SIMPUL, synthetic network flight recorder'
const DESCRIPTION = 'Replay deterministic synthetic fiber incidents, inspect evidence and branch policy decisions locally. No production network control or live model integration.'
const SIMPUL_URL = new URL('/simpul', SITE_URL).toString()
const SOCIAL_IMAGE = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: 'SIMPUL by Faris Maulana: local deterministic replay of synthetic fiber incidents, evidence inspection and policy branching.',
}

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/simpul' },
  openGraph: {
    type: 'website',
    url: SIMPUL_URL,
    siteName: SITE_CONFIG.name,
    title: TITLE,
    description: DESCRIPTION,
    locale: 'en_US',
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [SOCIAL_IMAGE],
  },
}

const softwareApplicationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'SIMPUL',
  description: DESCRIPTION,
  url: SIMPUL_URL,
  applicationCategory: 'DeveloperApplication',
  inLanguage: 'en',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
  author: { '@type': 'Person', name: SITE_CONFIG.name, url: SITE_URL },
  featureList: [
    'Deterministic replay of synthetic fiber-network incidents',
    'Local event and evidence inspection',
    'Counterfactual policy-decision branching without production control',
    'Self-contained replay JSON export',
  ],
}

export default function SimpulPage() {
  return (
    <>
      <SimpulExplorer initialRun={createRun()} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd).replaceAll('<', '\\u003c') }} />
    </>
  )
}
