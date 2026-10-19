import { Hero } from '@/components/sections/Hero'
import { Leadership } from '@/components/sections/Leadership'
import { Work } from '@/components/sections/Work'
import { Experience } from '@/components/sections/Experience'
import { QuantPortfolio } from '@/components/sections/QuantPortfolio'
import { Capabilities } from '@/components/sections/Capabilities'
import { Credentials } from '@/components/sections/Credentials'
import { Writing } from '@/components/sections/Writing'
import { Contact } from '@/components/sections/Contact'
import { getRepos } from '@/lib/github'
import { getPosts } from '@/lib/posts'

/**
 * Server component. The sections are client components, but rendering them
 * on the server puts the actual content in the HTML for crawlers and slow
 * connections.
 *
 * Order follows what a hiring manager needs, in the order they need it: the
 * claim, what is owned and how it is run, the evidence, then the history.
 */
export const revalidate = 3600

export default async function Home() {
  const [repos, posts] = await Promise.all([getRepos(), getPosts()])

  return (
    <>
      <Hero />
      <Leadership />
      <Work repos={repos} />
      <Experience />
      <QuantPortfolio />
      <Capabilities />
      <Credentials />
      {/* An empty "coming soon" section is dead weight at this level. It
          appears the day there is something to read. */}
      {posts.length > 0 ? <Writing posts={posts} /> : null}
      <Contact />
    </>
  )
}
