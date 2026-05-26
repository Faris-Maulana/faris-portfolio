'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Hero } from '@/components/sections/Hero'
import { About } from '@/components/sections/About'
import { HoloDivider } from '@/components/ui/HoloDivider'

const SectionSkeleton = () => (
  <div className="section">
    <div className="container">
      <div className="h-8 w-48 rounded animate-pulse mb-4"
        style={{ background: 'rgba(59,130,246,0.1)' }} />
      <div className="h-4 w-32 rounded animate-pulse mb-12"
        style={{ background: 'rgba(59,130,246,0.08)' }} />
      <div className="grid gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-40 animate-pulse"
            style={{
              background: 'rgba(8,17,25,0.4)',
              border: '1px solid rgba(59,130,246,0.1)',
              clipPath: 'polygon(0% 0%, 96% 0%, 100% 4%, 100% 100%, 4% 100%, 0% 96%)',
            }} />
        ))}
      </div>
    </div>
  </div>
)

const Experience = dynamic(() => import('@/components/sections/Experience').then(m => ({ default: m.Experience })), { ssr: false, loading: () => <SectionSkeleton /> })
const Projects = dynamic(() => import('@/components/sections/Projects').then(m => ({ default: m.Projects })), { ssr: false, loading: () => <SectionSkeleton /> })
const Skills = dynamic(() => import('@/components/sections/Skills').then(m => ({ default: m.Skills })), { ssr: false, loading: () => <SectionSkeleton /> })
const QuantPortfolio = dynamic(() => import('@/components/sections/QuantPortfolio').then(m => ({ default: m.QuantPortfolio })), { ssr: false, loading: () => <SectionSkeleton /> })
const Certificates = dynamic(() => import('@/components/sections/Certificates').then(m => ({ default: m.Certificates })), { ssr: false, loading: () => <SectionSkeleton /> })
const Blog = dynamic(() => import('@/components/sections/Blog').then(m => ({ default: m.Blog })), { ssr: false, loading: () => <SectionSkeleton /> })
const Contact = dynamic(() => import('@/components/sections/Contact').then(m => ({ default: m.Contact })), { ssr: false, loading: () => <SectionSkeleton /> })

const SECTIONS = [
  { id: 'about',      label: 'STATUS',    Component: About },
  { id: 'experience', label: 'QUESTS',    Component: Experience },
  { id: 'projects',   label: 'INVENTORY', Component: Projects },
  { id: 'skills',     label: 'SKILL TREE',Component: Skills },
  { id: 'research',   label: 'COMBAT LOG',Component: QuantPortfolio },
  { id: 'certificates',label: 'TITLES',   Component: Certificates },
  { id: 'blog',       label: 'BROADCAST', Component: Blog },
  { id: 'contact',    label: 'CONTACT',   Component: Contact },
] as const

export default function Home() {
  return (
    <>
      <Hero />
      {SECTIONS.map(({ label, Component }, i) => (
        <div key={label}>
          <HoloDivider label={label} index={i + 1} total={SECTIONS.length} />
          <Suspense fallback={<SectionSkeleton />}>
            <Component />
          </Suspense>
        </div>
      ))}
    </>
  )
}
