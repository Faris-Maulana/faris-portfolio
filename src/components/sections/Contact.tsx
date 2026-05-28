'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Send, Mail, MapPin, Clock, Loader2 } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/constants'

const schema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  email: z.string().email('Valid email required'),
  subject: z.string().max(200).optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
  honeypot: z.string().max(0).optional(),
})

type FormData = z.infer<typeof schema>

function TerminalSuccess() {
  const lines = [
    { text: '> CONNECTING to maulanafaris016@gmail.com...', delay: 0 },
    { text: '\u2713 SMTP handshake: 250 OK', delay: 600, color: '#39ff14' },
    { text: '> Logging to shadow archive...', delay: 1000 },
    { text: '\u2713 Persisted to database', delay: 1600, color: '#a855f7' },
    { text: '\u2713 TRANSMISSION COMPLETE', delay: 2200, color: '#a855f7' },
  ]

  return (
    <div className="glass rounded-2xl p-6 font-mono text-xs space-y-2">
      {lines.map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: line.delay / 1000, duration: 0.3 }}
          style={{ color: line.color || '#8fa8b8' }}
        >
          {line.text}
        </motion.div>
      ))}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.2 }}
        className="pt-2 border-t border-border-shadow text-monarch/60"
      >
        {'>'} Faris will respond within 24h. Stay on frequency.
      </motion.div>
    </div>
  )
}

export function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    if (data.honeypot) return
    setError('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to send')
      }

      setSubmitted(true)
      reset()
    } catch {
      setError('Something went wrong')
    }
  }

  return (
    <section id="contact" className="section">
      <div className="container">
        <div className="mb-12">
          <p className="section-heading-tag">{'// ISSUE_QUEST'}</p>
          <h2 className="section-heading gradient-monarch">Transmit Message</h2>
          <div className="dagger-line mt-4 w-full" />
        </div>

        <div className="grid lg:grid-cols-5 gap-6 lg:gap-10">
          <div className="lg:col-span-2 space-y-5 sm:space-y-6">
            <div>
              <h3 className="text-lg font-display font-semibold text-text-primary mb-4">Contact Information</h3>

              <div className="space-y-4">
                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-full glass flex items-center justify-center group-hover:border-monarch/40 transition-all">
                    <Mail size={16} className="text-monarch" />
                  </div>
                  <div>
                    <p className="text-[10px] text-text-muted font-mono">Email</p>
                    <p className="text-sm text-text-primary group-hover:text-monarch transition-colors">{SITE_CONFIG.email}</p>
                  </div>
                </a>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full glass flex items-center justify-center">
                    <MapPin size={16} className="text-monarch" />
                  </div>
                  <div>
                    <p className="text-[10px] text-text-muted font-mono">Location</p>
                    <p className="text-sm text-text-primary">{SITE_CONFIG.location}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-4 border border-border-glass">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={14} className="text-green" />
                <span className="text-[10px] font-mono text-green">{SITE_CONFIG.responseTime}</span>
              </div>
              <p className="text-[10px] text-text-muted">
                Open to: <span className="text-text-secondary">{SITE_CONFIG.availableFor}</span>
              </p>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="glass rounded-2xl p-4 sm:p-6 border border-border-glass">
              {submitted ? (
                <TerminalSuccess />
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
                  <input {...register('honeypot')} className="absolute opacity-0 h-0 w-0" tabIndex={-1} autoComplete="off" />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <label className="block text-[10px] font-mono text-text-muted mb-1.5">Name *</label>
                      <input
                        {...register('name')}
                        placeholder="Your name"
                        className="hud-input"
                      />
                      {errors.name && <p className="text-neon-red text-[10px] mt-1 font-mono">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-text-muted mb-1.5">Email *</label>
                      <input
                        {...register('email')}
                        placeholder="your@email.com"
                        className="hud-input"
                      />
                      {errors.email && <p className="text-neon-red text-[10px] mt-1 font-mono">{errors.email.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-text-muted mb-1.5">Subject (optional)</label>
                    <input
                      {...register('subject')}
                      placeholder="What's this about?"
                      className="hud-input"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-text-muted mb-1.5">Message *</label>
                    <textarea
                      {...register('message')}
                      rows={5}
                      placeholder="Tell me about your project, opportunity, or idea..."
                      className="hud-input resize-none"
                    />
                    {errors.message && <p className="text-neon-red text-[10px] mt-1 font-mono">{errors.message.message}</p>}
                  </div>

                  {error && (
                    <div className="px-4 py-2 rounded-xl bg-neon-red/10 border border-neon-red/20 text-neon-red text-[10px] font-mono">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-monarch/10 border border-monarch/30 text-monarch font-mono text-sm hover:bg-monarch/20 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    {isSubmitting ? 'Transmitting...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
