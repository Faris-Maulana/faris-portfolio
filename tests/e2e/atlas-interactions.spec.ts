import { expect, test } from '@playwright/test'
import { ATLAS_ROUTE_COUNT, ATLAS_ROUTE_PATH } from '../../src/data/infrastructure-atlas'

const INITIAL_TRANSFORM = 'translate(0 0) scale(1)'

for (const width of [320, 375, 1440]) {
  test(`atlas controls stay usable without overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    const atlas = page.locator('.atlas-figure')
    await expect(atlas.locator('.atlas-routes')).toHaveAttribute('data-route-count', String(ATLAS_ROUTE_COUNT))
    expect(await atlas.locator('.atlas-routes').getAttribute('d')).toBe(ATLAS_ROUTE_PATH)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)

    const controls = atlas.getByRole('group', { name: 'Map navigation controls' })
    await controls.scrollIntoViewIfNeeded()
    const bounds = await controls.boundingBox()
    const atlasBounds = await atlas.locator('.atlas-map-canvas').boundingBox()
    expect(bounds).not.toBeNull()
    expect(atlasBounds).not.toBeNull()
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(atlasBounds!.x + atlasBounds!.width)
    for (const button of await controls.getByRole('button').all()) {
      expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44)
    }
  })
}

test('atlas keyboard navigation and buttons preserve pan and zoom boundaries', async ({ page }) => {
  await page.goto('/')
  const map = page.locator('.atlas-map-svg')
  const transform = page.locator('.atlas-geometry')
  const zoom = page.locator('.atlas-zoom-level')
  const zoomIn = page.getByRole('button', { name: 'Zoom in', exact: true })
  const zoomOut = page.getByRole('button', { name: 'Zoom out', exact: true })
  const reset = page.getByRole('button', { name: 'Reset map view', exact: true })

  await expect(map).toBeVisible()
  await expect(transform).toHaveAttribute('transform', INITIAL_TRANSFORM)
  await expect(zoomOut).toBeDisabled()
  await expect(reset).toBeDisabled()

  await map.focus()
  await page.keyboard.press('+')
  await expect(zoom).toHaveText('150%')
  await page.keyboard.press('ArrowRight')
  await expect(transform).not.toHaveAttribute('transform', 'translate(-240 -144) scale(1.5)')
  await page.keyboard.press('0')
  await expect(transform).toHaveAttribute('transform', INITIAL_TRANSFORM)

  await zoomIn.click()
  await expect(zoom).toHaveText('150%')
  const mapBounds = await map.boundingBox()
  await page.mouse.move(mapBounds!.x + mapBounds!.width / 2, mapBounds!.y + mapBounds!.height / 2)
  await page.mouse.down()
  await page.mouse.move(mapBounds!.x + mapBounds!.width / 2 + 60, mapBounds!.y + mapBounds!.height / 2 + 20, { steps: 4 })
  await page.mouse.up()
  const panned = await transform.getAttribute('transform')
  expect(panned).not.toBe('translate(-240 -144) scale(1.5)')

  await reset.click()
  await expect(transform).toHaveAttribute('transform', INITIAL_TRANSFORM)
  for (let index = 0; index < 8 && await zoomIn.isEnabled(); index += 1) await zoomIn.click()
  await expect(zoom).toHaveText('800%')
  await expect(zoomIn).toBeDisabled()
  for (let index = 0; index < 16 && await zoomOut.isEnabled(); index += 1) await zoomOut.click()
  await expect(zoom).toHaveText('100%')
  await expect(transform).toHaveAttribute('transform', INITIAL_TRANSFORM)
  await expect(zoomOut).toBeDisabled()
})

test('expanded atlas is modal, keyboard accessible, and restores launcher focus', async ({ page, browserName }) => {
  await page.goto('/')
  const launcher = page.getByRole('button', { name: 'Expand infrastructure map', exact: true })
  await launcher.click()
  const dialog = page.getByRole('dialog', { name: 'Expanded infrastructure map', exact: true })
  const map = dialog.locator('.atlas-map-svg')
  await expect(dialog).toBeVisible()
  await expect(dialog).toHaveAttribute('open', '')
  await expect(page.locator('.atlas-figure')).toHaveCount(1)
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('hidden')
  await map.focus()
  await page.keyboard.press('=')
  await expect(dialog.locator('.atlas-zoom-level')).toHaveText('150%')
  const tabKey = browserName === 'webkit' ? 'Alt+Tab' : 'Tab'
  for (let index = 0; index < 10; index += 1) {
    await page.keyboard.press(tabKey)
    await expect.poll(() => page.evaluate(() => document.querySelector('.atlas-explorer-dialog')?.contains(document.activeElement))).toBe(true)
  }
  await map.focus()
  await page.keyboard.press(browserName === 'webkit' ? 'Alt+Shift+Tab' : 'Shift+Tab')
  await expect(dialog.getByRole('button', { name: 'Close expanded map', exact: true })).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(launcher).toBeFocused()
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).not.toBe('hidden')
  await expect(page.locator('.atlas-figure')).toHaveCount(1)
})

test('touch gestures support pinch zoom, one-finger pan, and control reset', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Multi-touch dispatch uses the Chromium DevTools Protocol.')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const map = page.locator('.atlas-map-svg')
  const transform = page.locator('.atlas-geometry')
  const zoom = page.locator('.atlas-zoom-level')
  await map.scrollIntoViewIfNeeded()
  const box = await map.boundingBox()
  const client = await page.context().newCDPSession(page)
  const x = box!.x + box!.width / 2
  const y = box!.y + box!.height / 2

  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x - 20, y, id: 1 }, { x: x + 20, y, id: 2 }] })
  await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - 65, y, id: 1 }, { x: x + 65, y, id: 2 }] })
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await expect.poll(async () => Number.parseInt((await zoom.textContent()) ?? '0', 10)).toBeGreaterThan(200)

  await page.getByRole('button', { name: 'Reset map view', exact: true }).click()
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click()
  await expect(zoom).toHaveText('150%')
  const panBox = await map.boundingBox()
  const panX = panBox!.x + panBox!.width / 2
  const panY = panBox!.y + panBox!.height / 2
  const beforePan = await transform.getAttribute('transform')
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: panX, y: panY, id: 1 }] })
  await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: panX + 40, y: panY + 20, id: 1 }] })
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await expect(transform).not.toHaveAttribute('transform', beforePan ?? '')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
})
