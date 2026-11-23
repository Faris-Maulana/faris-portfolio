'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowUpRight, Check, Loader2, Send } from 'lucide-react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Reveal } from '@/components/ui/Reveal'
import { GithubIcon, LinkedinIcon } from '@/components/ui/Icons'
import { SITE_CONFIG } from '@/lib/constants'
import { contactSchema, type ContactFormData } from '@/lib/contact-schema'

const CHANNELS = [
  { label: 'Email', value: SITE_CONFIG.email, href: `mailto:${SITE_CONFIG.email}` },
  { label: 'WhatsApp', value: SITE_CONFIG.whatsapp, href: SITE_CONFIG.whatsappLink },
  { label: 'LinkedIn', value: 'in/faris-maulana', href: SITE_CONFIG.linkedin },
  { label: 'GitHub', value: 'Faris-Maulana', href: SITE_CONFIG.github },
]

function mailtoFallback(data: Partial<ContactFormData>) {
  const subject = data.subject?.trim() || `Portfolio enquiry from ${data.name?.trim() || 'website visitor'}`
  const body = [data.message?.trim() || '', '', '---', data.name ? `Name: ${data.name.trim()}` : null, data.email ? `Reply to: ${data.email.trim()}` : null].filter(value => value !== null).join('\n')
  return `mailto:${SITE_CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

function whatsappDraft(data: Partial<ContactFormData>) {
  const text = [data.subject?.trim(), data.message?.trim(), data.name ? `(${data.name.trim()}${data.email ? `, ${data.email.trim()}` : ''})` : null].filter(Boolean).join('\n\n')
  return `${SITE_CONFIG.whatsappLink}?text=${encodeURIComponent(text)}`
}

type Result = 'accepted' | 'handoff' | null

export function Contact() {
  const [result, setResult] = useState<Result>(null)
  const [error, setError] = useState('')
  const [draft, setDraft] = useState<ContactFormData | null>(null)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', subject: '', message: '', honeypot: '' },
  })

  const showResult = (next: Exclude<Result, null>, data: ContactFormData) => {
    setDraft(data)
    setResult(next)
    requestAnimationFrame(() => document.getElementById('contact-result-title')?.focus())
  }

  const onSubmit = async (data: ContactFormData) => {
    if (data.honeypot) return
    setError('')
    setResult(null)
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 12_000)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal,
      })
      const body = await response.json().catch(() => ({})) as { error?: string; fallback?: boolean }
      if (!response.ok) {
        if (response.status === 503 || body.fallback) {
          showResult('handoff', data)
          return
        }
        throw new Error(body.error || (response.status === 429 ? 'Too many messages. Please retry later or use email.' : 'The message was not accepted. Your draft is preserved.'))
      }
      reset()
      showResult('accepted', data)
    } catch (reason) {
      setDraft(data)
      setError(reason instanceof Error && reason.name !== 'AbortError' ? reason.message : 'The request timed out or was interrupted. Your draft is preserved; use email or WhatsApp below.')
    } finally {
      window.clearTimeout(timeout)
    }
  }

  const mail = mailtoFallback(draft ?? {})
  const whatsapp = whatsappDraft(draft ?? {})

  return (
    <section id="contact" className="section section-dark">
      <div className="container">
        <SectionHeader
          label="Start a conversation"
          meta={SITE_CONFIG.responseTime}
          title={['Bring the context.', <span key="2" className="text-ink-3">Especially the constraint.</span>]}
          lead={SITE_CONFIG.availability.detail}
        />

        <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal>
              <ul className="border-t border-line">
                {CHANNELS.map(channel => (
                  <li key={channel.label} className="border-b border-line">
                    <a href={channel.href} target={channel.href.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer" className="group grid grid-cols-[5rem_1fr_auto] items-center gap-3 py-5">
                      <span className="t-meta">{channel.label}</span><span className="truncate text-sm text-ink-2 group-hover:text-ink">{channel.value}</span><ArrowUpRight size={15} className="text-ink-3 group-hover:text-signal" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={80} className="panel corner-mark mt-8 p-6">
              <p className="flex items-center gap-3 text-sm font-semibold text-signal"><span className="status-dot" aria-hidden />{SITE_CONFIG.availability.status}</p>
              <p className="mt-4 text-sm text-ink-2">Based in {SITE_CONFIG.location} ({SITE_CONFIG.timezone}), working across Asia-Pacific and US timezones. {SITE_CONFIG.responseTime}.</p>
              <div className="mt-5 flex gap-2">
                <a href={SITE_CONFIG.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="icon-btn"><GithubIcon size={16} aria-hidden /></a>
                <a href={SITE_CONFIG.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="icon-btn"><LinkedinIcon size={16} aria-hidden /></a>
              </div>
            </Reveal>
            <p className="mt-6 text-xs leading-relaxed text-ink-3">Contact submissions are sent to configured Resend and/or Fonnte delivery channels. There is no application database. Direct email is available if delivery is not configured or fails.</p>
          </div>

          <div className="lg:col-span-7">
            {result ? (
              <div className="panel corner-mark p-7 sm:p-10" role="status" aria-live="polite">
                <span className="grid h-12 w-12 place-items-center border border-signal text-signal"><Check size={23} aria-hidden /></span>
                <h3 id="contact-result-title" tabIndex={-1} className="t-h3 mt-7">{result === 'accepted' ? 'Message accepted for delivery.' : 'Your message is ready to hand off.'}</h3>
                <p className="t-body mt-4">{result === 'accepted' ? 'A configured provider accepted the message. Provider acceptance is not a guarantee of inbox receipt.' : 'Server delivery is not configured or is unavailable. Your draft has been preserved; choose a direct channel below.'}</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <a href={mail} className="btn btn-primary">Open email draft <ArrowUpRight size={17} aria-hidden /></a>
                  <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">Open WhatsApp <ArrowUpRight size={17} aria-hidden /></a>
                  <button type="button" className="btn btn-ghost" onClick={() => { setResult(null); setError(''); setDraft(null) }}>Write another message</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate aria-busy={isSubmitting} className="panel p-6 sm:p-8">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-name" className="mb-2 block text-sm font-semibold">Name <span className="text-ink-3">(required)</span></label>
                    <input id="contact-name" type="text" autoComplete="name" maxLength={100} required aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'contact-name-error' : undefined} className="field" {...register('name')} />
                    {errors.name ? <p id="contact-name-error" className="field-error">{errors.name.message}</p> : null}
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="mb-2 block text-sm font-semibold">Email <span className="text-ink-3">(required)</span></label>
                    <input id="contact-email" type="email" autoComplete="email" maxLength={200} required aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'contact-email-error' : undefined} className="field" {...register('email')} />
                    {errors.email ? <p id="contact-email-error" className="field-error">{errors.email.message}</p> : null}
                  </div>
                </div>
                <div className="mt-5">
                  <label htmlFor="contact-subject" className="mb-2 block text-sm font-semibold">Subject <span className="text-ink-3">(optional, 200 characters maximum)</span></label>
                  <input id="contact-subject" type="text" aria-invalid={Boolean(errors.subject)} aria-describedby={errors.subject ? 'contact-subject-error' : undefined} className="field" {...register('subject')} />
                  {errors.subject ? <p id="contact-subject-error" className="field-error">{errors.subject.message}</p> : null}
                </div>
                <div className="mt-5">
                  <label htmlFor="contact-message" className="mb-2 block text-sm font-semibold">Message <span className="text-ink-3">(required)</span></label>
                  <textarea id="contact-message" rows={6} maxLength={2000} required aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'contact-message-error' : undefined} className="field" placeholder="The problem, current operating context and where you need help" {...register('message')} />
                  {errors.message ? <p id="contact-message-error" className="field-error">{errors.message.message}</p> : null}
                </div>
                <div className="sr-only" aria-hidden="true"><label htmlFor="contact-company-site">Leave this field empty</label><input id="contact-company-site" type="text" tabIndex={-1} autoComplete="off" {...register('honeypot')} /></div>

                {error ? <div className="mt-5 border-l-2 border-threat bg-surface p-4" role="alert"><p className="text-sm text-ink">{error}</p><div className="mt-3 flex flex-wrap gap-4"><a href={mail} className="text-link text-sm">Use preserved email draft</a><a href={whatsapp} target="_blank" rel="noopener noreferrer" className="text-link text-sm">Use WhatsApp</a></div></div> : null}
                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin" size={17} aria-hidden /> : <Send size={17} aria-hidden />}{isSubmitting ? 'Submitting' : 'Send message'}</button>
                  <p className="text-xs text-ink-3">No newsletter, tracking pixel or sales sequence.</p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
