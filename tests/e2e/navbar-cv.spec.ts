import { expect, test } from '@playwright/test'

const routes = [
  { name: 'SIMPUL reference', path: '/simpul' },
  { name: 'case study', path: '/work/simpul' },
] as const

for (const width of [1024, 1280]) {
  for (const route of routes) {
    test(`CV action fits the header on the ${route.name} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(route.path)

      const desktopGrid = await page.evaluate(() => matchMedia('(min-width: 64rem)').matches)
      if (desktopGrid) {
        const cvLink = page.getByRole('link', { name: 'CV', exact: true })
        await expect(cvLink).toBeVisible()
        await expect(cvLink).toHaveAttribute('href', '/cv/Faris_Maulana_CV.pdf')

        const navBox = await page.getByRole('navigation', { name: 'Primary navigation', exact: true }).boundingBox()
        const cvBox = await cvLink.boundingBox()
        expect(navBox).not.toBeNull()
        expect(cvBox).not.toBeNull()
        expect(cvBox!.x).toBeGreaterThanOrEqual(navBox!.x + navBox!.width)
        expect(cvBox!.x + cvBox!.width).toBeLessThanOrEqual(width)
      } else {
        // WebKit's classic scrollbar can make a 1024px window a sub-lg CSS viewport.
        const menuButton = page.getByRole('button', { name: 'Open menu', exact: true })
        await expect(menuButton).toBeVisible()
        await menuButton.click()
        const cvLink = page.getByRole('link', { name: 'Download executive CV', exact: true })
        await expect(cvLink).toBeVisible()
        await expect(cvLink).toHaveAttribute('href', '/cv/Faris_Maulana_CV.pdf')
        await expect.poll(async () => (await cvLink.boundingBox())?.x ?? -1).toBeGreaterThanOrEqual(0)
        await expect.poll(async () => {
          const box = await cvLink.boundingBox()
          return box ? box.x + box.width : Number.POSITIVE_INFINITY
        }).toBeLessThanOrEqual(await page.evaluate(() => document.documentElement.clientWidth))
        await page.keyboard.press('Escape')
        await expect(page.getByRole('dialog', { name: 'Site navigation', exact: true })).toBeHidden()
        await expect(menuButton).toBeFocused()
      }

      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
        `page overflow at ${width}px`,
      ).toBe(true)
    })
  }
}
