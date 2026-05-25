import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import { Toaster } from 'sonner'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CustomCursor } from '@/components/ui/CustomCursor'
import { ScrollProgress } from '@/components/ui/ScrollProgress'
import { AnalyticsTracker } from '@/components/AnalyticsTracker'
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider'
import { ChatWidget } from '@/components/chat/ChatWidget'
import { BootSequence } from '@/components/BootSequence'
import { GSAPProvider } from '@/components/GSAPProvider'
import { AudioProvider } from '@/components/AudioProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Faris Maulana — Shadow Architect',
  description: 'AI Engineer & Researcher. Building autonomous systems in the shadows.',
  keywords: ['AI Engineer', 'LangGraph', 'Shadow Architect', 'RAG', 'Indonesia'],
  openGraph: {
    title: 'Faris Maulana — Shadow Architect',
    description: 'Manager AI Engineering @ PT Trans Indonesia Superkoridor.',
    type: 'website',
  },
  themeColor: '#030309',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">
        <AudioProvider>
          <BootSequence />
        </AudioProvider>
        <CustomCursor />
        <ScrollProgress />
        <AnalyticsTracker />
        <GSAPProvider />

        <Navbar />
        <SmoothScrollProvider>
          <main className="flex-1">{children}</main>
        </SmoothScrollProvider>
        <Footer />
        <ChatWidget />
        <Toaster
          position="bottom-left"
          toastOptions={{
            style: {
              background: 'rgba(12,10,31,0.95)',
              border: '1px solid rgba(168,85,247,0.2)',
              color: '#f3e8ff',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '11px',
            },
          }}
        />
        <Analytics />
      </body>
    </html>
  )
}
