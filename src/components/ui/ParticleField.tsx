'use client'

import { useEffect, useRef } from 'react'

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const particles: { x: number; y: number; z: number; vx: number; vy: number; vz: number }[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const count = 150
    for (let i = 0; i < count; i++) {
      particles.push({
        x: (Math.random() - 0.5) * canvas.width * 1.5,
        y: (Math.random() - 0.5) * canvas.height * 1.5,
        z: Math.random() * 400 - 200,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        vz: (Math.random() - 0.5) * 0.2,
      })
    }

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      }
    }
    window.addEventListener('mousemove', handleMouse)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const cx = canvas.width / 2
      const cy = canvas.height / 2
      const mx = mouseRef.current.x * 30
      const my = mouseRef.current.y * 30

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += p.vx + mx * 0.005
        p.y += p.vy + my * 0.005
        p.z += p.vz

        if (Math.abs(p.x) > canvas.width * 1.5) p.x *= -0.9
        if (Math.abs(p.y) > canvas.height * 1.5) p.y *= -0.9
        if (Math.abs(p.z) > 200) p.z *= -0.9

        const scale = 400 / (400 + p.z)
        const px = cx + p.x * scale
        const py = cy + p.y * scale
        const size = Math.max(0.5, 2 * scale)
        const alpha = Math.min(1, scale * 0.8)

        ctx.beginPath()
        ctx.arc(px, py, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0, 245, 255, ${alpha * 0.4})`
        ctx.fill()

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const scale2 = 400 / (400 + p2.z)
          const px2 = cx + p2.x * scale2
          const py2 = cy + p2.y * scale2
          const dx = px - px2
          const dy = py - py2
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(px, py)
            ctx.lineTo(px2, py2)
            ctx.strokeStyle = `rgba(0, 245, 255, ${(1 - dist / 100) * 0.08})`
            ctx.stroke()
          }
        }
      }

      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouse)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  )
}
