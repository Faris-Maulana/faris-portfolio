import { expect, test, type Page } from '@playwright/test'

interface StreamHarness {
  pushRaw: (value: string) => void
  close: () => void
}

function streamEvent(page: Page, event: Record<string, unknown>) {
  return page.evaluate(value => {
    const harness = (window as unknown as Window & { chatStreamTest: StreamHarness }).chatStreamTest
    harness.pushRaw(`${JSON.stringify(value)}\n`)
  }, event)
}

test('assistant renders cumulative NDJSON as Markdown and optional provider reasoning', async ({ page, context, browserName }) => {
  if (browserName === 'chromium') await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addInitScript(() => {
    const nativeFetch = window.fetch.bind(window)
    let pushRaw: (value: string) => void = () => {}
    let close = () => {}
    Object.assign(window, {
      chatStreamTest: {
        pushRaw: (value: string) => pushRaw(value),
        close: () => close(),
      },
    })
    window.fetch = (input, init) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
      if (!url.includes('/api/chat')) return nativeFetch(input, init)
      const body = new ReadableStream<Uint8Array>({
        start(controller) {
          const encoder = new TextEncoder()
          pushRaw = value => controller.enqueue(encoder.encode(value))
          close = () => controller.close()
          controller.enqueue(encoder.encode(`${JSON.stringify({
            type: 'meta', availability: 'ok', model: 'unit/model', mode: 'model',
            sources: [{ title: 'Text2SQL architecture and current maturity', href: '/work/text2sql' }],
          })}\n`))
        },
      })
      return Promise.resolve(new Response(body, {
        status: 200,
        headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8' },
      }))
    }
  })
  await page.goto('/')
  await page.getByRole('button', { name: /open portfolio assistant/i }).click()
  const dialog = page.getByRole('dialog', { name: 'Portfolio assistant', exact: true })
  const composer = dialog.getByRole('textbox', { name: 'Message', exact: true })
  await composer.fill('Show the SQL validation boundary.')
  await composer.press('Enter')
  await expect(dialog.getByTestId('chat-loading')).toBeVisible()
  await expect(dialog.locator('.chat-signal-pulse i').first()).toHaveCSS('animation-name', 'none')

  await streamEvent(page, { type: 'delta', content: '**Validation', reasoning: 'Compare public records.' })
  await expect(dialog.locator('.chat-message-assistant')).toContainText('**Validation')
  await expect(dialog.getByTestId('chat-loading')).toContainText('Receiving response')

  await page.evaluate(() => {
    const harness = (window as unknown as Window & { chatStreamTest: StreamHarness }).chatStreamTest
    harness.pushRaw('{"type":"delta","content":"**Validation boundary**\\n\\n- **Scope**: read-only\\n\\n```sql\\nSELECT *\\nFROM incidents\\nLIMIT 20;\\n```\\n\\n> Synthetic example.","reasoning":"Compare public records."}')
    harness.pushRaw('\n')
  })
  await streamEvent(page, {
    type: 'done', availability: 'ok', reply: '**Validation boundary**\n\n- **Scope**: read-only\n\n```sql\nSELECT *\nFROM incidents\nLIMIT 20;\n```\n\n> Synthetic example.',
    reasoning: 'Compare public records.', model: 'unit/model', mode: 'model',
    sources: [{ title: 'Text2SQL architecture and current maturity', href: '/work/text2sql' }],
  })
  await page.evaluate(() => {
    const harness = (window as unknown as Window & { chatStreamTest: StreamHarness }).chatStreamTest
    harness.close()
  })

  const answer = dialog.locator('.chat-message-assistant').last()
  await expect(answer.locator('strong').filter({ hasText: 'Validation boundary' })).toBeVisible()
  await expect(answer.locator('ul li')).toContainText('Scope: read-only')
  await expect(answer.locator('pre code')).toHaveText('SELECT *\nFROM incidents\nLIMIT 20;')
  await expect(answer.locator('blockquote')).toContainText('Synthetic example.')
  await expect(answer).not.toContainText('**Validation boundary**')
  await expect(dialog.locator('[role="log"]')).toHaveAttribute('aria-busy', 'false')

  const reasoning = dialog.locator('.chat-reasoning')
  await expect(reasoning).not.toHaveAttribute('open', '')
  await reasoning.getByText('Reasoning trace', { exact: true }).click()
  await expect(reasoning).toContainText('Compare public records.')

  const codeCopy = answer.getByRole('button', { name: 'Copy SQL code', exact: true })
  await codeCopy.click()
  await expect(codeCopy).toContainText('Copied')
  if (browserName === 'webkit') {
    await composer.focus()
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+v' : 'Control+v')
    await expect(composer).toHaveValue('SELECT *\nFROM incidents\nLIMIT 20;')
  } else {
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe('SELECT *\nFROM incidents\nLIMIT 20;')
  }
})

test('assistant retries a rate-limited turn without retaining the failed response', async ({ page }) => {
  let requests = 0
  await page.route('**/api/chat', async route => {
    requests += 1
    if (requests === 1) {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        headers: { 'Retry-After': '17' },
        body: JSON.stringify({ availability: 'rate_limited', reply: 'The AI service is busy right now. Please try again shortly.' }),
      })
      return
    }
    const payload = route.request().postDataJSON() as { messages: Array<{ role: string; content: string }> }
    expect(payload.messages).toEqual([{ role: 'user', content: 'What does Faris own as an engineering lead?' }])
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ availability: 'ok', reply: 'Faris owns architecture and delivery tradeoffs.' }) })
  })
  await page.goto('/')
  await page.getByRole('button', { name: /open portfolio assistant/i }).click()
  const dialog = page.getByRole('dialog', { name: 'Portfolio assistant', exact: true })
  const composer = dialog.getByRole('textbox', { name: 'Message', exact: true })
  await composer.fill('What does Faris own as an engineering lead?')
  await composer.press('Enter')
  await expect(dialog.getByRole('alert')).toContainText('Request limit reached')
  await expect(dialog.getByRole('button', { name: 'Retry response', exact: true })).toBeVisible()
  await dialog.getByRole('button', { name: 'Retry response', exact: true }).click()
  await expect(dialog.locator('.chat-message-assistant')).toContainText('Faris owns architecture and delivery tradeoffs.')
  await expect(dialog.locator('.chat-message')).toHaveCount(2)
  expect(requests).toBe(2)
})

test('route starters, five-line composer, shortcuts and prompt recall stay usable', async ({ page }) => {
  await page.route('**/api/chat', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ availability: 'ok', reply: 'The committed report contains 20 queries.' }) })
  })
  await page.goto('/work/rag-eval')
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
  await page.keyboard.press('/')
  const dialog = page.getByRole('dialog', { name: 'Portfolio assistant', exact: true })
  const composer = dialog.getByRole('textbox', { name: 'Message', exact: true })
  await expect(composer).toBeFocused()
  await expect(dialog.getByRole('button', { name: /What does the RAG 20-query retrieval report actually show/ })).toBeVisible()

  await composer.fill('one\ntwo\nthree\nfour\nfive\nsix')
  const metrics = await composer.evaluate(node => {
    const style = getComputedStyle(node)
    return {
      height: node.getBoundingClientRect().height,
      maximum: (Number.parseFloat(style.lineHeight) || 24) * 5 + Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom),
      overflow: style.overflowY,
    }
  })
  expect(metrics.height).toBeLessThanOrEqual(metrics.maximum + 1)
  expect(metrics.overflow).toBe('auto')
  await composer.fill('x'.repeat(800))
  await expect(dialog.locator('#chat-composer-guidance')).toContainText('0 characters remaining')

  const prompt = 'What does the RAG 20-query retrieval report actually show?'
  await composer.fill(prompt)
  await composer.press('Enter')
  await expect(dialog.locator('.chat-message-assistant')).toContainText('The committed report contains 20 queries.')
  await expect(composer).toHaveValue('')
  await composer.press('ArrowUp')
  await expect(composer).toHaveValue(prompt)
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+k' : 'Control+k')
  await expect(composer).toBeFocused()
})
