import { readFile } from 'node:fs/promises'
import { expect, test, type Locator, type Page } from '@playwright/test'

async function expectVisibleFieldError(field: Locator, page: Page) {
  await expect(field).toHaveAttribute('aria-invalid', 'true')
  const descriptionIds = (await field.getAttribute('aria-describedby'))?.split(/\s+/).filter(Boolean)
  expect(descriptionIds?.length).toBeGreaterThan(0)
  for (const id of descriptionIds ?? []) {
    await expect(page.locator(`[id="${id}"]`)).toBeVisible()
  }
}

const invalidSubmissions = [
  { field: 'Subject', value: 'x'.repeat(201), title: 'a subject over 200 characters' },
  { field: 'Email', value: 'not-an-email', title: 'an invalid email address' },
] as const

async function fillValidContact(contact: Locator) {
  await contact.getByRole('textbox', { name: /^Name\b/ }).fill('Playwright Tester')
  await contact.getByRole('textbox', { name: /^Email\b/ }).fill('person@example.com')
  await contact.getByRole('textbox', { name: /^Subject\b/ }).fill('Portfolio enquiry')
  await contact.getByRole('textbox', { name: /^Message\b/ }).fill('This is a valid portfolio enquiry for testing delivery states.')
}

const CHAT_STORAGE_KEY = 'aria_chat_messages_v2'
const CHAT_SESSION_KEY = 'faris_portfolio_sid'

async function seedTranscript(page: Page, total = 20) {
  await page.addInitScript(
    ({ key, count }) => {
      const messages = Array.from({ length: count }, (_, index) => ({
        role: index % 2 === 0 ? 'user' : 'assistant',
        content: `Saved message ${index + 1}. Notes about architecture, evaluation and limits repeated to overflow the transcript.`,
        ts: new Date(Date.now() - (count - index) * 60_000).toISOString(),
      }))
      localStorage.setItem(key, JSON.stringify(messages))
    },
    { key: CHAT_STORAGE_KEY, count: total },
  )
}

function transcriptDistance(log: Locator) {
  return log.evaluate(node => Math.round(node.scrollHeight - node.scrollTop - node.clientHeight))
}

async function openAssistant(page: Page) {
  await page.getByRole('button', { name: /open portfolio assistant/i }).click()
  const dialog = page.getByRole('dialog', { name: 'Portfolio assistant', exact: true })
  await expect(dialog).toBeVisible()
  return { dialog, log: dialog.getByRole('log', { name: 'Conversation transcript' }) }
}

for (const scenario of invalidSubmissions) {
  test(`contact shows a visible validation error for ${scenario.title}`, async ({ page }) => {
    let contactRequests = 0
    await page.route('**/api/contact', async route => {
      contactRequests += 1
      await route.fulfill({ status: 500, contentType: 'application/json', body: '{}' })
    })
    await page.goto('/#contact')

    const contact = page.locator('#contact')
    await fillValidContact(contact)

    const invalidField = contact.getByRole('textbox', { name: new RegExp(`^${scenario.field}\\b`) })
    await invalidField.fill(scenario.value)
    await contact.getByRole('button', { name: /^Send\b/i }).click()

    await expectVisibleFieldError(invalidField, page)
    expect(contactRequests).toBe(0)
  })
}

test('chat discloses AI output and handles a failed message request', async ({ page }) => {
  await page.route('**/api/chat', async route => {
    if (route.request().method() !== 'POST') {
      await route.continue()
      return
    }
    const payload = route.request().postDataJSON() as { messages: Array<Record<string, unknown>> }
    expect(payload.messages.at(-1)).toEqual({ role: 'user', content: 'Tell me about one project.' })
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Mocked assistant outage' }),
    })
  })
  await page.goto('/')

  await page.getByRole('button', { name: /open portfolio assistant/i }).click()
  const dialog = page.getByRole('dialog', { name: 'Portfolio assistant', exact: true })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByText(/AI-generated|artificial intelligence|automated|inaccurate|verify important/i).first()).toBeVisible()

  await dialog.getByRole('textbox').fill('Tell me about one project.')
  const sendButton = dialog.getByRole('button', { name: /^Send\b/i })
  await sendButton.click()

  const errorMessage = dialog.getByText(/unavailable|outage|error|try again|could not|couldn['’]t|went wrong/i).last()
  await expect(errorMessage).toBeVisible()
  await dialog.getByRole('textbox').fill('Try another question.')
  await expect(sendButton).toBeEnabled()
})

test('contact preserves a direct-delivery draft when notifications are unavailable', async ({ page }) => {
  await page.route('**/api/contact', async route => {
    await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ fallback: true }) })
  })
  await page.goto('/#contact')
  const contact = page.locator('#contact')
  await fillValidContact(contact)
  await contact.getByRole('button', { name: /^Send\b/i }).click()

  const heading = contact.getByRole('heading', { name: 'Your message is ready to hand off.' })
  await expect(heading).toBeVisible()
  await expect(heading).toBeFocused()
  const emailDraft = contact.getByRole('link', { name: /Open email draft/i })
  await expect(emailDraft).toHaveAttribute('href', /subject=Portfolio%20enquiry/)
  await expect(emailDraft).toHaveAttribute('href', /Name%3A%20Playwright%20Tester/)
})

test('contact reports provider acceptance without promising inbox receipt', async ({ page }) => {
  await page.route('**/api/contact', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
  })
  await page.goto('/#contact')
  const contact = page.locator('#contact')
  await fillValidContact(contact)
  await contact.getByRole('button', { name: /^Send\b/i }).click()

  await expect(contact.getByRole('heading', { name: 'Message accepted for delivery.' })).toBeVisible()
  await expect(contact.getByText(/Provider acceptance is not a guarantee of inbox receipt/)).toBeVisible()
})

test('assistant removes expired and malformed transcript entries before storage and outbound requests', async ({ page }) => {
  let outbound = ''
  await page.addInitScript(key => {
    localStorage.setItem(key, JSON.stringify([
      { role: 'user', content: 'EXPIRED_PRIVATE_CONTEXT', ts: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'assistant', content: 'MALFORMED_PRIVATE_CONTEXT', ts: 'not-a-date' },
      { role: 'assistant', content: 'Fresh public architecture summary.', ts: new Date().toISOString() },
    ]))
    localStorage.setItem('faris_portfolio_sid', 'legacy-persistent-session')
  }, CHAT_STORAGE_KEY)
  await page.route('**/api/chat', async route => {
    outbound = route.request().postData() ?? ''
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reply: 'Current answer.', availability: 'ok' }) })
  })
  await page.goto('/')
  const { dialog } = await openAssistant(page)

  await expect(dialog.locator('.chat-message').filter({ hasText: 'Fresh public architecture summary.' })).toBeVisible()
  await expect(dialog.locator('.chat-messages')).not.toContainText('EXPIRED_PRIVATE_CONTEXT')
  await expect(dialog.locator('.chat-messages')).not.toContainText('MALFORMED_PRIVATE_CONTEXT')
  const stored = await page.evaluate(key => localStorage.getItem(key), CHAT_STORAGE_KEY)
  expect(stored).toContain('Fresh public architecture summary.')
  expect(stored).not.toContain('EXPIRED_PRIVATE_CONTEXT')
  expect(stored).not.toContain('MALFORMED_PRIVATE_CONTEXT')

  await dialog.getByRole('textbox').fill('A current technical question.')
  await dialog.getByRole('button', { name: /^Send\b/i }).click()
  await expect.poll(() => outbound).not.toBe('')
  expect(outbound).not.toContain('EXPIRED_PRIVATE_CONTEXT')
  expect(outbound).not.toContain('MALFORMED_PRIVATE_CONTEXT')
  expect(outbound).not.toContain('legacy-persistent-session')
  expect(outbound).toContain('A current technical question.')
  expect(await page.evaluate(key => localStorage.getItem(key), CHAT_SESSION_KEY)).toBeNull()
  expect(await page.evaluate(key => sessionStorage.getItem(key), CHAT_SESSION_KEY)).toMatch(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/)
})

test('assistant opens at the newest line of a saved transcript', async ({ page }) => {
  await seedTranscript(page)
  await page.goto('/')
  const { log } = await openAssistant(page)

  await expect(log.locator('.chat-message', { hasText: 'Saved message 20.' })).toBeVisible()
  await expect.poll(() => transcriptDistance(log)).toBeLessThanOrEqual(1)

  await log.evaluate(node => {
    node.scrollTop = 0
    node.dispatchEvent(new Event('scroll'))
  })
  const jump = page.getByRole('button', { name: 'Latest message' })
  await expect(jump).toBeVisible()
  await jump.click()
  await expect.poll(() => transcriptDistance(log)).toBeLessThanOrEqual(1)
})

test('assistant welcome stays at the top and starter questions send a real request', async ({ page }) => {
  await page.route('**/api/chat', async route => {
    const payload = route.request().postDataJSON() as { messages: Array<Record<string, unknown>> }
    expect(payload.messages.at(-1)).toEqual({ role: 'user', content: 'How is generated SQL validated before execution?' })
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        reply: 'Syntax, permission and query-scope checks run before execution.',
        availability: 'ok',
        sources: [{ title: 'Text2SQL architecture and current maturity', href: '/work/text2sql' }],
      }),
    })
  })
  await page.goto('/')
  const { dialog, log } = await openAssistant(page)

  const title = dialog.locator('.chat-welcome-title')
  await expect(title).toHaveText(/Interrogate\s*the\s*work\./)
  await expect(title).toBeInViewport()
  expect(await title.evaluate(node => node.scrollWidth <= node.clientWidth + 1)).toBe(true)
  expect(await log.evaluate(node => node.scrollTop)).toBe(0)

  await page.setViewportSize({ width: 320, height: 480 })
  await expect(title).toBeInViewport()
  await expect.poll(() => title.evaluate(node => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1)

  await dialog.getByRole('button', { name: /How is generated SQL validated before execution/ }).click()
  await expect(log.locator('.chat-message', { hasText: 'Syntax, permission and query-scope checks run before execution.' })).toBeVisible()
  await expect(dialog.getByTestId('chat-loading')).toHaveCount(0)
  await expect(dialog.getByRole('link', { name: 'Text2SQL architecture and current maturity' })).toHaveAttribute('href', '/work/text2sql')
})

test('a late reply does not pull the transcript away from earlier messages', async ({ page }) => {
  await seedTranscript(page)
  let releaseReply = () => {}
  const replyGate = new Promise<void>(resolve => { releaseReply = resolve })
  await page.route('**/api/chat', async route => {
    await replyGate
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ reply: 'Delayed reply marker.', availability: 'ok' }),
    })
  })
  await page.goto('/')
  const { dialog, log } = await openAssistant(page)

  await dialog.getByRole('textbox').fill('Question while reading earlier messages.')
  await dialog.getByRole('button', { name: /^Send\b/i }).click()

  // Sending always reveals the reader's own message.
  await expect(log.locator('.chat-message', { hasText: 'Question while reading earlier messages.' })).toBeVisible()
  await expect.poll(() => transcriptDistance(log)).toBeLessThanOrEqual(1)

  // Scroll back through history and let the pinned state observe it.
  await log.evaluate(node => {
    node.scrollTop = 0
    node.dispatchEvent(new Event('scroll'))
  })
  expect(await transcriptDistance(log)).toBeGreaterThan(100)

  releaseReply()
  await expect(log.locator('.chat-message', { hasText: 'Delayed reply marker.' })).toHaveCount(1)
  expect(await log.evaluate(node => Math.round(node.scrollTop))).toBe(0)
})

test('assistant compact and expanded views stay contained across responsive changes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 })
  await page.goto('/')
  const { dialog } = await openAssistant(page)
  await expect.poll(() => dialog.evaluate(node => node.getBoundingClientRect().width)).toBe(576)
  await dialog.getByRole('button', { name: 'Expand assistant', exact: true }).click()
  await expect.poll(() => dialog.evaluate(node => node.getBoundingClientRect().width)).toBe(1056)
  expect(await dialog.locator('.chat-welcome').evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true)
  await expect(dialog.getByRole('button', { name: 'Restore compact assistant', exact: true })).toBeVisible()
  await dialog.getByRole('button', { name: 'Restore compact assistant', exact: true }).click()
  await expect.poll(() => dialog.evaluate(node => node.getBoundingClientRect().width)).toBe(576)

  await page.keyboard.press('Escape')
  await page.setViewportSize({ width: 390, height: 844 })
  const mobile = await openAssistant(page)
  await expect(mobile.dialog).toHaveCSS('width', '390px')
  await expect(mobile.dialog.locator('.chat-welcome')).toHaveCSS('display', 'block')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  for (const name of ['Export conversation as Markdown', 'Clear conversation history']) {
    await expect(mobile.dialog.getByRole('button', { name, exact: true })).toBeVisible()
  }
  await expect(mobile.dialog.getByRole('textbox', { name: 'Message', exact: true })).toBeVisible()
  await expect(mobile.dialog.getByRole('button', { name: 'Close portfolio assistant', exact: true })).toBeVisible()
})

test('assistant ignores malformed saved timestamps without crashing', async ({ page }) => {
  await page.addInitScript(key => {
    localStorage.setItem(key, JSON.stringify([{ role: 'user', content: 'Invalid saved timestamp', ts: 'not-a-date' }]))
  }, CHAT_STORAGE_KEY)
  await page.goto('/')
  const { dialog } = await openAssistant(page)
  await expect(dialog.locator('.chat-welcome-title')).toBeVisible()
  await expect(dialog.getByText('Invalid saved timestamp', { exact: false })).toHaveCount(0)
})

test('assistant stopping a pending response restores the draft without accepting a late reply', async ({ page }) => {
  await page.addInitScript(() => {
    let requestCount = 0
    let releaseFirstReply = () => {}
    Object.assign(window, { chatTest: { requestCount: () => requestCount, releaseFirstReply: () => releaseFirstReply() } })
    const originalFetch = window.fetch.bind(window)
    window.fetch = (input, init) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
      if (!url.includes('/api/chat')) return originalFetch(input, init)
      requestCount += 1
      if (requestCount > 1) return Promise.resolve(new Response(JSON.stringify({ reply: 'Retried response marker.', availability: 'ok' }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      return new Promise<Response>(resolve => {
        releaseFirstReply = () => resolve(new Response(JSON.stringify({ reply: 'Cancelled response marker.', availability: 'ok' }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      })
    }
  })
  await page.goto('/')
  const { dialog } = await openAssistant(page)
  const composer = dialog.getByRole('textbox', { name: 'Message', exact: true })
  await composer.fill('Explain the evaluation release gates.')
  await dialog.getByRole('button', { name: 'Send message', exact: true }).click()
  await expect(dialog.getByTestId('chat-loading')).toBeVisible()
  await expect.poll(() => page.evaluate(() => (window as unknown as Window & { chatTest: { requestCount: () => number } }).chatTest.requestCount())).toBe(1)

  await dialog.getByRole('button', { name: 'Stop generating response', exact: true }).click()
  await expect(composer).toHaveValue('Explain the evaluation release gates.')
  await expect(composer).toBeFocused()
  await expect(dialog.getByTestId('chat-loading')).toHaveCount(0)
  await expect(dialog.locator('.chat-message')).toHaveCount(0)
  expect(await page.evaluate(key => localStorage.getItem(key), CHAT_STORAGE_KEY)).toBeNull()
  await page.evaluate(() => (window as unknown as Window & { chatTest: { releaseFirstReply: () => void } }).chatTest.releaseFirstReply())
  await composer.press('Enter')
  await expect(dialog.locator('.chat-message', { hasText: 'Retried response marker.' })).toBeVisible()
  await expect(dialog.locator('.chat-message', { hasText: 'Cancelled response marker.' })).toHaveCount(0)
  await expect.poll(() => page.evaluate(() => (window as unknown as Window & { chatTest: { requestCount: () => number } }).chatTest.requestCount())).toBe(2)
})

test('assistant stopping preserves newer text composed during a pending response', async ({ page }) => {
  await page.addInitScript(() => {
    const originalFetch = window.fetch.bind(window)
    window.fetch = (input, init) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
      if (!url.includes('/api/chat')) return originalFetch(input, init)
      return new Promise<Response>(() => {})
    }
  })
  await page.goto('/')
  const { dialog } = await openAssistant(page)
  const composer = dialog.getByRole('textbox', { name: 'Message', exact: true })
  await composer.fill('First question')
  await dialog.getByRole('button', { name: 'Send message', exact: true }).click()
  await expect(dialog.getByTestId('chat-loading')).toBeVisible()
  await composer.fill('Newer unfinished draft')
  await dialog.getByRole('button', { name: 'Stop generating response', exact: true }).click()
  await expect(composer).toHaveValue('Newer unfinished draft')
  await expect(dialog.locator('.chat-message')).toHaveCount(0)
})

test('assistant marks a late failed reply as unread while closed', async ({ page }) => {
  let releaseReply = () => {}
  const replyGate = new Promise<void>(resolve => { releaseReply = resolve })
  await page.route('**/api/chat', async route => {
    await replyGate
    await route.fulfill({ status: 503, contentType: 'application/json', body: '{}' })
  })
  await page.goto('/')
  const { dialog } = await openAssistant(page)
  await dialog.getByRole('textbox', { name: 'Message', exact: true }).fill('Question before closing')
  await dialog.getByRole('button', { name: 'Send message', exact: true }).click()
  await expect(dialog.getByTestId('chat-loading')).toBeVisible()
  await dialog.getByRole('button', { name: 'Close portfolio assistant', exact: true }).click()
  releaseReply()
  await expect(page.getByRole('button', { name: /open portfolio assistant/i })).toHaveAccessibleName(/unread reply/)
})

test('assistant copies responses, exports Markdown, follows up, and confirms destructive clearing', async ({ page, context, browserName }) => {
  // WebKit rejects Chromium's clipboard-write permission; the real click supplies user activation.
  if (browserName === 'chromium') await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  let questionNumber = 0
  await page.route('**/api/chat', async route => {
    questionNumber += 1
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reply: `Deterministic response ${questionNumber}.`, availability: 'ok' }) })
  })
  await page.goto('/')
  const { dialog } = await openAssistant(page)
  await dialog.getByRole('textbox', { name: 'Message', exact: true }).fill('How is generated SQL validated?')
  await dialog.getByRole('button', { name: 'Send message', exact: true }).click()
  await expect(dialog.locator('.chat-message', { hasText: 'Deterministic response 1.' })).toBeVisible()

  await dialog.getByRole('button', { name: /Copy response from/ }).click()
  await expect(dialog.getByRole('button', { name: /Copy response from/ })).toHaveText('Copied')
  if (browserName === 'webkit') {
    // WebKit permits the user-initiated write but denies scripted clipboard reads; verify through real paste.
    const composer = dialog.getByRole('textbox', { name: 'Message', exact: true })
    await composer.fill('')
    await composer.focus()
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+v' : 'Control+v')
    await expect(composer).toHaveValue('Deterministic response 1.')
    await composer.fill('')
  } else {
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe('Deterministic response 1.')
  }
  await expect(dialog.getByRole('status').filter({ hasText: 'Response copied to clipboard.' })).toBeAttached()

  const downloadEvent = page.waitForEvent('download')
  await dialog.getByRole('button', { name: 'Export conversation as Markdown', exact: true }).click()
  const download = await downloadEvent
  expect(download.suggestedFilename()).toMatch(/^aria-portfolio-conversation-\d{4}-\d{2}-\d{2}\.md$/)
  const exportPath = await download.path()
  const markdown = await readFile(exportPath!, 'utf8')
  expect(markdown).toContain('How is generated SQL validated?')
  expect(markdown).toContain('Deterministic response 1.')
  expect(markdown).toContain('public portfolio context')

  const followUp = dialog.getByRole('button', { name: 'Which validation boundaries are deterministic?', exact: true })
  await expect(followUp).toBeVisible()
  await followUp.click()
  await expect(dialog.locator('.chat-message', { hasText: 'Deterministic response 2.' })).toBeVisible()
  await expect(dialog.locator('.chat-message')).toHaveCount(4)

  await dialog.getByRole('button', { name: 'Clear conversation history', exact: true }).click()
  await expect(dialog.getByText("Clear this browser's conversation?", { exact: true })).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Keep', exact: true })).toBeFocused()
  await dialog.getByRole('button', { name: 'Keep', exact: true }).click()
  await expect(dialog.getByRole('button', { name: 'Clear conversation history', exact: true })).toBeFocused()
  await expect(dialog.locator('.chat-message')).toHaveCount(4)
  await dialog.getByRole('button', { name: 'Clear conversation history', exact: true }).click()
  await dialog.locator('.chat-confirm').getByRole('button', { name: 'Clear', exact: true }).click()
  await expect(dialog.locator('.chat-message')).toHaveCount(0)
  await expect(dialog.locator('.chat-welcome-title')).toBeVisible()
  expect(await page.evaluate(key => localStorage.getItem(key), CHAT_STORAGE_KEY)).toBeNull()
  expect(await page.evaluate(key => sessionStorage.getItem(key), CHAT_SESSION_KEY)).toBeNull()
  expect(await page.evaluate(key => localStorage.getItem(key), CHAT_SESSION_KEY)).toBeNull()
})

test('assistant protects IME composition and ordinary Enter submission', async ({ page }) => {
  let requests = 0
  await page.route('**/api/chat', async route => {
    requests += 1
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reply: 'Evaluation uses explicit quality gates.', availability: 'ok' }) })
  })
  await page.goto('/')
  const { dialog } = await openAssistant(page)
  const composer = dialog.getByRole('textbox', { name: 'Message', exact: true })
  await composer.fill('評価方法')
  for (const isComposing of [true, false]) {
    const defaultPrevented = await composer.evaluate((node, composing) => {
      const event = new KeyboardEvent('keydown', { key: 'Enter', keyCode: 229, isComposing: composing, bubbles: true, cancelable: true })
      node.dispatchEvent(event)
      return event.defaultPrevented
    }, isComposing)
    expect(defaultPrevented).toBe(false)
    expect(requests).toBe(0)
    await expect(composer).toHaveValue('評価方法')
    await expect(dialog.getByTestId('chat-loading')).toHaveCount(0)
  }
  await composer.press('Enter')
  await expect(dialog.locator('.chat-message', { hasText: 'Evaluation uses explicit quality gates.' })).toBeVisible()
  expect(requests).toBe(1)
})

test('assistant closes with Escape and restores focus to its launcher', async ({ page }) => {
  await page.goto('/')
  const launcher = page.getByRole('button', { name: /open portfolio assistant/i })
  await launcher.click()
  const dialog = page.getByRole('dialog', { name: 'Portfolio assistant' })
  await expect(dialog).toBeVisible()
  for (let index = 0; index < 12; index += 1) {
    await page.keyboard.press(index === 11 ? 'Shift+Tab' : 'Tab')
    await expect.poll(() => page.evaluate(() => document.querySelector('#portfolio-assistant')?.contains(document.activeElement))).toBe(true)
  }
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'Portfolio assistant' })).toHaveCount(0)
  await expect(launcher).toBeFocused()
})
