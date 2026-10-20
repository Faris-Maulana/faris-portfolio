import { Hero } from '@/components/sections/Hero'
import { Leadership } from '@/components/sections/Leadership'
import { Work } from '@/components/sections/Work'
import { Experience } from '@/components/sections/Experience'
import { QuantPortfolio } from '@/components/sections/QuantPortfolio'
import { Capabilities } from '@/components/sections/Capabilities'
import { Credentials } from '@/components/sections/Credentials'
import { Contact } from '@/components/sections/Contact'
import { getRepos } from '@/lib/github'
import { deliveryConfigured } from '@/lib/notify'

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
  const repos = await getRepos()

  return (
    <>
      <Hero />
      <Leadership />
      <Work repos={repos} />
      <Experience />
      <QuantPortfolio />
      <Capabilities />
      <Credentials />
      {/* Without a delivery key the form hands the message to the visitor's own
          mail or WhatsApp instead of a server that cannot pass it on. */}
      <Contact serverDelivery={deliveryConfigured()} />
    </>
  )
}
