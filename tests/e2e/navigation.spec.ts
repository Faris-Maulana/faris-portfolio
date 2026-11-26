import { expect, test } from '@playwright/test'

const navItems = ['Work', 'SIMPUL', 'Leadership', 'Experience', 'Research', 'Credentials', 'Contact']
const caseStudies = ['simpul', 'wealth-advisor', 'ottodot', 'rag-eval', 'text2sql', 'noc-agent', 'appraisal'] as const

test('homepage exposes the expected landmarks, navigation, and project links', async ({ page, browserName }) => {
  await page.goto('/')

  const main = page.locator('#main')
  await expect(main).toBeVisible()
  await expect(main.getByRole('heading', { level: 1 })).toContainText(/Faris Maulana/i)

  const skipLink = page.getByRole('link', { name: 'Skip to content', exact: true })
  await expect(skipLink).toHaveAttribute('href', '#main')
  // Safari's complete keyboard traversal uses Option+Tab by default.
  await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab')
  await expect(skipLink).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#main$/)

  const nav = page
    .getByRole('navigation')
    .filter({ has: page.getByRole('link', { name: 'Leadership', exact: true }) })
    .first()
  await expect(nav).toBeVisible()
  for (const name of navItems) {
    await expect(nav.getByRole('link', { name, exact: true })).toBeVisible()
  }
  await expect(page.getByRole('navigation', { name: 'Footer navigation' }).getByRole('link', { name: 'SIMPUL', exact: true })).toHaveAttribute('href', '/simpul')

  for (const slug of caseStudies) {
    await expect(main.locator(`a[href="/work/${slug}"]`).first()).toBeVisible()
  }
  await expect(page.getByRole('button', { name: /^(?:Open|Close) menu$/ })).toBeHidden()
})

test('desktop navigation follows section links and scrolling with one current item', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')

  const nav = page.getByRole('navigation', { name: 'Primary navigation', exact: true })
  const current = nav.locator('a[aria-current]')
  const pill = page.locator('.nav-active-pill')
  const expectCurrent = async (name: string) => {
    await expect(current).toHaveCount(1)
    await expect(nav.getByRole('link', { name, exact: true })).toHaveAttribute('aria-current', 'location')
    await expect(pill).toHaveAttribute('data-visible', 'true')
  }

  for (const name of ['Work', 'Leadership', 'Experience', 'Research', 'Credentials', 'Contact']) {
    await nav.getByRole('link', { name, exact: true }).click()
    await expectCurrent(name)
  }

  await page.locator('#capabilities').evaluate(section => section.scrollIntoView({ behavior: 'instant', block: 'start' }))
  await expectCurrent('Research')
  await page.locator('#credentials').evaluate(section => section.scrollIntoView({ behavior: 'instant', block: 'start' }))
  await expectCurrent('Credentials')

  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
  await expect(current).toHaveCount(0)
  await expect(pill).toHaveAttribute('data-visible', 'false')

  await nav.getByRole('link', { name: 'Work', exact: true }).click()
  await expectCurrent('Work')
  await nav.getByRole('link', { name: 'SIMPUL', exact: true }).click()
  await expect(page).toHaveURL(/\/simpul\/?$/)
  await expect(current).toHaveCount(1)
  await expect(nav.getByRole('link', { name: 'SIMPUL', exact: true })).toHaveAttribute('aria-current', 'page')
  await expect(nav.locator('a[aria-current="location"]')).toHaveCount(0)
})

test('mobile menu closes with Escape and restores focus across responsive changes', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')

  const menuButton = page.getByRole('button', { name: /^(?:Open|Close) menu$/ })
  await expect(menuButton).toHaveAccessibleName('Open menu')
  await expect(page.locator('header a[href="/cv/Faris_Maulana_CV.pdf"]').first()).toBeHidden()
  await menuButton.focus()
  await page.keyboard.press('Enter')

  const dialog = page.getByRole('dialog', { name: 'Site navigation', exact: true })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Close menu', exact: true })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(menuButton).toHaveAccessibleName('Open menu')
  await expect(menuButton).toBeFocused()

  await page.keyboard.press('Enter')
  await expect(dialog).toBeVisible()
  await page.setViewportSize({ width: 1440, height: 900 })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Close menu', exact: true })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(page.getByRole('navigation', { name: 'Primary navigation', exact: true }).getByRole('link', { name: 'Work', exact: true })).toBeFocused()
})

test('leadership fragment and mobile navigation emit no autofocus or unused-preload warnings', async ({ page }) => {
  const warnings: string[] = []
  page.on('console', message => {
    if (/auto\s*focus|autofocus|preloaded using link preload but not used|preload.*unused|unused.*preload/i.test(message.text())) {
      warnings.push(message.text())
    }
  })
  await page.setViewportSize({ width: 375, height: 812 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#leadership')
  await expect(page.locator('#leadership')).toBeVisible()
  await expect(page.locator('#leadership')).toBeInViewport()

  const menuButton = page.getByRole('button', { name: 'Open menu', exact: true })
  await menuButton.click()
  const dialog = page.getByRole('dialog', { name: 'Site navigation', exact: true })
  await expect(dialog.getByRole('button', { name: 'Close menu', exact: true })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()

  // Chromium reports unused preloads a few seconds after the window load event.
  await page.waitForTimeout(5_000)
  expect(warnings).toEqual([])
})

for (const slug of caseStudies) {
  test(`${slug} case study can be opened and left through its back link`, async ({ page }) => {
    await page.goto('/')
    await page.locator(`#main a[href="/work/${slug}"]`).first().click()

    await expect(page).toHaveURL(new RegExp(`/work/${slug}/?$`))
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Inspect the artifact/i })).toBeVisible()
    const backLink = page.getByRole('link', { name: /^Back\b/i }).first()
    await expect(backLink).toBeVisible()
    await backLink.click()

    await expect(page).toHaveURL(/\/(?:#work)?$/)
    await expect(page.locator('#main')).toBeVisible()
  })
}
