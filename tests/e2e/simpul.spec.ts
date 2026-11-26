import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { readFile } from 'node:fs/promises'

async function createScenario(page: import('@playwright/test').Page, scenarioId: string, seed?: number) {
  const scenario = page.getByRole('combobox', { name: 'Scenario', exact: true })
  await scenario.selectOption(scenarioId)
  if (seed !== undefined) await page.getByRole('spinbutton', { name: 'Seed', exact: true }).fill(String(seed))
  await page.getByRole('button', { name: 'Create deterministic run', exact: true }).click()
}

async function inspectSimpulControls(page: Page) {
  return page.locator('[data-simpul]').evaluate(root => {
    const controls = [...root.querySelectorAll<HTMLElement>('button, input, select, summary, a[href]')]
      .filter(node => {
        const rect = node.getBoundingClientRect()
        const style = getComputedStyle(node)
        if (rect.width <= 0 || rect.height <= 0 || style.visibility === 'hidden' || style.display === 'none') return false
        let ancestor = node.parentElement
        while (ancestor) {
          const ancestorStyle = getComputedStyle(ancestor)
          const clipsX = ['hidden', 'auto', 'scroll', 'clip'].includes(ancestorStyle.overflowX)
          const clipsY = ['hidden', 'auto', 'scroll', 'clip'].includes(ancestorStyle.overflowY)
          if (clipsX || clipsY) {
            const clip = ancestor.getBoundingClientRect()
            if ((clipsX && (rect.right <= clip.left || rect.left >= clip.right)) ||
                (clipsY && (rect.bottom <= clip.top || rect.top >= clip.bottom))) return false
          }
          ancestor = ancestor.parentElement
        }
        return true
      })
    const boxes = controls.map(node => ({
      name: node.getAttribute('aria-label') ?? node.textContent?.trim() ?? node.tagName,
      ...node.getBoundingClientRect().toJSON(),
    }))
    const undersized = boxes.filter(box => box.width < 44 || box.height < 44)
    const overlaps: string[] = []
    for (let first = 0; first < boxes.length; first += 1) {
      for (let second = first + 1; second < boxes.length; second += 1) {
        const a = boxes[first]
        const b = boxes[second]
        const overlapX = Math.min(a.right, b.right) - Math.max(a.left, b.left)
        const overlapY = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
        if (overlapX > 1 && overlapY > 1) overlaps.push(`${a.name} / ${b.name}`)
      }
    }
    return { boxes, overlaps, undersized }
  })
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

test('scenario presets, native seed validation and public-data boundaries stay visible', async ({ page }) => {
  await page.goto('/simpul')
  await expect(page.getByText(/No live model, production telemetry, production control, sign up or API key/)).toBeVisible()
  await expect(page.getByText(/No external simulator or service, model provider, production telemetry or production-control request is connected/)).toBeVisible()
  await expect(page.getByText(/Run and replay-export analytics record only scenario identifiers; shared navigation and assistant controls emit separate, privacy-bounded interaction counts/)).toBeVisible()
  await expect(page.getByLabel('Method and evaluation scope', { exact: true })).toContainText('Baseline comparisons and model quality scores are excluded')

  await createScenario(page, 'progressive-degradation', 71)
  await expect(page.getByRole('heading', { name: 'Progressive attenuation and OSNR degradation', exact: true })).toBeVisible()
  await createScenario(page, 'prompt-injection', 72)
  await expect(page.getByRole('heading', { name: 'Indirect prompt injection in a ticket and runbook', exact: true })).toBeVisible()
  await expect(page.getByText('Untrusted data. Display only, never instructions or authority.', { exact: true })).toBeVisible()

  const seed = page.getByRole('spinbutton', { name: 'Seed', exact: true })
  await seed.fill('0')
  await page.getByRole('button', { name: 'Create deterministic run', exact: true }).click()
  expect(await seed.evaluate(node => (node as HTMLInputElement).validity.rangeUnderflow)).toBe(true)
  await expect(page.getByRole('heading', { name: 'Indirect prompt injection in a ticket and runbook', exact: true })).toBeVisible()
  await seed.fill('1.5')
  await page.getByRole('button', { name: 'Create deterministic run', exact: true }).click()
  expect(await seed.evaluate(node => (node as HTMLInputElement).validity.stepMismatch)).toBe(true)
  await expect(page.locator('[data-simpul]').getByRole('alert')).toHaveCount(0)
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

  await page.getByRole('list', { name: 'Recorded events', exact: true }).getByRole('button').nth(2).click()
  await expect(cursor).toHaveText('Event 3 of 8')
  await slider.focus()
  await page.keyboard.press('End')
  await expect(cursor).toHaveText('Event 8 of 8')
  await expect(next).toBeDisabled()

  await page.getByRole('button', { name: 'Play replay', exact: true }).click()
  await expect(cursor).toHaveText('Event 1 of 8')
  await page.getByRole('button', { name: 'Pause replay', exact: true }).click()
  await slider.focus()
  await page.keyboard.press('End')
  await page.keyboard.press('ArrowLeft')
  await expect(cursor).toHaveText('Event 7 of 8')
  await page.getByRole('button', { name: 'Play replay', exact: true }).click()
  await expect(cursor).toHaveText('Event 8 of 8', { timeout: 1500 })
  await expect(page.getByRole('button', { name: 'Play replay', exact: true })).toBeVisible()
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

  await review.getByRole('button', { name: 'Seek Evidence review stage', exact: true }).click()
  await expect(review).toContainText('assessment.recorded')
  await review.getByRole('button', { name: 'Seek Policy review stage', exact: true }).click()
  await expect(review).toContainText('policy.evaluated')
  await review.getByRole('button', { name: 'Seek Incident review stage', exact: true }).click()
  await expect(review).toContainText('incident.detected')
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

  for (const [artifact, code] of [['maint-wrong-target', 'approval-target-mismatch'], ['maint-wrong-action', 'approval-action-mismatch']] as const) {
    await page.getByRole('button', { name: 'Return to parent run', exact: true }).click()
    await page.getByRole('combobox', { name: 'Approval artifact', exact: true }).selectOption(artifact)
    await page.getByRole('button', { name: 'Approve and branch', exact: true }).click()
    await expect(page.getByText(code, { exact: true })).toBeVisible()
  }

  await page.getByRole('button', { name: 'Return to parent run', exact: true }).click()
  await page.getByRole('combobox', { name: 'Approval artifact', exact: true }).selectOption('maint-valid')
  await page.getByRole('button', { name: 'Approve and branch', exact: true }).click()
  await expect(page.getByText('Bounded synthetic action applied', { exact: true })).toBeVisible()
  const branchDownload = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export replay JSON', exact: true }).click()
  const download = await branchDownload
  const path = await download.path()
  const replay = JSON.parse(await readFile(path!, 'utf8')) as { run: { parent?: { runId: string } } }
  expect(replay.run.parent?.runId).toBe(originalId)
})

test('evidence records and both immutable schema disclosures are inspectable', async ({ page }) => {
  await page.goto('/simpul')
  await createScenario(page, 'prompt-injection', 72)
  const evidence = page.getByLabel('Evidence available at this cursor', { exact: true }).getByRole('button')
  expect(await evidence.count()).toBeGreaterThan(1)
  const initialDetail = await page.locator('[aria-label^="Evidence detail:"]').getAttribute('aria-label')
  await evidence.first().click()
  await expect(evidence.first()).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('[aria-label^="Evidence detail:"]')).not.toHaveAttribute('aria-label', initialDetail!)
  await expect(page.getByText('Untrusted data. Display only, never instructions or authority.', { exact: true })).toBeVisible()
  await evidence.last().click()
  await expect(evidence.last()).toHaveAttribute('aria-pressed', 'true')

  for (const name of ['Inspect immutable event payload', 'Inspect tool input schema'] as const) {
    const summary = page.getByText(name, { exact: true })
    await summary.click()
    const details = summary.locator('..')
    await expect(details).toHaveAttribute('open', '')
    await expect(details.locator('pre')).toBeVisible()
    await expect(details.locator('pre')).not.toBeEmpty()
  }

  await page.getByRole('button', { name: 'Restart replay', exact: true }).click()
  await expect(page.getByText('No decision at this cursor', { exact: true })).toBeVisible()
  await expect(page.getByText('No evidence at this cursor', { exact: true })).toBeVisible()
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
    const scroller = page.getByRole('region', { name: 'Scrollable synthetic network topology', exact: true })
    await expect(scrollHint).toBeVisible()
    await expect(scroller).toBeVisible()
    expect(await scroller.evaluate(node => node.scrollWidth > node.clientWidth), `map scroller is reachable at ${width}px`).toBe(true)
  }

  const sections = page.getByRole('navigation', { name: 'Recorder sections', exact: true })
  for (const [name, id] of [['Current event', 'current-event'], ['Topology', 'network-topology'], ['Evidence', 'evidence-rail'], ['Policy gate', 'policy-gate']] as const) {
    await sections.getByRole('link', { name, exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`#${id}$`))
    await expect(page.locator(`#${id}`)).toBeVisible()
  }
  await page.getByRole('link', { name: 'Portfolio', exact: true }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.locator('#main')).toBeVisible()
})

test.describe('360px touch layout', () => {
  test.use({ hasTouch: true, viewport: { width: 360, height: 800 } })

  test('controls stay separated, touch-sized and reachable inside intentional scrollers', async ({ page }) => {
    await page.goto('/simpul')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
    const geometry = await inspectSimpulControls(page)
    expect(geometry.boxes.length).toBeGreaterThan(25)
    expect(geometry.undersized).toEqual([])
    expect(geometry.overlaps).toEqual([])

    const reviewStages = page.getByRole('list', { name: 'Incident review stages', exact: true }).getByRole('button')
    await reviewStages.first().tap()
    await expect(reviewStages.first()).toHaveAttribute('aria-current', 'step')
    await reviewStages.last().tap()
    await expect(reviewStages.last()).toHaveAttribute('aria-current', 'step')

    const topology = page.getByRole('region', { name: 'Scrollable synthetic network topology', exact: true })
    await topology.evaluate(node => { node.scrollLeft = 0 })
    expect(await topology.evaluate(node => node.scrollLeft)).toBe(0)
    await topology.evaluate(node => { node.scrollLeft = node.scrollWidth })
    expect(await topology.evaluate(node => Math.ceil(node.scrollLeft + node.clientWidth))).toBeGreaterThanOrEqual(await topology.evaluate(node => node.scrollWidth))
  })
})

test('ultrawide controls keep 44px targets, separation and untransformed hit size', async ({ page }) => {
  await page.setViewportSize({ width: 3440, height: 1200 })
  await page.goto('/simpul')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)

  const geometry = await inspectSimpulControls(page)
  expect(geometry.boxes.length).toBeGreaterThan(25)
  expect(geometry.undersized).toEqual([])
  expect(geometry.overlaps).toEqual([])

  const restart = page.getByRole('button', { name: 'Restart replay', exact: true })
  const resting = await restart.boundingBox()
  await restart.hover()
  await page.mouse.down()
  const pressed = await restart.boundingBox()
  await page.mouse.up()
  expect(pressed?.width).toBe(resting?.width)
  expect(pressed?.height).toBe(resting?.height)
  expect(pressed?.width).toBeGreaterThanOrEqual(44)
  expect(pressed?.height).toBeGreaterThanOrEqual(44)
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
