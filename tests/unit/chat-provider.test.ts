import { describe, expect, it, vi } from 'vitest'
import {
  readChatCompletionStream,
  type StreamSnapshot,
} from '@/lib/chat-provider'

function sseResponse(bytes: Uint8Array, cuts: number[] = []): Response {
  const boundaries = [...new Set([...cuts, bytes.length])]
    .filter(boundary => boundary > 0 && boundary <= bytes.length)
    .sort((left, right) => left - right)
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      let offset = 0
      for (const boundary of boundaries) {
        if (boundary <= offset) continue
        controller.enqueue(bytes.slice(offset, boundary))
        offset = boundary
      }
      controller.close()
    },
  })
  return new Response(body, { headers: { 'content-type': 'text/event-stream' } })
}

function deltaEvent(
  delta: { content?: string; reasoning?: string },
  model?: string,
): string {
  return `data: ${JSON.stringify({ model, choices: [{ delta }] })}`
}

describe('OpenRouter completion stream parsing', () => {
  it('joins fragmented UTF-8 and SSE lines into cumulative sanitized snapshots', async () => {
    const encoder = new TextEncoder()
    const sse = [
      deltaEvent({ content: 'Hello ', reasoning: 'Check ' }, 'unit/selected-model'),
      deltaEvent({
        content: '🌍\n\n```ts\nconst answer = 42;\n```',
        reasoning: 'the evidence',
      }),
      deltaEvent({
        content: '\n\nRead [the docs](https://example.test/docs) and <https://example.test/demo> or https://example.test/bare.',
      }),
      'data: [DONE]',
    ].join('\r\n\r\n')
    const bytes = encoder.encode(sse)
    const emojiOffset = encoder.encode(sse.slice(0, sse.indexOf('🌍'))).length
    const carriageReturnOffset = encoder.encode(
      sse.slice(0, sse.indexOf('\r\n') + 1),
    ).length
    const response = sseResponse(bytes, [
      7,
      emojiOffset + 1,
      emojiOffset + 3,
      carriageReturnOffset,
      bytes.length - 3,
    ])
    const onSnapshot = vi.fn<(snapshot: StreamSnapshot) => void>()

    const final = await readChatCompletionStream(
      { availability: 'ok', response, model: 'unit/default-model' },
      onSnapshot,
    )
    const snapshots = onSnapshot.mock.calls.map(([snapshot]) => snapshot)

    expect(snapshots).toHaveLength(3)
    expect(snapshots[0]).toEqual({
      reply: 'Hello',
      reasoning: 'Check',
      model: 'unit/selected-model',
    })
    expect(snapshots[1]!.reply.startsWith(snapshots[0]!.reply)).toBe(true)
    expect(snapshots[2]!.reply.startsWith(snapshots[1]!.reply)).toBe(true)
    expect(snapshots[1]?.reasoning).toBe('Check the evidence')
    expect(snapshots[2]?.reasoning).toBe('Check the evidence')
    expect(final).toEqual(snapshots.at(-1))
    expect(final.reply).toContain('Hello 🌍')
    expect(final.reply).toContain('```ts\nconst answer = 42;\n```')
    expect(final.reply).toContain('Read the docs')
    expect(final.reply).not.toMatch(/https?:|example\.test/)
    expect(final.model).toBe('unit/selected-model')
  })

  it('rejects an empty provider stream without publishing a reply', async () => {
    const response = sseResponse(new TextEncoder().encode(': keep-alive\n\ndata: [DONE]\n\n'))
    const onSnapshot = vi.fn<(snapshot: StreamSnapshot) => void>()

    await expect(readChatCompletionStream(
      { availability: 'ok', response, model: 'unit/test-model' },
      onSnapshot,
    )).rejects.toThrow('Provider stream ended without a response')
    expect(onSnapshot).not.toHaveBeenCalled()
  })
})
