'use client'

import Link from 'next/link'
import { ArrowUpRight, Clock } from 'lucide-react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Reveal } from '@/components/ui/Reveal'
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

export function Writing({ posts }: { posts: BlogPost[] }) {
  return (
    <section id="writing" className="section">
      <div className="container">
        <SectionHeader
          label="Writing"
          meta={`${posts.length} published`}
          title={['Notes from', <span key="2" className="text-ink-3">the build.</span>]}
          lead="Occasional writing on agent architecture, retrieval evaluation, and what breaks when a model meets a real data platform."
        />

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
               
                className="group grid gap-3 py-7 transition-colors duration-300 hover:bg-white/[0.015] lg:grid-cols-12 lg:items-baseline lg:gap-8"
              >
                <span className="t-meta lg:col-span-2">
                  {formatDate(post.published_at)}
                </span>

                <span className="lg:col-span-7">
                  <span className="block text-lg font-bold tracking-tight text-ink transition-colors group-hover:text-signal">
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
                          className="chip"
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
          <Link href="/blog" className="btn btn-ghost">
            All writing
            <ArrowUpRight size={13} />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
