'use client'

import Link from 'next/link'
import { ArrowUpRight, Clock } from 'lucide-react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Reveal } from '@/components/ui/Reveal'
import { GithubIcon } from '@/components/ui/Icons'
import { SITE_CONFIG } from '@/lib/constants'
import type { BlogPost } from '@/lib/supabase/types'

function formatDate(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d)
}

/**
 * The empty state is a deliberate panel rather than a hidden section.
 *
 * A grid that collapses to nothing reads as a bug. Saying plainly that the
 * writing is not published yet, and pointing at the work that is, keeps the
 * page honest without leaving a hole in the rhythm.
 */
function NothingPublished() {
  return (
    <Reveal className="panel ticks mt-14 p-8 sm:p-12">
      <p className="t-label mb-4">Status</p>
      <p className="t-h3 max-w-[34ch] text-ink">
        Notes are still in drafts, not on the site.
      </p>
      <p className="t-body mt-4 max-w-[58ch] text-sm">
        Most of what I would write about right now sits behind an NDA or an air
        gap. Until that changes, the code and the case studies are the honest
        record.
      </p>
      <div className="mt-8 flex flex-wrap gap-2">
        <a href="#research" data-cursor="hover" className="btn btn-ghost">
          Read the case studies
        </a>
        <a
          href={SITE_CONFIG.github}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="hover"
          className="btn btn-ghost"
        >
          <GithubIcon size={14} />
          Browse the code
          <ArrowUpRight size={13} />
        </a>
      </div>
    </Reveal>
  )
}

export function Writing({ posts }: { posts: BlogPost[] }) {
  return (
    <section id="blog" className="section">
      <div className="container">
        <SectionHeader
          index="07"
          label="Writing"
          meta={posts.length > 0 ? `${posts.length} published` : undefined}
          title={['Notes from', <span key="2" className="text-ink-3">the build.</span>]}
          lead="Occasional writing on agent architecture, retrieval evaluation, and what breaks when a model meets a real data platform."
        />

        {posts.length === 0 ? (
          <NothingPublished />
        ) : (
          <>
            <ul className="mt-14">
              {posts.map((post, i) => (
                <Reveal
                  as="li"
                  key={post.id}
                  delay={Math.min(i, 4) * 70}
                  className="border-t border-line last:border-b"
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    data-cursor="hover"
                    className="group grid gap-3 py-7 transition-colors duration-300 hover:bg-white/[0.015] lg:grid-cols-12 lg:items-baseline lg:gap-8"
                  >
                    <span className="t-label tnum lg:col-span-2">
                      {formatDate(post.published_at)}
                    </span>

                    <span className="lg:col-span-7">
                      <span className="block font-display text-lg font-bold tracking-tight text-ink transition-colors group-hover:text-signal">
                        {post.title}
                      </span>
                      {post.excerpt ? (
                        <span className="mt-1.5 block max-w-[68ch] text-sm text-ink-3">
                          {post.excerpt}
                        </span>
                      ) : null}
                      {post.tags?.length ? (
                        <span className="mt-3 flex flex-wrap gap-1.5">
                          {post.tags.slice(0, 4).map(tag => (
                            <span
                              key={tag}
                              className="rounded-md border border-line px-2 py-0.5 font-mono text-[11px] text-ink-3"
                            >
                              {tag}
                            </span>
                          ))}
                        </span>
                      ) : null}
                    </span>

                    <span className="flex items-center gap-5 lg:col-span-3 lg:justify-end">
                      {post.read_time_min ? (
                        <span className="t-label flex items-center gap-1.5">
                          <Clock size={11} />
                          {post.read_time_min} min
                        </span>
                      ) : null}
                      <ArrowUpRight
                        size={15}
                        className="text-ink-4 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-signal"
                      />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </ul>

            <Reveal delay={120} className="mt-10">
              <Link href="/blog" data-cursor="hover" className="btn btn-ghost">
                All writing
                <ArrowUpRight size={13} />
              </Link>
            </Reveal>
          </>
        )}
      </div>
    </section>
  )
}
