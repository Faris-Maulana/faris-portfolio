import { describe, expect, it, vi } from 'vitest'
import {
  readChatCompletionStream,
  type StreamSnapshot,
} from '@/lib/chat-provider'
import { MAX_CHAT_MESSAGE_CHARS } from '@/lib/chat-schema'

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

  it('surfaces an OpenRouter mid-stream error instead of silently discarding it', async () => {
    const response = sseResponse(new TextEncoder().encode([
      deltaEvent({ content: 'A partial answer' }),
      `data: ${JSON.stringify({ error: { code: 502, message: 'Provider disconnected unexpectedly' }, choices: [] })}`,
      'data: [DONE]',
    ].join('\n\n')))
    const onSnapshot = vi.fn<(snapshot: StreamSnapshot) => void>()

    await expect(readChatCompletionStream(
      { availability: 'ok', response, model: 'unit/test-model' },
      onSnapshot,
    )).rejects.toMatchObject({ name: 'ChatProviderStreamError', status: 502 })
    expect(onSnapshot).toHaveBeenCalledWith(expect.objectContaining({ reply: 'A partial answer' }))
  })

  it('rejects a non-empty stream that ends before its completion marker', async () => {
    const response = sseResponse(new TextEncoder().encode(deltaEvent({ content: 'Incomplete answer' })))
    const onSnapshot = vi.fn<(snapshot: StreamSnapshot) => void>()

    await expect(readChatCompletionStream(
      { availability: 'ok', response, model: 'unit/test-model' },
      onSnapshot,
    )).rejects.toThrow('Provider stream ended before its completion marker')
  })

  it('rejects token-limited SSE output instead of accepting a partial answer', async () => {
    const event = `data: ${JSON.stringify({
      choices: [{ delta: { content: 'Incomplete answer' }, finish_reason: 'length' }],
    })}`
    const response = sseResponse(new TextEncoder().encode(`${event}\n\ndata: [DONE]\n\n`))

    await expect(readChatCompletionStream(
      { availability: 'ok', response, model: 'unit/test-model' },
      () => {},
    )).rejects.toThrow('Provider stopped at its token limit')
  })

  it('rejects token-limited whole-JSON output', async () => {
    const response = Response.json({
      choices: [{ message: { content: 'Incomplete answer' }, finish_reason: 'length' }],
    })

    await expect(readChatCompletionStream(
      { availability: 'ok', response, model: 'unit/test-model' },
      () => {},
    )).rejects.toThrow('Provider stopped at its token limit')
  })

  it('accepts only an explicit successful stop for whole-JSON output', async () => {
    const response = Response.json({
      model: 'unit/selected-model',
      choices: [{ message: { content: 'Complete answer' }, finish_reason: 'stop' }],
    })

    await expect(readChatCompletionStream(
      { availability: 'ok', response, model: 'unit/test-model' },
      () => {},
    )).resolves.toMatchObject({ reply: 'Complete answer', model: 'unit/selected-model' })
  })

  it('maps a choice-level HTTP 200 error and preserves its retry delay', async () => {
    const response = Response.json({
      choices: [{
        message: { content: 'Partial answer' },
        finish_reason: 'error',
        error: { code: 429, message: 'Rate limit exceeded' },
      }],
    }, { headers: { 'retry-after': '12' } })

    await expect(readChatCompletionStream(
      { availability: 'ok', response, model: 'unit/test-model' },
      () => {},
    )).rejects.toMatchObject({ name: 'ChatProviderStreamError', status: 429, retryAfter: 12 })
  })

  it('rejects abnormal terminal SSE reasons instead of accepting partial output', async () => {
    for (const finishReason of ['content_filter', 'tool_calls', 'provider_specific_stop']) {
      const event = `data: ${JSON.stringify({
        choices: [{ delta: { content: 'Incomplete answer' }, finish_reason: finishReason }],
      })}`
      const response = sseResponse(new TextEncoder().encode(`${event}\n\ndata: [DONE]\n\n`))

      await expect(readChatCompletionStream(
        { availability: 'ok', response, model: 'unit/test-model' },
        () => {},
      )).rejects.toThrow()
    }
  })

  it('cancels a failed provider body before releasing its reader', async () => {
    const cancel = vi.fn()
    const event = `data: ${JSON.stringify({
      choices: [{ delta: { content: 'Filtered output' }, finish_reason: 'content_filter' }],
    })}\n\n`
    const response = new Response(new ReadableStream<Uint8Array>({
      start(controller) { controller.enqueue(new TextEncoder().encode(event)) },
      cancel,
    }), { headers: { 'content-type': 'text/event-stream' } })

    await expect(readChatCompletionStream(
      { availability: 'ok', response, model: 'unit/test-model' },
      () => {},
    )).rejects.toThrow('Provider ended with content_filter')
    expect(cancel).toHaveBeenCalledTimes(1)
  })

  it('rejects oversized output rather than silently clipping its final character', async () => {
    const response = sseResponse(new TextEncoder().encode([
      deltaEvent({ content: 'x'.repeat(MAX_CHAT_MESSAGE_CHARS + 1) }),
      'data: [DONE]',
    ].join('\n\n')))
    const onSnapshot = vi.fn<(snapshot: StreamSnapshot) => void>()

    await expect(readChatCompletionStream(
      { availability: 'ok', response, model: 'unit/test-model' },
      onSnapshot,
    )).rejects.toThrow('Invalid provider stream chunk')
    expect(onSnapshot).not.toHaveBeenCalled()
  })
})
