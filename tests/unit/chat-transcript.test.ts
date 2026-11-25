import { describe, expect, it } from 'vitest'
import { formatTranscriptMarkdown, getFollowUpQuestions } from '@/lib/chat-transcript'
import type { ChatMessage } from '@/lib/chat-types'

const INTRO: ChatMessage = { role: 'assistant', content: 'Local introduction', ts: '' }
const USER: ChatMessage = { role: 'user', content: 'How is SQL validated?', ts: '2026-11-24T03:00:00.000Z' }
const ASSISTANT: ChatMessage = { role: 'assistant', content: 'Through deterministic checks.', ts: '2026-11-24T03:01:00.000Z' }

describe('assistant transcript utilities', () => {
  it('selects bounded follow-ups related to the latest question', () => {
    expect(getFollowUpQuestions('How is generated SQL validated?')).toEqual([
      'Which validation boundaries are deterministic?',
      'What is still unresolved in the Text2SQL platform?',
    ])
    expect(getFollowUpQuestions('Unclassified question')).toHaveLength(2)
  })

  it('does not recommend the exact question that was just asked', () => {
    const question = 'What does Faris own as an AI engineering lead?'
    expect(getFollowUpQuestions(question)).not.toContain(question)
  })

  it('exports timestamped turns, evidence links and excludes the unsent introduction', () => {
    const withSources: ChatMessage = { ...ASSISTANT, sources: [{ title: 'Text2SQL record', href: '/work/text2sql' }] }
    const artifact = formatTranscriptMarkdown([INTRO, USER, withSources], new Date('2026-11-24T04:00:00.000Z'))

    expect(artifact).toContain('# ARIA portfolio conversation')
    expect(artifact).toContain('Exported: 2026-11-24T04:00:00.000Z')
    expect(artifact).toContain('## You\n\nHow is SQL validated?')
    expect(artifact).toContain('## ARIA\n\nThrough deterministic checks.')
    expect(artifact).toContain('[Text2SQL record](/work/text2sql)')
    expect(artifact).not.toContain('Local introduction')
    expect(artifact).not.toContain('undefined')
  })
})
