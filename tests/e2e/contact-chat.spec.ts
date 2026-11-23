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
      body: JSON.stringify({ reply: 'Syntax, permission and query-scope checks run before execution.', availability: 'ok' }),
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

test('assistant closes with Escape and restores focus to its launcher', async ({ page }) => {
  await page.goto('/')
  const launcher = page.getByRole('button', { name: /open portfolio assistant/i })
  await launcher.click()
  await expect(page.getByRole('dialog', { name: 'Portfolio assistant' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'Portfolio assistant' })).toHaveCount(0)
  await expect(launcher).toBeFocused()
})
