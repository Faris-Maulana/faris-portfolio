import { ArrowUp, ArrowUpRight, Mail } from 'lucide-react'
import { GithubIcon, LinkedinIcon } from '@/components/ui/Icons'
import { NAV_LINKS, SITE_CONFIG } from '@/lib/constants'

const SOCIALS = [
  { Icon: GithubIcon, href: SITE_CONFIG.github, label: 'GitHub' },
  { Icon: LinkedinIcon, href: SITE_CONFIG.linkedin, label: 'LinkedIn' },
  { Icon: Mail, href: `mailto:${SITE_CONFIG.email}`, label: 'Email' },
]

export function Footer() {
  return (
    <footer className="border-t border-line bg-canvas-2">
      <div className="pad-for-fab container pt-16 lg:pt-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <p className="kicker">A useful first conversation</p>
            <a href={`mailto:${SITE_CONFIG.email}`} className="group mt-6 inline-flex max-w-[13ch] items-start gap-3 font-display text-4xl font-semibold leading-[0.98] tracking-tight text-ink sm:text-6xl lg:text-7xl wide">
              Bring me the constraint.<ArrowUpRight className="mt-1 shrink-0 text-signal transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" size={30} aria-hidden />
            </a>
            <p className="t-body mt-5 max-w-xl text-base">{SITE_CONFIG.availability.detail}. Direct email is always available if the form or assistant is not.</p>
          </div>
          <div className="grid gap-8 text-sm lg:col-span-5 lg:grid-cols-2">
            <nav aria-label="Footer navigation"><p className="t-meta mb-4">Index</p><ul className="space-y-2">{NAV_LINKS.map(link => <li key={link.href}><a href={`/${link.href}`} className="text-ink-2 hover:text-signal">{link.label}</a></li>)}</ul></nav>
            <div><p className="t-meta mb-4">Elsewhere</p><ul className="space-y-3">{SOCIALS.map(({ Icon, href, label }) => <li key={label}><a href={href} target={href.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer" className="inline-flex items-center gap-2 text-ink-2 hover:text-signal"><Icon size={15} aria-hidden />{label}</a></li>)}</ul></div>
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-4 border-t border-line py-6 sm:flex-row sm:items-center">
          <p className="t-meta">© {new Date().getFullYear()} Faris Maulana / Built with Next.js</p>
          <p className="t-meta sm:ml-auto"><span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-signal" aria-hidden />{SITE_CONFIG.availability.status}</p>
          <a href="#main" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-2 hover:text-signal sm:ml-6"><ArrowUp size={15} aria-hidden /> Back to top</a>
        </div>
      </div>
    </footer>
  )
}
