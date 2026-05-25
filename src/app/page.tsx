'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Hero } from '@/components/sections/Hero'
import { About } from '@/components/sections/About'

const SectionLoader = () => (
  <div className="section">
    <div className="container">
      <div className="h-8 w-48 bg-surface/40 rounded animate-pulse mb-4" />
      <div className="h-4 w-32 bg-surface/30 rounded animate-pulse mb-12" />
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
      <About />
      <Suspense fallback={<SectionLoader />}><Experience /></Suspense>
      <Suspense fallback={<SectionLoader />}><Projects /></Suspense>
      <Suspense fallback={<SectionLoader />}><Skills /></Suspense>
      <Suspense fallback={<SectionLoader />}><QuantPortfolio /></Suspense>
      <Suspense fallback={<SectionLoader />}><Certificates /></Suspense>
      <Suspense fallback={<SectionLoader />}><Blog /></Suspense>
      <Suspense fallback={<SectionLoader />}><Contact /></Suspense>
    </>
  )
}
