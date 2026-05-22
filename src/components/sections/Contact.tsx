'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Send, Mail, MapPin, Clock, CheckCircle, Loader2 } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { SITE_CONFIG } from '@/lib/constants'

const schema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  email: z.string().email('Valid email required'),
  subject: z.string().max(200).optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
  honeypot: z.string().max(0).optional(),
})

type FormData = z.infer<typeof schema>

export function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const { ref, inView, variants, itemVariants } = useScrollAnimation()

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
      <div className="container" ref={ref}>
        <motion.div variants={variants} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">
            <span className="gradient-text">Let&apos;s Build</span> Something
          </h2>
          <div className="w-16 h-0.5 bg-cyan/50 mb-12" />
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left Panel */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="lg:col-span-2 space-y-6"
          >
            <div>
              <h3 className="text-lg font-display font-semibold text-text-primary mb-4">Contact Information</h3>

              <div className="space-y-4">
                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-full glass flex items-center justify-center group-hover:border-cyan/40 transition-all">
                    <Mail size={16} className="text-cyan" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted font-mono">Email</p>
                    <p className="text-sm text-text-primary group-hover:text-cyan transition-colors">{SITE_CONFIG.email}</p>
                  </div>
                </a>

                <a
                  href={SITE_CONFIG.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-full glass flex items-center justify-center group-hover:border-green/40 transition-all">
                    <span className="text-green font-bold text-lg">WA</span>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted font-mono">WhatsApp</p>
                    <p className="text-sm text-text-primary group-hover:text-green transition-colors">{SITE_CONFIG.whatsapp}</p>
                  </div>
                </a>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full glass flex items-center justify-center">
                    <MapPin size={16} className="text-violet" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted font-mono">Location</p>
                    <p className="text-sm text-text-primary">{SITE_CONFIG.location}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={14} className="text-green" />
                <span className="text-xs font-mono text-green">{SITE_CONFIG.responseTime}</span>
              </div>
              <p className="text-xs text-text-muted">
                Open to: <span className="text-text-secondary">{SITE_CONFIG.availableFor}</span>
              </p>
            </div>

            <div className="glass rounded-2xl p-4">
              <p className="text-xs text-text-muted font-mono mb-2">SOCIAL</p>
              <div className="flex gap-3">
                <a href={SITE_CONFIG.github} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-cyan transition-colors text-sm">GitHub</a>
                <a href={SITE_CONFIG.linkedin} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-cyan transition-colors text-sm">LinkedIn</a>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="lg:col-span-3"
          >
            <GlassCard>
              {submitted ? (
                <div className="text-center py-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <CheckCircle size={48} className="mx-auto mb-4 text-green" />
                  </motion.div>
                  <h3 className="text-lg font-display font-semibold text-text-primary mb-2">Message Delivered!</h3>
                  <p className="text-sm text-text-muted mb-6">Your message has been sent to Faris&apos;s WhatsApp &amp; Email.</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-4 py-2 rounded-full border border-cyan/30 text-cyan font-mono text-sm hover:bg-cyan/10 transition-all"
                  >
                    Send Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* Honeypot - hidden from users */}
                  <input {...register('honeypot')} className="absolute opacity-0 h-0 w-0" tabIndex={-1} autoComplete="off" />

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-mono text-text-muted mb-1.5">Name *</label>
                      <input
                        {...register('name')}
                        placeholder="Your name"
                        className="w-full px-4 py-2.5 rounded-xl bg-deep border border-border-glass text-text-primary text-sm font-mono placeholder:text-text-muted/40 focus:outline-none focus:border-cyan/50 transition-all"
                      />
                      {errors.name && <p className="text-neon-red text-[10px] mt-1 font-mono">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-text-muted mb-1.5">Email *</label>
                      <input
                        {...register('email')}
                        placeholder="your@email.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-deep border border-border-glass text-text-primary text-sm font-mono placeholder:text-text-muted/40 focus:outline-none focus:border-cyan/50 transition-all"
                      />
                      {errors.email && <p className="text-neon-red text-[10px] mt-1 font-mono">{errors.email.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-text-muted mb-1.5">Subject (optional)</label>
                    <input
                      {...register('subject')}
                      placeholder="What's this about?"
                      className="w-full px-4 py-2.5 rounded-xl bg-deep border border-border-glass text-text-primary text-sm font-mono placeholder:text-text-muted/40 focus:outline-none focus:border-cyan/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-text-muted mb-1.5">Message *</label>
                    <textarea
                      {...register('message')}
                      rows={5}
                      placeholder="Tell me about your project, opportunity, or idea..."
                      className="w-full px-4 py-2.5 rounded-xl bg-deep border border-border-glass text-text-primary text-sm font-mono placeholder:text-text-muted/40 focus:outline-none focus:border-cyan/50 transition-all resize-none"
                    />
                    {errors.message && <p className="text-neon-red text-[10px] mt-1 font-mono">{errors.message.message}</p>}
                  </div>

                  {error && (
                    <div className="px-4 py-2 rounded-xl bg-neon-red/10 border border-neon-red/20 text-neon-red text-xs font-mono">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-cyan/10 border border-cyan/30 text-cyan font-mono text-sm hover:bg-cyan/20 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    {isSubmitting ? 'Sending...' : 'Send Message via WhatsApp & Email'}
                  </button>
                </form>
              )}
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
