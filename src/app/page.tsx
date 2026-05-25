'use client'

import dynamic from 'next/dynamic'
import { Hero } from '@/components/sections/Hero'
import { About } from '@/components/sections/About'

const Experience = dynamic(() => import('@/components/sections/Experience').then(m => ({ default: m.Experience })), { ssr: false })
const Projects = dynamic(() => import('@/components/sections/Projects').then(m => ({ default: m.Projects })), { ssr: false })
const Skills = dynamic(() => import('@/components/sections/Skills').then(m => ({ default: m.Skills })), { ssr: false })
const Contact = dynamic(() => import('@/components/sections/Contact').then(m => ({ default: m.Contact })), { ssr: false })
const QuantPortfolio = dynamic(() => import('@/components/sections/QuantPortfolio').then(m => ({ default: m.QuantPortfolio })), { ssr: false })
const Certificates = dynamic(() => import('@/components/sections/Certificates').then(m => ({ default: m.Certificates })), { ssr: false })
const Blog = dynamic(() => import('@/components/sections/Blog').then(m => ({ default: m.Blog })), { ssr: false })

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Experience />
      <Projects />
      <Skills />
      <QuantPortfolio />
      <Certificates />
      <Blog />
      <Contact />
    </>
  )
}
