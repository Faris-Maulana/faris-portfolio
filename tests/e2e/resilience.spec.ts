import { expect, test } from '@playwright/test'

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('primary content and case-study links remain visible', async ({ page }) => {
    await page.goto('/')

    const main = page.locator('#main')
    await expect(main).toBeVisible()
    await expect(main.getByRole('heading', { level: 1 })).toContainText(/Faris Maulana/i)
    await expect(main.locator('a[href="/work/text2sql"]').first()).toBeVisible()
  })
})

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('content remains visible and nonessential animations do not run', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#main').getByRole('heading', { level: 1 })).toBeVisible()
    expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true)

    await expect.poll(() => page.evaluate(() =>
      document.getAnimations().filter(animation => animation.playState === 'running').length,
    )).toBe(0)
  })
})

test('desktop hero headline does not collide with the infrastructure atlas', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  for (const width of [1024, 1280, 1440, 1600, 1920]) {
    await page.setViewportSize({ width, height: 1100 })
    await page.evaluate(() => document.fonts.ready)
    const metrics = await page.evaluate(() => {
      const walker = document.createTreeWalker(document.querySelector('h1')!, NodeFilter.SHOW_TEXT)
      let headlineRight = 0
      while (walker.nextNode()) {
        if (walker.currentNode.textContent?.trim() !== 'Accountable') continue
        const range = document.createRange()
        range.selectNodeContents(walker.currentNode)
        headlineRight = range.getBoundingClientRect().right
      }
      const atlasBox = document.querySelector('.atlas-figure')!.getBoundingClientRect()
      return {
        desktopGrid: matchMedia('(min-width: 64rem)').matches,
        headlineRight,
        headlineBottom: document.querySelector('h1')!.getBoundingClientRect().bottom,
        atlasLeft: atlasBox.left,
        atlasTop: atlasBox.top,
      }
    })
    if (metrics.desktopGrid) {
      expect(metrics.headlineRight, `headline collision at ${width}px`).toBeLessThanOrEqual(metrics.atlasLeft)
    } else {
      // Classic scrollbars can reduce the CSS viewport below the requested window width.
      expect(metrics.headlineBottom, `stacked hero collision at ${width}px`).toBeLessThanOrEqual(metrics.atlasTop)
    }
  }
})

for (const width of [320, 375]) {
  test(`homepage has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await expect(page.locator('#main')).toBeVisible()

    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
    }))
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport)

    const headlineText = await page.locator('h1').evaluate(h1 => {
      const walker = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT)
      const boxes = []
      while (walker.nextNode()) {
        const node = walker.currentNode
        if (!node.textContent?.trim()) continue
        const range = document.createRange()
        range.selectNodeContents(node)
        const box = range.getBoundingClientRect()
        boxes.push({ text: node.textContent.trim(), left: box.left, right: box.right })
      }
      return boxes
    })
    for (const box of headlineText) {
      expect(box.left, `left edge of ${box.text}`).toBeGreaterThanOrEqual(0)
      expect(box.right, `right edge of ${box.text}`).toBeLessThanOrEqual(width)
    }
  })
}
