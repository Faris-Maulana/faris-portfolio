import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'

async function createScenario(page: import('@playwright/test').Page, scenarioId: string, seed?: number) {
  const scenario = page.getByRole('combobox', { name: 'Scenario', exact: true })
  await scenario.selectOption(scenarioId)
  if (seed !== undefined) await page.getByRole('spinbutton', { name: 'Seed', exact: true }).fill(String(seed))
  await page.getByRole('button', { name: 'Create deterministic run', exact: true }).click()
}

test('creates a deterministic run from the primary scenario and seed controls', async ({ page }) => {
  await page.goto('/simpul')
  await expect(page.getByRole('heading', { name: 'SIMPUL', exact: true })).toBeVisible()
  await expect(page.getByText('Deterministic reference run', { exact: true })).toBeVisible()
  await expect(page.locator('.simpul-scope code')).toContainText('simpul-fiber-cut')

  await createScenario(page, 'alert-storm', 4242)
  await expect(page.getByRole('heading', { name: 'Alert storm with duplicate and stale NMS data', exact: true })).toBeVisible()
  await expect(page.locator('.simpul-scope code')).toContainText('simpul-alert-storm-00001092')
  await expect(page.getByTestId('simpul-cursor')).toContainText('Event 8 of 8')
  expect(await page.getByLabel('Evidence available at this cursor').getByRole('button').count()).toBeGreaterThanOrEqual(5)
  await page.getByRole('button', { name: 'Restart replay', exact: true }).click()
  await expect(page.getByText('No evidence at this cursor', { exact: true })).toBeVisible()
})

test('transport supports restart, previous, next, slider and playback pause', async ({ page }) => {
  await page.goto('/simpul')
  const cursor = page.getByTestId('simpul-cursor')
  const restart = page.getByRole('button', { name: 'Restart replay', exact: true })
  const previous = page.getByRole('button', { name: 'Previous event', exact: true })
  const next = page.getByRole('button', { name: 'Next event', exact: true })

  await expect(cursor).toHaveText('Event 8 of 8')
  await restart.click()
  await expect(cursor).toHaveText('Event 1 of 8')
  await expect(previous).toBeDisabled()
  await next.click()
  await expect(cursor).toHaveText('Event 2 of 8')
  await previous.click()
  await expect(cursor).toHaveText('Event 1 of 8')

  const slider = page.getByRole('slider', { name: 'Replay event cursor', exact: true })
  await slider.focus()
  await page.keyboard.press('ArrowRight')
  await expect(cursor).toHaveText('Event 2 of 8')
  await page.getByRole('button', { name: 'Play replay', exact: true }).click()
  await expect.poll(async () => cursor.textContent()).not.toBe('Event 2 of 8')
  await page.getByRole('button', { name: 'Pause replay', exact: true }).click()
  const pausedAt = await cursor.textContent()
  await page.waitForTimeout(950)
  await expect(cursor).toHaveText(pausedAt!)

  await slider.focus()
  await page.keyboard.press('End')
  await expect(cursor).toHaveText('Event 8 of 8')
  await expect(next).toBeDisabled()
})

test('guided review exposes the scenario objective and jumps through real recorded events', async ({ page }) => {
  await page.goto('/simpul')
  const cursor = page.getByTestId('simpul-cursor')
  const review = page.getByRole('region', { name: 'Review path', exact: true })

  await expect(page.getByText('Review objective: Trace affected links and services, then approve an exact reroute.', { exact: true })).toBeVisible()
  await expect(review.getByRole('button', { name: 'Seek Outcome review stage', exact: true })).toHaveAttribute('aria-current', 'step')
  await expect(cursor).toHaveText('Event 8 of 8')

  await review.getByRole('button', { name: 'Review from start', exact: true }).click()
  await expect(cursor).toHaveText('Event 1 of 8')
  await expect(review.getByRole('button', { name: 'Review from start', exact: true })).toBeDisabled()

  await review.getByRole('button', { name: 'Jump to proposal', exact: true }).click()
  await expect(review.getByRole('button', { name: 'Seek Proposal review stage', exact: true })).toHaveAttribute('aria-current', 'step')
  await expect(review).toContainText('decision.proposed')
  await expect(review.getByRole('button', { name: 'Jump to proposal', exact: true })).toBeDisabled()

  await review.getByRole('button', { name: 'Seek Outcome review stage', exact: true }).click()
  await expect(cursor).toHaveText('Event 8 of 8')
  await expect(review).toContainText('run.completed')
})

test('counterfactual approval and rejection branches preserve the parent run', async ({ page }) => {
  await page.goto('/simpul')
  await createScenario(page, 'approval-binding', 4172)
  const originalId = await page.locator('.simpul-scope code').textContent()
  await expect(page.getByText('approved', { exact: true })).toBeVisible()

  await page.getByRole('combobox', { name: 'Approval artifact', exact: true }).selectOption('maint-expired')
  await page.getByRole('button', { name: 'Approve and branch', exact: true }).click()
  await expect(page.getByText('approval-expired', { exact: true })).toBeVisible()
  await expect(page.locator('.simpul-scope code')).not.toHaveText(originalId!)
  await expect(page.getByText(/Branch of simpul-approval-binding/)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Return to parent run', exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Return to parent run', exact: true }).click()
  await expect(page.locator('.simpul-scope code')).toHaveText(originalId!)
  await expect(page.getByText('approved', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Reject and branch', exact: true }).click()
  await expect(page.getByText('operator-rejected', { exact: true })).toBeVisible()
  await expect(page.getByText('No synthetic action was applied in this operator-rejected branch.', { exact: true })).toBeVisible()
})

test('exports the active trace as a self-contained replay JSON download', async ({ page }) => {
  await page.goto('/simpul')
  await createScenario(page, 'missing-telemetry', 92)
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export replay JSON', exact: true }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('simpul-missing-telemetry-0000005c.replay.json')
  const path = await download.path()
  expect(path).not.toBeNull()
  const replay = JSON.parse(await readFile(path!, 'utf8')) as {
    schema: string
    traceType: string
    notice: string
    run: { id: string; scenarioId: string; seed: number; events: Array<{ index: number }> }
  }

  expect(replay.schema).toBe('simpul.replay.v1')
  expect(replay.traceType).toBe('deterministic-reference')
  expect(replay.notice).toContain('No live model inference')
  expect(replay.run).toMatchObject({ id: 'simpul-missing-telemetry-0000005c', scenarioId: 'missing-telemetry', seed: 92 })
  expect(replay.run.events.map(event => event.index)).toEqual(replay.run.events.map((_, index) => index))
  expect(replay.run.events.length).toBeGreaterThan(5)
})

test('mobile layout, topology keyboard inspection and focus remain usable', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/simpul')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)

  const node = page.getByRole('button', { name: /^JKT-A/ })
  await node.focus()
  await expect(node).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByLabel('Network selection inspector', { exact: true }).getByRole('heading', { name: 'JKT-A', exact: true })).toBeVisible()
  await expect(node).toHaveAttribute('aria-pressed', 'true')

  await createScenario(page, 'missing-telemetry', 15)
  const link = page.getByRole('button', { name: /^CS-07,/ })
  await link.focus()
  await page.keyboard.press('Space')
  const inspector = page.getByLabel('Network selection inspector', { exact: true })
  await expect(inspector).toContainText('unknown')
  await expect(inspector).toContainText('Not observed')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
})

test('responsive recorder keeps review anchors reachable and labels its internal map scroller', async ({ page }) => {
  await page.goto('/simpul')
  for (const width of [320, 375, 640, 768, 896]) {
    await page.setViewportSize({ width, height: 812 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), `page overflow at ${width}px`).toBe(true)
    await expect(page.getByRole('navigation', { name: 'Recorder sections', exact: true })).toBeVisible()
    const scrollHint = page.getByText('Wide map: scroll horizontally to inspect every synthetic node, link and service.', { exact: true })
    if (width <= 640) {
      await expect(scrollHint).toBeVisible()
      await expect(page.getByRole('region', { name: 'Scrollable synthetic network topology', exact: true })).toBeVisible()
    } else {
      await expect(scrollHint).toBeHidden()
    }
  }

  await page.getByRole('navigation', { name: 'Recorder sections', exact: true }).getByRole('link', { name: 'Policy gate', exact: true }).click()
  await expect(page).toHaveURL(/#policy-gate$/)
  await expect(page.getByRole('heading', { name: 'Policy gate', exact: true })).toBeVisible()
})

test('reduced motion suppresses replay-state transitions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/simpul')
  await page.getByRole('button', { name: 'Review from start', exact: true }).click()
  await page.getByRole('button', { name: 'Seek Proposal review stage', exact: true }).click()
  await expect.poll(() => page.evaluate(() => document.getAnimations().filter(animation => animation.playState === 'running').length)).toBe(0)
})

for (const viewport of [{ name: 'desktop', width: 1440, height: 1000 }, { name: 'mobile', width: 375, height: 812 }]) {
  test(`SIMPUL has no serious or critical ${viewport.name} accessibility violations`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/simpul')
    await expect(page.locator('[data-simpul]')).toBeVisible()
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    const seriousViolations = violations
      .filter(violation => violation.impact === 'serious' || violation.impact === 'critical')
      .map(violation => ({ id: violation.id, targets: violation.nodes.map(node => node.target) }))
    expect(seriousViolations).toEqual([])
  })
}
