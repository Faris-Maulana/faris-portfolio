import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

type AxeResults = Awaited<ReturnType<AxeBuilder['analyze']>>

function violationDetails(violations: AxeResults['violations']) {
  return violations.map(violation => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    targets: violation.nodes.map(node => ({ target: node.target, summary: node.failureSummary })),
  }))
}

const targets = [
  { name: 'homepage', url: '/', include: undefined },
  { name: 'contact section', url: '/#contact', include: '#contact' },
  { name: 'prose-bounded case study', url: '/work/text2sql', include: undefined },
  { name: 'artifact-backed case study', url: '/work/rag-eval', include: undefined },
  { name: 'SIMPUL proving ground', url: '/simpul', include: undefined },
] as const

for (const theme of ['light', 'dark'] as const) {
  for (const target of targets) {
    test(`${target.name} has no tagged WCAG ${theme}-theme accessibility violations`, async ({ page }) => {
      await page.addInitScript(selected => localStorage.setItem('faris-theme', selected), theme)
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto(target.url)
      await expect(page.locator('#main')).toBeVisible()

      let builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      if (target.include) builder = builder.include(target.include)
      const { violations } = await builder.analyze()
      expect(violationDetails(violations)).toEqual([])
    })
  }
}

for (const theme of ['light', 'dark'] as const) {
  test(`expanded atlas has no tagged WCAG ${theme}-theme accessibility violations`, async ({ page }) => {
    await page.addInitScript(selected => localStorage.setItem('faris-theme', selected), theme)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await page.getByRole('button', { name: 'Expand infrastructure map', exact: true }).click()
    await expect(page.getByRole('dialog', { name: 'Expanded infrastructure map', exact: true })).toBeVisible()

    const { violations } = await new AxeBuilder({ page })
      .include('.atlas-explorer-dialog')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(violationDetails(violations)).toEqual([])
  })
}

for (const theme of ['light', 'dark'] as const) {
  test(`populated assistant dialog has no tagged WCAG ${theme}-theme accessibility violations`, async ({ page }) => {
    await page.addInitScript(selected => localStorage.setItem('faris-theme', selected), theme)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.addInitScript(() => {
      localStorage.setItem('aria_chat_messages_v2', JSON.stringify([
        { role: 'user', content: 'How is generated SQL validated before execution?', ts: new Date(Date.now() - 60_000).toISOString() },
        {
          role: 'assistant',
          content: 'Syntax, permission and query-scope checks run before execution.',
          ts: new Date(Date.now() - 50_000).toISOString(),
          sources: [{ title: 'Text2SQL architecture and current maturity', href: '/work/text2sql' }],
        },
        { role: 'user', content: 'Show a bounded SQL example.', ts: new Date(Date.now() - 40_000).toISOString() },
        {
          role: 'assistant',
          content: '**Validation boundary**\n\n- **Scope**: read-only\n\n```sql\nSELECT *\nFROM incidents\nLIMIT 20;\n```\n\n> Synthetic example.',
          ts: new Date().toISOString(),
          reasoning: 'Provider summary: compare the public validation rules.',
          sources: [{ title: 'Text2SQL architecture and current maturity', href: '/work/text2sql' }],
        },
      ]))
    })
    await page.goto('/')
    await page.getByRole('button', { name: /open portfolio assistant/i }).click()
    const dialog = page.getByRole('dialog', { name: 'Portfolio assistant', exact: true })
    await expect(dialog.getByText('Syntax, permission and query-scope checks run before execution.', { exact: false })).toBeVisible()
    await expect(dialog.locator('.chat-code-block')).toBeVisible()
    await dialog.getByText('Reasoning trace', { exact: true }).click()
    await expect(dialog.locator('.chat-reasoning-body')).toBeVisible()

    const { violations } = await new AxeBuilder({ page })
      .include('#portfolio-assistant')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(violationDetails(violations)).toEqual([])
  })

  test(`assistant dialog has no tagged WCAG ${theme}-theme accessibility violations`, async ({ page }) => {
    await page.addInitScript(selected => localStorage.setItem('faris-theme', selected), theme)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await page.getByRole('button', { name: /open portfolio assistant/i }).click()
    await expect(page.getByRole('dialog', { name: 'Portfolio assistant' })).toBeVisible()

    const { violations } = await new AxeBuilder({ page })
      .include('#portfolio-assistant')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(violationDetails(violations)).toEqual([])
  })
}
