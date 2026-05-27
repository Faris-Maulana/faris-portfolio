'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, ArrowDown } from 'lucide-react'
import { GithubIcon, LinkedinIcon } from '@/components/ui/Icons'
import { Mail } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/constants'

function KineticName({ text }: { text: string }) {
  const words = text.split(' ')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(t)
  }, [])

  return (
    <h1
      className="nameplate"
      style={{
        background: 'linear-gradient(180deg, #f3e8ff 0%, #c084fc 70%, #7c3aed 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        filter: visible ? 'drop-shadow(0 0 60px rgba(168,85,247,0.4))' : 'none',
      }}
    >
      {words.flatMap((word, wi) => {
        const span = (
          <span
            key={`w-${wi}`}
            className="kinetic-word in"
            aria-label={word}
            style={{ display: 'inline-block' }}
          >
            {word.split('').map((char, ci) => (
              <span
                key={ci}
                aria-hidden="true"
                className={visible ? 'opacity-100' : 'opacity-0'}
                style={{
                  display: 'inline-block',
                  transition: `opacity 0.05s linear ${800 + (wi * word.length + ci) * 40}ms`,
                }}
              >
                {char}
              </span>
            ))}
          </span>
        )
        return wi < words.length - 1
          ? [span, <span key={`sp-${wi}`} aria-hidden="true">{' '}</span>]
          : [span]
      })}
    </h1>
  )
}

function StatusWindow() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 3.6, ease: [0.19, 1, 0.22, 1] }}
      className="hidden xl:block absolute right-12 top-1/2 -translate-y-1/2 w-72 z-20"
      style={{
        clipPath: 'polygon(0% 0%, 96% 0%, 100% 4%, 100% 100%, 4% 100%, 0% 96%)',
        border: '1px solid rgba(59,130,246,0.35)',
        background: 'rgba(8,17,25,0.5)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 0 0.3125rem rgba(59,130,246,0.3), 0 0 0.75rem rgba(59,130,246,0.1)',
      }}
    >
      <div className="px-5 py-4 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(59,130,246,0.03) 1px, rgba(59,130,246,0.03) 2px)',
            backgroundSize: '100% 2px',
            opacity: 0.04,
            mixBlendMode: 'overlay',
          }}
        />
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-system-blue/20 relative">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rotate-45 bg-system-blue" />
            <span className="font-mono text-[9px] text-system-blue tracking-[0.3em]">STATUS</span>
          </div>
          <span className="font-mono text-[8px] text-system-blue/50">ARCHITECT</span>
        </div>

        <div className="space-y-2 font-mono text-[10px] relative">
          {[
            { k: 'ROLE',     v: 'MANAGER · AI ENG', vc: '#c084fc' },
            { k: 'COMPANY',  v: 'TIS',              vc: '#60a5fa' },
            { k: 'NETWORK',  v: '25K+ KM',          vc: '#60a5fa' },
            { k: 'YEARS',    v: '5+',               vc: '#a855f7' },
            { k: 'STATUS',   v: 'AVAILABLE',        vc: '#10b981' },
          ].map((s, i) => (
            <motion.div
              key={s.k}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 3.8 + i * 0.08 }}
              className="flex items-center justify-between"
            >
              <span className="text-system-blue/60 tracking-widest">{s.k}</span>
              <span style={{ color: s.vc }} className="font-semibold tabular-nums">{s.v}</span>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-system-blue/20 space-y-2 relative">
          {[
            { k: 'PRODUCTION DASHBOARDS', val: 1, max: 1, label: '20+', color: '#a855f7' },
            { k: 'INDUSTRIES SHIPPED',    val: 4/5, max: 5, label: '4/5', color: '#60a5fa' },
          ].map(b => (
            <div key={b.k} className="space-y-1">
              <div className="flex justify-between font-mono text-[8px]">
                <span className="text-system-blue/60 tracking-widest">{b.k}</span>
                <span style={{ color: b.color }}>{b.label}</span>
              </div>
              <div className="h-0.5 bg-system-blue/10 relative overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${b.val * 100}%` }}
                  transition={{ duration: 1.4, delay: 4.5, ease: [0.19, 1, 0.22, 1] }}
                  className="absolute inset-y-0 left-0"
                  style={{ background: b.color, boxShadow: `0 0 6px ${b.color}` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function QuestNotification() {
  const [show, setShow] = useState(true)
  return show ? (
    <motion.div
      initial={{ opacity: 0, x: 20, y: -10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.4, delay: 5.5 }}
      className="hidden lg:flex absolute top-24 right-12 z-20 max-w-xs"
      style={{
        clipPath: 'polygon(0% 0%, 96% 0%, 100% 4%, 100% 100%, 4% 100%, 0% 96%)',
        border: '1px solid rgba(168,85,247,0.4)',
        background: 'rgba(20,10,35,0.6)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div className="relative px-4 py-3 flex items-start gap-3">
        <div className="font-mono text-[8px] text-monarch tracking-[0.3em] absolute -top-2 left-3 px-2" style={{ background: '#030309' }}>
          NEW QUEST
        </div>
        <div className="text-xs text-text-secondary leading-relaxed pt-1">
          A new opportunity awaits.<br />
          <span className="text-monarch-hi">Reach out to accept.</span>
        </div>
        <button
          onClick={() => setShow(false)}
          className="absolute top-1 right-2 text-monarch/40 hover:text-monarch text-xs"
          aria-label="Dismiss"
        >×</button>
      </div>
    </motion.div>
  ) : null
}

export function Hero() {
  const [bootLineIdx, setBootLineIdx] = useState(0)
  const [bootCharIdx, setBootCharIdx] = useState(0)
  const [bootDone, setBootDone] = useState(false)

  const bootLines = useMemo(() => [
    'IDENTITY VERIFIED               · FARIS_MAULANA',
    'ROLE ASSIGNED                   · AI ENGINEER · MANAGER',
    'DOMAIN ACCESS GRANTED           · JAKARTA NODE',
    'DEPLOYMENT ACTIVE               · 25,000+ KM NETWORK',
    'SECURITY CLEARANCE              · PP 71/2019 COMPLIANT',
  ], [])

  useEffect(() => {
    let i = 0
    let ci = 0
    const interval = setInterval(() => {
      if (ci < bootLines[i].length) {
        ci++
        setBootLineIdx(i)
        setBootCharIdx(ci)
      } else {
        i++
        if (i >= bootLines.length) {
          clearInterval(interval)
          setTimeout(() => setBootDone(true), 300)
          return
        }
        ci = 0
        setBootLineIdx(i)
        setBootCharIdx(0)
      }
    }, 20)
    return () => clearInterval(interval)
  }, [bootLines])

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {!bootDone && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 z-30 flex items-center justify-center"
          style={{ background: '#030309' }}
        >
          <div className="font-mono text-xs" style={{ color: 'rgba(59,130,246,0.6)' }}>
            <div className="mb-4 tracking-[0.2em] text-system-blue text-[10px]">
              S-CLASS ARCHITECT // JAKARTA INDONESIA
            </div>
            <div className="space-y-2">
              {bootLines.map((line, idx) => {
              const isCurrent = idx === bootLineIdx
              const isPast = idx < bootLineIdx
              const displayText = isPast ? line : isCurrent ? line.slice(0, bootCharIdx) : line.replace(/./g, '·')
              return (
                <div key={idx} className="flex gap-2">
                  <span style={{ color: 'rgba(59,130,246,0.4)' }}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span style={{ opacity: isPast || isCurrent ? 1 : 0.2 }}>
                    {displayText}
                  </span>
                  {isCurrent && bootCharIdx < line.length && (
                    <span className="animate-pulse" style={{ color: '#3b82f6' }}>▊</span>
                  )}
                </div>
              )
            })}
            </div>
            <div className="mt-6 h-px" style={{
              background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.4), transparent)',
              transform: `scaleX(${bootDone ? 1 : bootLines.length > 0 ? (bootLineIdx + (bootCharIdx / bootLines[Math.min(bootLineIdx, bootLines.length - 1)].length)) / bootLines.length : 0})`,
              transformOrigin: 'left',
              transition: 'transform 0.1s linear',
            }} />
          </div>
        </motion.div>
      )}

      <div className="absolute inset-6 pointer-events-none z-10">
        {[
          { cls: 'top-0 left-0',   br: 'border-t-2 border-l-2' },
          { cls: 'top-0 right-0',  br: 'border-t-2 border-r-2' },
          { cls: 'bottom-0 left-0',  br: 'border-b-2 border-l-2' },
          { cls: 'bottom-0 right-0', br: 'border-b-2 border-r-2' },
        ].map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={bootDone ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.2 + i * 0.06 }}
            className={`absolute w-8 h-8 ${c.cls} ${c.br} border-system-blue/60`}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={bootDone ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="absolute top-2 left-12 right-12 flex items-center justify-between font-mono text-[9px] tracking-[0.3em]"
          role="status"
          aria-label="Domain Faris Maulana, status online"
        >
          <span className="text-system-blue/60">DOMAIN.FARIS_MAULANA</span>
          <span aria-hidden="true" className="sr-only"> · </span>
          <span className="text-system-blue/60 flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-green animate-pulse" aria-hidden="true" />
            <span>ONLINE</span>
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={bootDone ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="absolute bottom-2 left-12 right-12 flex items-center justify-between font-mono text-[9px] text-system-blue/40 tracking-[0.3em]"
          role="status"
          aria-label="Hunter Association Jakarta — scroll to descend"
        >
          <span>HUNTER.ASSOCIATION // JAKARTA</span>
          <span aria-hidden="true" className="sr-only"> · </span>
          <span>SCROLL TO DESCEND</span>
        </motion.div>
      </div>

      <StatusWindow />
      <QuestNotification />

      <div className="relative z-20 text-center px-6 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={bootDone ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="inline-flex items-center gap-3 mb-8 font-mono text-[10px] tracking-[0.4em] text-system-blue uppercase"
        >
          <div className="w-8 h-px bg-system-blue/60" />
          <span>S-RANK · AI ARCHITECT</span>
          <div className="w-8 h-px bg-system-blue/60" />
        </motion.div>

        <div className="mb-8">
          <KineticName text="FARIS MAULANA" />
        </div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={bootDone ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.5 }}
          className="font-mono text-xs md:text-sm text-text-secondary tracking-[0.2em] uppercase mb-12"
        >
          Building production AI on national fiber · Multi-agent systems · Smart contract security research
        </motion.p>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={bootDone ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 1.8, ease: [0.19, 1, 0.22, 1] }}
          className="h-px bg-gradient-to-r from-transparent via-monarch to-transparent w-96 max-w-full mx-auto mb-12"
          style={{ transformOrigin: 'center' }}
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={bootDone ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 2.5 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-14"
        >
          <a
            href="#about"
            data-cursor="hover"
            className="group relative inline-flex items-center gap-3 px-8 py-3.5 font-mono text-xs tracking-[0.2em] uppercase transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(37,99,235,0.08))',
              border: '1px solid rgba(59,130,246,0.5)',
              color: '#60a5fa',
              clipPath: 'polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)',
            }}
          >
            <span>Enter Domain</span>
            <ArrowDown size={13} className="group-hover:translate-y-0.5 transition-transform" />
          </a>

          <a
            href="/cv"
            download
            data-cursor="hover"
            className="inline-flex items-center gap-3 px-8 py-3.5 font-mono text-xs tracking-[0.2em] uppercase transition-all duration-200"
            style={{
              border: '1px solid rgba(251,191,36,0.45)',
              color: '#fbbf24',
              clipPath: 'polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)',
              background: 'rgba(251,191,36,0.04)',
            }}
          >
            <Download size={13} />
            Hunter Card
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={bootDone ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 2.8 }}
          className="flex items-center justify-center gap-12"
        >
          {[
            { icon: GithubIcon,   href: SITE_CONFIG.github,           label: 'GITHUB' },
            { icon: LinkedinIcon, href: SITE_CONFIG.linkedin,          label: 'LINKEDIN' },
            { icon: Mail,         href: `mailto:${SITE_CONFIG.email}`, label: 'CONTACT' },
          ].map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank" rel="noopener noreferrer"
              data-cursor="hover"
              className="group flex flex-col items-center gap-2 text-text-muted hover:text-monarch transition-colors duration-300"
            >
              <Icon size={15} className="group-hover:scale-110 transition-transform" />
              <span className="text-[8px] font-mono tracking-[0.4em] opacity-50 group-hover:opacity-100">
                {label}
              </span>
            </a>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={bootDone ? { opacity: 1 } : {}}
        transition={{ delay: 3.2 }}
        className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-10 bg-gradient-to-b from-system-blue/60 to-transparent"
        />
      </motion.div>
    </section>
  )
}
