'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Hero } from '@/components/sections/Hero'
import { About } from '@/components/sections/About'
import { SectionDivider } from '@/components/ui/SectionDivider'

const SectionLoader = () => (
  <div className="section">
    <div className="container">
      <div className="h-8 w-48 bg-shadow/40 rounded animate-pulse mb-4" />
      <div className="h-4 w-32 bg-shadow/30 rounded animate-pulse mb-12" />
      <div className="grid gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="glass rounded-2xl h-40 animate-pulse" />
        ))}
      </div>
    </div>
  </div>
)

const Experience = dynamic(() => import('@/components/sections/Experience').then(m => ({ default: m.Experience })), { ssr: false })
const Projects = dynamic(() => import('@/components/sections/Projects').then(m => ({ default: m.Projects })), { ssr: false })
const Skills = dynamic(() => import('@/components/sections/Skills').then(m => ({ default: m.Skills })), { ssr: false })
const QuantPortfolio = dynamic(() => import('@/components/sections/QuantPortfolio').then(m => ({ default: m.QuantPortfolio })), { ssr: false })
const Certificates = dynamic(() => import('@/components/sections/Certificates').then(m => ({ default: m.Certificates })), { ssr: false })
const Blog = dynamic(() => import('@/components/sections/Blog').then(m => ({ default: m.Blog })), { ssr: false })
const Contact = dynamic(() => import('@/components/sections/Contact').then(m => ({ default: m.Contact })), { ssr: false })

export default function Home() {
  return (
    <>
      <Hero />
      <SectionDivider label="The Archive" />
      <About />
      <SectionDivider label="Chronicle of Conquest" />
      <Suspense fallback={<SectionLoader />}><Experience /></Suspense>
      <SectionDivider label="The Arsenal" />
      <Suspense fallback={<SectionLoader />}><Projects /></Suspense>
      <SectionDivider label="Shadow Dominion" />
      <Suspense fallback={<SectionLoader />}><Skills /></Suspense>
      <SectionDivider label="Scrolls of Evidence" />
      <Suspense fallback={<SectionLoader />}><QuantPortfolio /></Suspense>
      <SectionDivider label="Seals of Authority" />
      <Suspense fallback={<SectionLoader />}><Certificates /></Suspense>
      <SectionDivider label="Missives from the Shadow" />
      <Suspense fallback={<SectionLoader />}><Blog /></Suspense>
      <SectionDivider label="Summon the Architect" />
      <Suspense fallback={<SectionLoader />}><Contact /></Suspense>
    </>
  )
}
