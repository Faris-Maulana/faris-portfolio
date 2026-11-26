import { expect, test, type Page } from '@playwright/test'

type CapturedEvent = { name: string; data?: Record<string, string | number | boolean | null> }
type AnalyticsWindow = Window & { __portfolioEvents: CapturedEvent[] }

async function captureEvents(page: Page) {
  await page.addInitScript(() => {
    const analyticsWindow = window as unknown as AnalyticsWindow
    analyticsWindow.__portfolioEvents = []
    window.va = (type, payload) => {
      if (type !== 'event') return
      const event = payload as CapturedEvent
      analyticsWindow.__portfolioEvents.push(event)
    }
  })
}

async function events(page: Page) {
  return page.evaluate(() => (window as unknown as AnalyticsWindow).__portfolioEvents)
}

test('SIMPUL emits only scenario identifiers for run creation and replay export', async ({ page }) => {
  await captureEvents(page)
  await page.goto('/simpul')
  await page.getByRole('button', { name: 'Create deterministic run', exact: true }).click()
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export replay JSON', exact: true }).click()
  await download

  const recorded = await events(page)
  expect(recorded).toContainEqual({ name: 'simpul_run_created', data: { scenario: 'fiber-cut' } })
  expect(recorded).toContainEqual({ name: 'simpul_replay_exported', data: { scenario: 'fiber-cut' } })
  expect(JSON.stringify(recorded)).not.toContain('runId')
  expect(JSON.stringify(recorded)).not.toContain('seed')
})

test('ARIA events count intent without recording private question text', async ({ page }) => {
  await captureEvents(page)
  await page.route('**/api/chat', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ reply: 'A public architecture answer.', availability: 'ok' }),
  }))
  await page.goto('/')
  await page.getByRole('button', { name: /Ask ARIA/ }).click()
  const dialog = page.getByRole('dialog', { name: 'Portfolio assistant', exact: true })
  await dialog.getByRole('textbox').fill('PRIVATE_QUESTION_MUST_NOT_BE_TRACKED private@example.com')
  await dialog.getByRole('button', { name: 'Send message', exact: true }).click()
  await expect(dialog).toContainText('A public architecture answer.')
  await dialog.getByRole('link', { name: 'Talk to Faris', exact: true }).click()

  const recorded = await events(page)
  expect(recorded.map(event => event.name)).toEqual(['chat_open', 'chat_first_question', 'chat_contact_handoff'])
  expect(JSON.stringify(recorded)).not.toContain('PRIVATE_QUESTION_MUST_NOT_BE_TRACKED')
  expect(JSON.stringify(recorded)).not.toContain('private@example.com')
})

test('contact emits accepted only after provider acceptance and never emits form values', async ({ page }) => {
  await captureEvents(page)
  let requested = 0
  await page.route('**/api/contact', async route => {
    requested += 1
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
  })
  await page.goto('/#contact')
  const form = page.locator('#contact')
  await form.getByRole('button', { name: 'Send message', exact: true }).click()
  const requiredName = form.getByRole('textbox', { name: /^Name\b/ })
  await expect(requiredName).toHaveAttribute('aria-invalid', 'true')
  const nameErrorId = await requiredName.getAttribute('aria-describedby')
  expect(nameErrorId).toBeTruthy()
  await expect(form.locator(`#${nameErrorId}`)).toBeVisible()
  expect((await events(page)).some(event => event.name === 'contact_provider_accepted')).toBe(false)

  await form.getByRole('textbox', { name: /^Name\b/ }).fill('Private Person')
  await form.getByRole('textbox', { name: /^Email\b/ }).fill('private@example.com')
  await form.getByRole('textbox', { name: /^Subject\b/ }).fill('PRIVATE_SUBJECT')
  await form.getByRole('textbox', { name: /^Message\b/ }).fill('PRIVATE_MESSAGE_BODY')
  await form.getByRole('button', { name: 'Send message', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Message accepted for delivery.', exact: true })).toBeVisible()
  expect(requested).toBe(1)

  const recorded = await events(page)
  expect(recorded).toEqual([{ name: 'contact_provider_accepted', data: { channel: 'form' } }])
  const serialized = JSON.stringify(recorded)
  expect(serialized).not.toContain('private@example.com')
  expect(serialized).not.toContain('PRIVATE_SUBJECT')
  expect(serialized).not.toContain('PRIVATE_MESSAGE_BODY')
})

test('case conversion actions retain only the case and destination type', async ({ page }) => {
  await captureEvents(page)
  await page.goto('/work/rag-eval')
  const contact = page.getByRole('link', { name: 'Discuss this system', exact: true })
  await contact.evaluate(link => link.addEventListener('click', event => event.preventDefault(), { once: true }))
  await contact.click()
  expect(await events(page)).toContainEqual({ name: 'case_contact_click', data: { caseId: 'rag-eval' } })
})
