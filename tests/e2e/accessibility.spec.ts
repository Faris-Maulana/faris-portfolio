import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const targets = [
  { name: 'homepage', url: '/', include: undefined },
  { name: 'contact section', url: '/#contact', include: '#contact' },
  { name: 'case study', url: '/work/text2sql', include: undefined },
] as const

for (const target of targets) {
  test(`${target.name} has no serious or critical accessibility violations`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(target.url)
    await expect(page.locator('#main')).toBeVisible()

    let builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    if (target.include) builder = builder.include(target.include)
    const { violations } = await builder.analyze()
    const seriousViolations = violations
      .filter(violation => violation.impact === 'serious' || violation.impact === 'critical')
      .map(violation => ({
        id: violation.id,
        impact: violation.impact,
        targets: violation.nodes.map(node => node.target),
      }))

    expect(seriousViolations).toEqual([])
  })
}

test('expanded atlas has no serious or critical accessibility violations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.getByRole('button', { name: 'Expand infrastructure map', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Expanded infrastructure map', exact: true })).toBeVisible()

  const { violations } = await new AxeBuilder({ page })
    .include('.atlas-explorer-dialog')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  const seriousViolations = violations
    .filter(violation => violation.impact === 'serious' || violation.impact === 'critical')
    .map(violation => ({ id: violation.id, targets: violation.nodes.map(node => node.target) }))
  expect(seriousViolations).toEqual([])
})

test('populated assistant dialog has no serious or critical accessibility violations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addInitScript(() => {
    localStorage.setItem('aria_chat_messages_v2', JSON.stringify([
      { role: 'user', content: 'How is generated SQL validated before execution?', ts: new Date(Date.now() - 60_000).toISOString() },
      { role: 'assistant', content: 'Syntax, permission and query-scope checks run before execution.', ts: new Date().toISOString() },
    ]))
  })
  await page.goto('/')
  await page.getByRole('button', { name: /open portfolio assistant/i }).click()
  const dialog = page.getByRole('dialog', { name: 'Portfolio assistant', exact: true })
  await expect(dialog.getByText('Syntax, permission and query-scope checks run before execution.', { exact: false })).toBeVisible()

  const { violations } = await new AxeBuilder({ page })
    .include('#portfolio-assistant')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  const seriousViolations = violations
    .filter(violation => violation.impact === 'serious' || violation.impact === 'critical')
    .map(violation => ({ id: violation.id, targets: violation.nodes.map(node => node.target) }))
  expect(seriousViolations).toEqual([])
})

test('assistant dialog has no serious or critical accessibility violations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.getByRole('button', { name: /open portfolio assistant/i }).click()
  await expect(page.getByRole('dialog', { name: 'Portfolio assistant' })).toBeVisible()

  const { violations } = await new AxeBuilder({ page })
    .include('#portfolio-assistant')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  const seriousViolations = violations
    .filter(violation => violation.impact === 'serious' || violation.impact === 'critical')
    .map(violation => ({ id: violation.id, targets: violation.nodes.map(node => node.target) }))
  expect(seriousViolations).toEqual([])
})
