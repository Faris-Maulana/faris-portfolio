import { beforeEach, describe, expect, it, vi } from 'vitest'
import { track } from '@vercel/analytics/react'
import { trackPortfolioEvent } from '../../src/lib/analytics'

vi.mock('@vercel/analytics/react', () => ({ track: vi.fn() }))

const trackMock = vi.mocked(track)

describe('portfolio analytics', () => {
  beforeEach(() => trackMock.mockReset())

  it('maps outcome names without claiming delivery or conversion', () => {
    trackPortfolioEvent({ name: 'contact_provider_accepted', channel: 'form' })
    trackPortfolioEvent({ name: 'case_contact_click', caseId: 'rag-eval' })
    trackPortfolioEvent({ name: 'simpul_replay_exported', scenario: 'fiber-cut' })

    expect(trackMock.mock.calls).toEqual([
      ['contact_provider_accepted', { channel: 'form' }],
      ['case_contact_click', { caseId: 'rag-eval' }],
      ['simpul_replay_exported', { scenario: 'fiber-cut' }],
    ])
  })

  it('keeps payloads to the explicit properties rather than forwarding the event object', () => {
    const form = { name: 'Private Name', email: 'private@example.com', message: 'Sensitive message' }
    trackPortfolioEvent({ name: 'contact_unavailable', outcome: 'timeout' })
    expect(trackMock).toHaveBeenCalledWith('contact_unavailable', { outcome: 'timeout' })
    expect(JSON.stringify(trackMock.mock.calls)).not.toContain(form.email)
    expect(JSON.stringify(trackMock.mock.calls)).not.toContain(form.message)
  })
})
