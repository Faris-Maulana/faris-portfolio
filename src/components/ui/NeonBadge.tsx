'use client'

import { cn } from '@/lib/utils'

interface NeonBadgeProps {
  children: React.ReactNode
  color?: 'cyan' | 'green' | 'amber' | 'violet' | 'red' | 'cyan-dim' | 'muted' | string
  size?: 'sm' | 'md'
  className?: string
}

const colorMap: Record<string, string> = {
  cyan:     'bg-monarch/10 text-monarch border-monarch/20',
  green:    'bg-green/10 text-green border-green/20',
  amber:    'bg-amber/10 text-amber border-amber/20',
  violet:   'bg-violet/10 text-violet border-violet/20',
  red:      'bg-neon-red/10 text-neon-red border-neon-red/20',
  'cyan-dim': 'bg-ice/10 text-ice border-ice/20',
  muted:    'bg-text-muted/10 text-text-muted border-text-muted/20',
}

export function NeonBadge({ children, color = 'cyan', size = 'sm', className }: NeonBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-mono',
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs',
        colorMap[color as keyof typeof colorMap] || colorMap.cyan,
        className
      )}
    >
      {children}
    </span>
  )
}
