import { Hero } from '@/components/sections/Hero'
import { About } from '@/components/sections/About'
import { Experience } from '@/components/sections/Experience'
import { Projects } from '@/components/sections/Projects'
import { Skills } from '@/components/sections/Skills'
import { QuantPortfolio } from '@/components/sections/QuantPortfolio'
import { Certificates } from '@/components/sections/Certificates'
import { Blog } from '@/components/sections/Blog'
import { Contact } from '@/components/sections/Contact'

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
