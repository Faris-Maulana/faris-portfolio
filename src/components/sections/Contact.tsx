'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowUpRight, Check, Loader2, Send } from 'lucide-react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Reveal } from '@/components/ui/Reveal'
import { GithubIcon, LinkedinIcon } from '@/components/ui/Icons'
import { SITE_CONFIG } from '@/lib/constants'

const schema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  email: z.string().email('A valid email is required'),
  subject: z.string().max(200).optional(),
  message: z
    .string()
    .min(10, 'Tell me at least a sentence or two')
    .max(2000, 'Keep it under 2000 characters'),
  honeypot: z.string().max(0).optional(),
})

type FormData = z.infer<typeof schema>

const CHANNELS = [
  { label: 'Email', value: SITE_CONFIG.email, href: `mailto:${SITE_CONFIG.email}` },
  { label: 'WhatsApp', value: SITE_CONFIG.whatsapp, href: SITE_CONFIG.whatsappLink },
  { label: 'LinkedIn', value: 'in/faris-maulana', href: SITE_CONFIG.linkedin },
  { label: 'GitHub', value: 'Faris-Maulana', href: SITE_CONFIG.github },
]

export function Contact() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    // Bots fill every field they find; a human never sees this one.
    if (data.honeypot) return
    setError('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to send')
      }
      setSent(true)
      reset()
    } catch {
      setError(
        `Could not send. Email ${SITE_CONFIG.email} directly and it will reach me.`
      )
    }
  }

  return (
    <section id="contact" className="section">
      <div className="container">
        <SectionHeader
          index="07"
          label="Contact"
          meta={SITE_CONFIG.responseTime}
          title={['Tell me what', <span key="2" className="text-ink-3">you’re building.</span>]}
          lead={SITE_CONFIG.availableFor}
        />

        <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-12">
          {/* ── Direct channels ───────────────────────────────────────── */}
          <div className="lg:col-span-5">
            <Reveal>
              <dl className="space-y-px">
                {CHANNELS.map(channel => (
                  <div key={channel.label} className="border-t border-line last:border-b">
                    <a
                      href={channel.href}
                      target={channel.href.startsWith('mailto:') ? undefined : '_blank'}
                      rel="noopener noreferrer"
                      data-cursor="hover"
                      className="group flex items-center justify-between gap-4 py-5"
                    >
                      <dt className="t-label">{channel.label}</dt>
                      <dd className="flex min-w-0 items-center gap-2">
                        <span className="truncate text-sm text-ink-2 transition-colors group-hover:text-ink">
                          {channel.value}
                        </span>
                        <ArrowUpRight
                          size={14}
                          className="flex-none text-ink-4 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-signal"
                        />
                      </dd>
                    </a>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal delay={120} className="panel ticks mt-8 p-6">
              <div className="mb-4 flex items-center gap-2.5">
                <span className="pulse-dot" aria-hidden />
                <span className="t-label text-signal">Currently available</span>
              </div>
              <p className="text-sm leading-relaxed text-ink-2">
                Based in {SITE_CONFIG.location} ({SITE_CONFIG.timezone}), working
                across Asia-Pacific and US timezones.{' '}
                {SITE_CONFIG.responseTime}.
              </p>
              <div className="mt-5 flex items-center gap-2">
                {[
                  { Icon: GithubIcon, href: SITE_CONFIG.github, label: 'GitHub' },
                  { Icon: LinkedinIcon, href: SITE_CONFIG.linkedin, label: 'LinkedIn' },
                ].map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    data-cursor="hover"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink-3 transition-colors hover:border-line-3 hover:text-ink"
                  >
                    <Icon size={14} />
                  </a>
                ))}
              </div>
            </Reveal>
          </div>

          {/* ── Form ──────────────────────────────────────────────────── */}
          <div className="lg:col-span-7">
            <Reveal delay={80} className="panel p-6 sm:p-8">
              {sent ? (
                <div className="flex flex-col items-start py-8">
                  <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-signal/12 text-signal">
                    <Check size={22} />
                  </span>
                  <h3 className="t-h3 text-ink">Message received.</h3>
                  <p className="t-body mt-3 max-w-[46ch] text-sm">
                    It has landed in my inbox and been logged. I reply to
                    everything within 24 hours. If you do not hear back, email{' '}
                    <a
                      href={`mailto:${SITE_CONFIG.email}`}
                      className="link-draw text-ink"
                    >
                      {SITE_CONFIG.email}
                    </a>{' '}
                    directly.
                  </p>
                  <button
                    onClick={() => setSent(false)}
                    className="btn btn-ghost mt-8"
                    data-cursor="hover"
                  >
                    Send another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                  <input
                    {...register('honeypot')}
                    className="absolute h-0 w-0 opacity-0"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="t-label mb-2 block">
                        Name *
                      </label>
                      <input
                        id="name"
                        {...register('name')}
                        placeholder="Your name"
                        autoComplete="name"
                        aria-invalid={!!errors.name}
                        className="field"
                      />
                      {errors.name && (
                        <p className="mt-1.5 font-mono text-[11px] text-threat">
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="email" className="t-label mb-2 block">
                        Email *
                      </label>
                      <input
                        id="email"
                        type="email"
                        {...register('email')}
                        placeholder="you@company.com"
                        autoComplete="email"
                        aria-invalid={!!errors.email}
                        className="field"
                      />
                      {errors.email && (
                        <p className="mt-1.5 font-mono text-[11px] text-threat">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="t-label mb-2 block">
                      Subject
                    </label>
                    <input
                      id="subject"
                      {...register('subject')}
                      placeholder="Role, project, or collaboration"
                      className="field"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="t-label mb-2 block">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      rows={6}
                      {...register('message')}
                      placeholder="What are you building, and where does it hurt?"
                      aria-invalid={!!errors.message}
                      className="field"
                    />
                    {errors.message && (
                      <p className="mt-1.5 font-mono text-[11px] text-threat">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  {error && (
                    <p
                      role="alert"
                      className="rounded-lg border border-threat/25 bg-threat/8 px-4 py-3 text-[13px] text-threat"
                    >
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    data-cursor="hover"
                    className="btn btn-primary w-full disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Sending
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        Send message
                      </>
                    )}
                  </button>
                </form>
              )}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
