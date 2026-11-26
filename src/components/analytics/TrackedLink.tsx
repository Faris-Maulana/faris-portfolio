'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'
import { trackPortfolioEvent, type PortfolioEvent } from '@/lib/analytics'

type TrackedLinkProps = Omit<ComponentProps<typeof Link>, 'onClick'> & {
  event: PortfolioEvent
}

export function TrackedLink({ event, children, ...props }: TrackedLinkProps) {
  const prefetch = props.download === undefined ? props.prefetch : false
  return <Link {...props} prefetch={prefetch} onClick={() => trackPortfolioEvent(event)}>{children}</Link>
}
