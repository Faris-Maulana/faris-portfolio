'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface SkillGroup {
  category: string
  color: string
  items: string[]
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string
  group: string
  color: string
  radius: number
}

interface GraphLink {
  source: string | GraphNode
  target: string | GraphNode
}

export default function ForceGraph({ groups }: { groups: SkillGroup[] }) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || groups.length === 0) return

    const width = svgRef.current.clientWidth
    const height = 480

    const nodes: GraphNode[] = []
    const links: GraphLink[] = []

    groups.forEach((group) => {
      nodes.push({ id: group.category, group: group.category, color: group.color, radius: 10 })

      group.items.forEach((skill) => {
        nodes.push({ id: skill, group: group.category, color: group.color, radius: 5 })
        links.push({ source: group.category, target: skill })
      })
    })

    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-180))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => d.radius + 8))

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => g.attr('transform', event.transform))

    svg.call(zoom)

    const g = svg.append('g')

    const linkElements = g.append('g')
      .selectAll<SVGLineElement, GraphLink>('line')
      .data(links)
      .join('line')
      .attr('stroke', (d) => {
        const sourceId = typeof d.source === 'object' ? d.source.id : d.source
        const sourceNode = nodes.find(n => n.id === sourceId)
        return sourceNode ? sourceNode.color : '#4a6272'
      })
      .attr('stroke-width', 0.6)
      .attr('stroke-opacity', 0.2)

    const nodeElements = g.append('g')
      .selectAll<SVGCircleElement, GraphNode>('circle')
      .data(nodes)
      .join('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => d.color)
      .attr('opacity', (d) => d.radius > 6 ? 0.6 : 0.3)
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', (d) => d.radius > 6 ? 2 : 1)
      .attr('stroke-opacity', 0.5)
      .style('cursor', 'grab')
      .call(
        d3.drag<SVGCircleElement, GraphNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
          })
          .on('drag', (event, d) => {
            d.fx = event.x
            d.fy = event.y
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null
            d.fy = null
          })
      )

    const labelElements = g.append('g')
      .selectAll<SVGTextElement, GraphNode>('text')
      .data(nodes.filter(n => n.radius > 6))
      .join('text')
      .text(d => d.id)
      .attr('font-size', 9)
      .attr('font-family', '"JetBrains Mono", monospace')
      .attr('fill', d => d.color)
      .attr('text-anchor', 'middle')
      .attr('dy', -14)
      .attr('opacity', 0.8)

    simulation.on('tick', () => {
      linkElements
        .attr('x1', d => (d.source as GraphNode).x!)
        .attr('y1', d => (d.source as GraphNode).y!)
        .attr('x2', d => (d.target as GraphNode).x!)
        .attr('y2', d => (d.target as GraphNode).y!)

      nodeElements
        .attr('cx', d => d.x!)
        .attr('cy', d => d.y!)

      labelElements
        .attr('x', d => d.x!)
        .attr('y', d => d.y!)
    })

    return () => { simulation.stop() }
  }, [groups])

  return (
    <svg
      ref={svgRef}
      width="100%"
      height={480}
      style={{ background: 'transparent' }}
    />
  )
}
