'use client'

import { ArrowUpRight, ArrowUp } from 'lucide-react'
import { GithubIcon, LinkedinIcon } from '@/components/ui/Icons'
import { Mail } from 'lucide-react'
import { NAV_LINKS, SITE_CONFIG } from '@/lib/constants'

const SOCIALS = [
  { Icon: GithubIcon, href: SITE_CONFIG.github, label: 'GitHub' },
  { Icon: LinkedinIcon, href: SITE_CONFIG.linkedin, label: 'LinkedIn' },
  { Icon: Mail, href: `mailto:${SITE_CONFIG.email}`, label: 'Email' },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative border-t border-line">
      <div className="pad-for-fab container pt-16 lg:pt-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          {/* ── Call to action ────────────────────────────────────────── */}
          <div className="lg:col-span-6">
            <p className="t-label mb-5">Let’s build something</p>
            <a
              href={`mailto:${SITE_CONFIG.email}`}
              data-cursor="hover"
              className="group inline-flex max-w-full items-start gap-3"
            >
              <span className="t-h3 break-all text-ink transition-colors duration-300 group-hover:text-signal">
                {SITE_CONFIG.email}
              </span>
              <ArrowUpRight
                size={20}
                className="mt-1 flex-none text-ink-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-signal"
              />
            </a>
            <p className="mt-5 max-w-[42ch] text-sm text-ink-3">
              {SITE_CONFIG.availableFor}. {SITE_CONFIG.responseTime}.
            </p>

            <ul className="mt-8 flex items-center gap-2">
              {SOCIALS.map(({ Icon, href, label }) => (
                <li key={label}>
                  <a
                    href={href}
                    target={href.startsWith('mailto:') ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    aria-label={label}
                    data-cursor="hover"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink-3 transition-colors duration-300 hover:border-line-3 hover:text-ink"
                  >
                    <Icon size={15} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Index ─────────────────────────────────────────────────── */}
          <nav className="lg:col-span-3" aria-label="Footer">
            <p className="t-label mb-5">Index</p>
            <ul>
              {NAV_LINKS.map(link => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    data-cursor="hover"
                    className="inline-flex min-h-11 items-center py-1 text-sm text-ink-2 transition-colors hover:text-ink"
                  >
                    <span className="link-draw">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Documents ─────────────────────────────────────────────── */}
          <div className="lg:col-span-3">
            <p className="t-label mb-5">Documents</p>
            <ul>
              {[
                { label: 'Curriculum vitae', href: SITE_CONFIG.cvPath },
                { label: 'Professional portfolio', href: SITE_CONFIG.portfolioPath },
                { label: 'Quantitative portfolio', href: SITE_CONFIG.quantPath },
              ].map(doc => (
                <li key={doc.href}>
                  <a
                    href={doc.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="hover"
                    className="inline-flex min-h-11 items-center py-1 text-sm text-ink-2 transition-colors hover:text-ink"
                  >
                    <span className="link-draw">{doc.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Colophon ────────────────────────────────────────────────── */}
        <div className="mt-14 flex flex-col gap-5 border-t border-line pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="t-label">
            © {year} {SITE_CONFIG.name} · {SITE_CONFIG.location}
          </p>
          <div className="flex items-center gap-6">
            <span className="t-label flex items-center gap-2">
              <span className="pulse-dot" aria-hidden />
              Operational
            </span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              data-cursor="hover"
              className="t-label flex min-h-11 items-center gap-1.5 transition-colors hover:text-ink"
            >
              Top <ArrowUp size={12} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
