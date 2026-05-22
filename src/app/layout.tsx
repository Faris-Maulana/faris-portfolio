import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import { Toaster } from 'sonner'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ScrollProgress } from '@/components/ui/ScrollProgress'
import { ChatWidget } from '@/components/chat/ChatWidget'
import { AnalyticsTracker } from '@/components/AnalyticsTracker'
import './globals.css'

export const metadata: Metadata = {
  title: 'Faris Maulana | AI Engineer & Researcher',
  description: 'Manager AI Engineering @ PT Trans Indonesia Superkoridor. Building production AI systems, RAG architectures, and Web3 security research.',
  keywords: ['AI Engineer', 'RAG', 'LangChain', 'Indonesia', 'Machine Learning', 'Smart Contract Security'],
  openGraph: {
    title: 'Faris Maulana | AI Engineer & Researcher',
    description: 'Building production AI systems · Fiber-optic infrastructure intelligence · Web3 security',
    type: 'website',
    locale: 'en_US',
    siteName: 'Faris Maulana Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Faris Maulana | AI Engineer & Researcher',
    description: 'Building production AI systems · Fiber-optic infrastructure intelligence · Web3 security',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">
        <AnalyticsTracker />
        <ScrollProgress />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatWidget />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'rgba(10, 17, 24, 0.9)',
              border: '1px solid rgba(0, 245, 255, 0.1)',
              color: '#e8f4f8',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '12px',
            },
          }}
        />
        <Analytics />
      </body>
    </html>
  )
}
