import { track } from '@vercel/analytics/react'
import type { ScenarioId } from './simpul'

export type PortfolioEvent =
  | { name: 'cv_download'; document: 'executive' | 'quantitative'; placement: 'hero' | 'navbar' | 'mobile_menu' | 'methods' }
  | { name: 'case_contact_click' | 'case_email_click'; caseId: string }
  | { name: 'simpul_run_created' | 'simpul_replay_exported'; scenario: ScenarioId }
  | { name: 'contact_provider_accepted'; channel: 'form' }
  | { name: 'contact_unavailable'; outcome: 'handoff' | 'error' | 'timeout' }
  | { name: 'contact_direct_channel'; channel: 'email' | 'whatsapp'; placement: 'directory' | 'result' | 'error' }
  | { name: 'chat_open' | 'chat_first_question' | 'chat_contact_handoff'; placement: 'launcher' | 'composer' | 'footer' }

/** Static, privacy-bounded interaction counts; message/form values are not accepted here. */
export function trackPortfolioEvent({ name, ...properties }: PortfolioEvent) {
  track(name, properties)
}
