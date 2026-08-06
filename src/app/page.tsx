import { Hero } from '@/components/sections/Hero'
import { CredibilityStrip } from '@/components/sections/CredibilityStrip'
import { About } from '@/components/sections/About'
import { Experience } from '@/components/sections/Experience'
import { Projects } from '@/components/sections/Projects'
import { Skills } from '@/components/sections/Skills'
import { QuantPortfolio } from '@/components/sections/QuantPortfolio'
import { Certificates } from '@/components/sections/Certificates'
import { Writing } from '@/components/sections/Writing'
import { Contact } from '@/components/sections/Contact'
import { getRepos } from '@/lib/github'
import { getPosts } from '@/lib/posts'

/**
 * Server component.
 *
 * Every section used to be a `dynamic(..., { ssr: false })` import, which meant
 * crawlers, and anyone on a slow connection, received a page containing a
 * hero and seven loading skeletons. The sections are still client components,
 * but rendering them on the server puts the actual content in the HTML.
 */
export const revalidate = 3600

export default async function Home() {
  const [repos, posts] = await Promise.all([getRepos(), getPosts()])

  return (
    <>
      <Hero />
      <CredibilityStrip />
      <About />
      <Experience />
      <Projects repos={repos} />
      <Skills />
      <QuantPortfolio />
      <Certificates />
      <Writing posts={posts} />
      <Contact />
    </>
  )
}
