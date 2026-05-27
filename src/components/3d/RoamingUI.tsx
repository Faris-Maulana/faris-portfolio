'use client'

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
  const { isRoaming, activeSectionId, setRoaming } = useRoam()

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
            <span className="text-system-blue/70">W A S D</span> · walk · <span className="text-system-blue/70">MOUSE</span> · look · <span className="text-system-blue/70">SHIFT</span> · sprint
          </div>
        </div>
      </div>

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
              onClick={() => {
                setRoaming(false)
                setTimeout(() => {
                  document.getElementById(activeSectionId!)?.scrollIntoView({ behavior: 'smooth' })
                }, 100)
              }}
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
              <div className="mt-2 text-[8px] text-system-blue/40 tracking-wider">
                [ CLICK TO ENTER ]
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
