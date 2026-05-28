'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import { motion } from 'framer-motion'
import * as d3 from 'd3'
import { SKILLS } from '@/lib/constants'

interface Node extends d3.SimulationNodeDatum {
  id: string; label: string; category: string; color: string; size: number
}

const colorMap: Record<string, string> = {
  'AI & LLM': '#a855f7', 'Data Engineering': '#38bdf8', 'ML & Research': '#c084fc',
  'Security': '#f43f5e', 'Programming': '#fbbf24', 'BI & Analytics': '#8b5cf6',
}

function SkillsMatrix() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
      {SKILLS.map((group, gi) => (
        <motion.div
          key={group.category}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4, delay: gi * 0.06 }}
          className="relative p-4 sm:p-5"
          style={{
            background: 'rgba(8,17,25,0.4)',
            border: '1px solid rgba(168,85,247,0.18)',
            clipPath: 'polygon(0% 0%, 96% 0%, 100% 4%, 100% 100%, 4% 100%, 0% 96%)',
          }}
        >
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-monarch/15">
            <div className="w-1.5 h-1.5 rotate-45 bg-monarch" />
            <h3 className="font-mono text-[10px] sm:text-xs text-monarch tracking-[0.25em] uppercase">
              {group.category}
            </h3>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {group.items.map(skill => (
              <span
                key={skill}
                className="font-mono text-[10px] sm:text-[11px] px-2 py-1 border border-monarch/15 text-text-secondary hover:border-monarch/40 hover:text-monarch-hi transition-colors"
                data-cursor="hover"
              >
                {skill}
              </span>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export function Skills() {
  const svgRef   = useRef<SVGSVGElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const inView = useInView(sectionRef, { once: true })
  const simRef = useRef<d3.Simulation<Node, undefined> | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [view, setView] = useState<'matrix' | 'constellation'>('matrix')

  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia('(max-width: 768px)').matches)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (isMobile) setView('matrix')
  }, [isMobile])

  useEffect(() => {
    if (!inView || view === 'matrix') return
    const svg = d3.select(svgRef.current)
    const W = svgRef.current?.clientWidth || 800
    const H = 520
    svg.attr('height', H)

    const nodes: Node[] = []
    nodes.push({ id: '__center__', label: 'FM', category: 'core', color: '#ffffff', size: 28 })
    SKILLS.forEach(group => {
      const col = colorMap[group.category] || '#4a6272'
      group.items.forEach(item => {
        nodes.push({ id: `${group.category}__${item}`, label: item, category: group.category, color: col, size: 9 })
      })
      nodes.push({ id: `__hub__${group.category}`, label: group.category.split(' ')[0], category: group.category, color: col, size: 16 })
    })

    const links: { source: string; target: string; strength: number }[] = []
    SKILLS.forEach(group => {
      links.push({ source: '__center__', target: `__hub__${group.category}`, strength: 0.08 })
      group.items.forEach(item => {
        links.push({ source: `__hub__${group.category}`, target: `${group.category}__${item}`, strength: 0.25 })
      })
    })

    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: d3.SimulationNodeDatum) => (d as Node).id).strength(l => (l as {strength: number}).strength).distance(70))
      .force('charge', d3.forceManyBody().strength(n => (n as Node).id === '__center__' ? -600 : -80))
      .force('center', d3.forceCenter(W / 2, H / 2))
      .force('collision', d3.forceCollide().radius(n => (n as Node).size + 8))
      .alphaDecay(0.025)
    simRef.current = sim

    svg.selectAll('*').remove()

    const defs = svg.append('defs')
    defs.append('filter').attr('id', 'glow').html(`
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
    `)

    const linkSel = svg.append('g').selectAll('line')
      .data(links).enter().append('line')
      .attr('stroke', d => (d.source as unknown as Node)?.color || '#4a6272')
      .attr('stroke-opacity', d => d.strength > 0.1 ? 0.08 : 0.15)
      .attr('stroke-width', d => d.strength > 0.1 ? 0.5 : 1)

    const nodeSel = svg.append('g').selectAll('g')
      .data(nodes).enter().append('g')
      .attr('class', 'node')
      .style('cursor', n => (n as Node).id === '__center__' ? 'default' : 'pointer')
      .call(
        d3.drag<SVGGElement, Node>()
          .on('start', (event, d) => { if (!event.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
          .on('drag',  (event, d) => { d.fx = event.x; d.fy = event.y })
          .on('end',   (event, d) => { if (!event.active) sim.alphaTarget(0); d.fx = null; d.fy = null })
      )

    nodeSel.append('circle')
      .attr('r', n => (n as Node).size)
      .attr('fill', n => {
        const node = n as Node
        if (node.id === '__center__') return 'rgba(255,255,255,0.1)'
        if (node.id.startsWith('__hub__')) return `${node.color}22`
        return `${node.color}18`
      })
      .attr('stroke', n => (n as Node).color)
      .attr('stroke-width', n => (n as Node).id.startsWith('__hub__') || (n as Node).id === '__center__' ? 1.5 : 0.8)
      .attr('stroke-opacity', n => (n as Node).id === '__center__' ? 1 : 0.5)
      .on('mouseover', function(_, n) {
        const node = n as Node
        d3.select(this).attr('stroke-opacity', 1).attr('filter', 'url(#glow)')
          .transition().duration(200).attr('r', node.size * 1.4)
      })
      .on('mouseout', function(_, n) {
        const node = n as Node
        d3.select(this).attr('stroke-opacity', node.id === '__center__' ? 1 : 0.5).attr('filter', null)
          .transition().duration(200).attr('r', node.size)
      })

    nodeSel.append('text')
      .text(n => (n as Node).label)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', n => (n as Node).color)
      .attr('font-size', n => {
        const node = n as Node
        if (node.id === '__center__') return '13px'
        if (node.id.startsWith('__hub__')) return '9px'
        return '7.5px'
      })
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-weight', n => (n as Node).id === '__center__' ? '700' : '400')
      .attr('pointer-events', 'none')
      .attr('opacity', n => {
        const node = n as Node
        return node.id === '__center__' || node.id.startsWith('__hub__') ? 1 : 0.8
      })

    sim.on('tick', () => {
      linkSel
        .attr('x1', d => ((d.source as unknown) as Node).x ?? 0).attr('y1', d => ((d.source as unknown) as Node).y ?? 0)
        .attr('x2', d => ((d.target as unknown) as Node).x ?? 0).attr('y2', d => ((d.target as unknown) as Node).y ?? 0)
      nodeSel.attr('transform', n => `translate(${(n as Node).x ?? 0},${(n as Node).y ?? 0})`)
    })

    return () => { sim.stop() }
  }, [inView, view])

  return (
    <section id="skills" className="section" ref={sectionRef}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mb-12"
        >
          <p className="section-heading-tag">{'// SKILL_TREE'}</p>
          <h2 className="section-heading mb-2">
            <span className="gradient-monarch">Skills</span>
          </h2>
          {!isMobile && (
            <p className="text-text-muted text-xs sm:text-sm font-mono">Drag nodes · hover to illuminate · connected by expertise</p>
          )}
        </motion.div>

        <div className="hidden md:flex items-center gap-2 mb-6">
          <button
            onClick={() => setView('matrix')}
            className={`px-3 py-1.5 font-mono text-[11px] tracking-widest uppercase border transition-colors ${
              view === 'matrix'
                ? 'border-system-blue text-system-blue bg-system-blue/10'
                : 'border-system-blue/20 text-text-muted hover:text-system-blue'
            }`}
            data-cursor="hover"
          >
            Matrix
          </button>
          <button
            onClick={() => setView('constellation')}
            className={`px-3 py-1.5 font-mono text-[11px] tracking-widest uppercase border transition-colors ${
              view === 'constellation'
                ? 'border-monarch text-monarch bg-monarch/10'
                : 'border-monarch/20 text-text-muted hover:text-monarch'
            }`}
            data-cursor="hover"
          >
            Constellation
          </button>
        </div>

        {view === 'matrix' || isMobile ? (
          <SkillsMatrix />
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22,1,0.36,1] }}
              className="glass rounded-3xl overflow-hidden"
              style={{ border: '1px solid rgba(168,85,247,0.08)' }}
            >
              <svg ref={svgRef} width="100%" style={{ display: 'block' }} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.6 }}
              className="mt-6 flex flex-wrap gap-4 justify-center"
            >
              {Object.entries(colorMap).map(([cat, color]) => (
                <div key={cat} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
                  <span className="text-[10px] font-mono text-text-muted">{cat}</span>
                </div>
              ))}
            </motion.div>
          </>
        )}
      </div>
    </section>
  )
}
