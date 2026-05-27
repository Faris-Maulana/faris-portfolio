import type { Metadata, Viewport } from 'next'
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
import { Scene3D } from '@/components/3d/Scene3D'
import { RoamingUI } from '@/components/3d/RoamingUI'
import { RoamProvider } from '@/contexts/RoamContext'
import { ContentLayer } from '@/components/providers/ContentLayer'
import './globals.css'

export const metadata: Metadata = {
  title: 'Faris Maulana — System',
  description: 'Manager AI Engineering @ PT Trans Indonesia Superkoridor · Multi-agent systems · 25K+ km network',
  keywords: ['AI Engineer', 'LangGraph', 'System Architect', 'RAG', 'Indonesia'],
  openGraph: {
    title: 'Faris Maulana — System',
    description: 'Manager AI Engineering @ PT Trans Indonesia Superkoridor.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#030309',
  colorScheme: 'dark',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">
        <RoamProvider>
        <AudioProvider>
          <BootSequence />
        </AudioProvider>
        <Scene3D />
        <RoamingUI />
        <CustomCursor />
        <ScrollProgress />
        <AnalyticsTracker />
        <GSAPProvider />

        <Navbar />
        <SmoothScrollProvider>
          <ContentLayer>
          <main className="flex-1 relative z-5">{children}</main>
          </ContentLayer>
        </SmoothScrollProvider>
        <Footer />
        <ChatWidget />
        </RoamProvider>
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
