'use client'

import { useState, useEffect, useRef } from 'react'
import { useRoam } from '@/contexts/RoamContext'
import { motion, AnimatePresence } from 'framer-motion'

const SECTION_CONTENT: Record<string, { title: string; desc: string }> = {
  hero:        { title: 'THRONE ROOM',    desc: 'Identity: Faris Maulana — S-Rank AI Architect' },
  about:       { title: 'ARCHIVE',        desc: 'Background, mission, and system architecture' },
  experience:  { title: 'QUESTS',         desc: 'Completed missions and career milestones' },
  projects:    { title: 'INVENTORY',      desc: 'Production AI systems and deployed artifacts' },
  skills:      { title: 'SKILL TREE',     desc: 'Technical proficiencies and specializations' },
  research:    { title: 'COMBAT LOG',     desc: 'Research publications and security audits' },
  certificates:{ title: 'TITLES',         desc: 'Certifications and earned distinctions' },
  blog:        { title: 'BROADCAST',      desc: 'Technical writings and field reports' },
  contact:     { title: 'SUMMON',         desc: 'Establish communication link' },
}

export function RoamingUI() {
  const { isRoaming, activeSectionId, setRoaming, enterPortal, portalTargetId } = useRoam()
  const [showGuide, setShowGuide] = useState(false)
  const prevRoaming = useRef(false)

  useEffect(() => {
    if (isRoaming && !prevRoaming.current) {
      setShowGuide(true)
      const timer = setTimeout(() => setShowGuide(false), 5000)
      prevRoaming.current = true
      return () => clearTimeout(timer)
    }
    if (!isRoaming) prevRoaming.current = false
  }, [isRoaming])

  // Portal transition: after animation completes, exit roam + scroll
  useEffect(() => {
    if (!portalTargetId) return
    const timeout = setTimeout(() => {
      setRoaming(false)
      setTimeout(() => {
        document.getElementById(portalTargetId)?.scrollIntoView({ behavior: 'smooth' })
      }, 150)
    }, 1400)
    return () => clearTimeout(timeout)
  }, [portalTargetId, setRoaming])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' && activeSectionId) {
        enterPortal(activeSectionId)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeSectionId, enterPortal])

  if (!isRoaming) return null

  const content = activeSectionId ? SECTION_CONTENT[activeSectionId] : null

  return (
    <>
      {/* HUD overlay */}
      <div className="fixed inset-0 z-40 pointer-events-none">
        {/* Crosshair */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-2 h-2 border border-system-blue/60 rounded-full" />
          <div className="w-6 h-px bg-system-blue/40 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          <div className="h-6 w-px bg-system-blue/40 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Help text */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
          <div className="font-mono text-[10px] text-system-blue/50 tracking-wider text-center">
            <span className="text-system-blue/70">W A S D</span> · walk · <span className="text-system-blue/70">MOUSE</span> · look · <span className="text-system-blue/70">SHIFT</span> · sprint · <span className="text-red/70">ESC</span> · exit
          </div>
        </div>
      </div>

      {/* Control guide modal on roam entry */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
          >
            <div
              className="pointer-events-auto px-8 py-6 font-mono text-center"
              style={{
                background: 'rgba(8,17,25,0.85)',
                border: '1px solid rgba(59,130,246,0.3)',
                clipPath: 'polygon(0% 0%, 97% 0%, 100% 3%, 100% 100%, 3% 100%, 0% 97%)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
              }}
            >
              <div className="text-[10px] tracking-[0.4em] text-system-blue/70 mb-4">
                FREE ROAM — CONTROLS
              </div>
              <div className="space-y-2 text-[11px] text-text-secondary">
                <div><span className="text-system-blue/70">W A S D</span> — Walk</div>
                <div><span className="text-system-blue/70">MOUSE</span> — Look around</div>
                <div><span className="text-system-blue/70">SHIFT</span> — Sprint</div>
                <div><span className="text-system-blue/70">ENTER</span> — Enter portal</div>
                <div className="pt-2 border-t border-system-blue/20 mt-2">
                  <span className="text-red/70">ESC</span> — Exit free roam
                </div>
              </div>
              <div className="mt-4 text-[8px] text-system-blue/40 tracking-wider">
                Click the scene to enable mouse look
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section info popup */}
      <AnimatePresence>
        {content && (
          <motion.div
            key={activeSectionId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50"
          >
            <button
              onClick={() => activeSectionId && enterPortal(activeSectionId)}
              className="px-6 py-4 font-mono text-center cursor-pointer transition-all duration-200 hover:border-system-blue/60"
              style={{
                background: 'rgba(8,17,25,0.7)',
                border: '1px solid rgba(59,130,246,0.3)',
                clipPath: 'polygon(0% 0%, 96% 0%, 100% 4%, 100% 100%, 4% 100%, 0% 96%)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            >
              <div className="text-[10px] tracking-[0.3em] text-system-blue/70 mb-1">
                {activeSectionId?.toUpperCase()} · LOCATION
              </div>
              <div className="text-xs text-text-primary">{content.title}</div>
              <div className="text-[10px] text-text-muted mt-1">{content.desc}</div>
              <div className="mt-2 text-[8px] text-system-blue/40 tracking-wider flex items-center justify-center gap-3">
                <span><span className="text-system-blue/70">ENTER</span> · enter portal</span>
                <span className="text-red/40">ESC</span><span className="text-red/40"> · exit</span>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
