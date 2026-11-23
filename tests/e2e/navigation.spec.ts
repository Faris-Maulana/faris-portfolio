import { expect, test } from '@playwright/test'

const navItems = ['Leadership', 'Work', 'Experience', 'Research', 'Credentials', 'Contact']
const caseStudies = ['text2sql', 'rag-eval'] as const

test('homepage exposes the expected landmarks, navigation, and project links', async ({ page }) => {
  await page.goto('/')

  const main = page.locator('#main')
  await expect(main).toBeVisible()
  await expect(main.getByRole('heading', { level: 1 })).toContainText(/Faris Maulana/i)

  const skipLink = page.getByRole('link', { name: 'Skip to content', exact: true })
  await expect(skipLink).toHaveAttribute('href', '#main')
  await page.keyboard.press('Tab')
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

  for (const slug of caseStudies) {
    await expect(main.locator(`a[href="/work/${slug}"]`).first()).toBeVisible()
  }
  await expect(page.getByRole('button', { name: /^(?:Open|Close) menu$/ })).toBeHidden()
})

test('mobile menu closes with Escape and restores focus to its launcher', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')

  const menuButton = page.getByRole('button', { name: /^(?:Open|Close) menu$/ })
  await expect(menuButton).toHaveAccessibleName('Open menu')
  await expect(page.locator('header a[href="/cv/Faris_Maulana_CV.pdf"]').first()).toBeHidden()
  await menuButton.focus()
  await page.keyboard.press('Enter')

  const dialog = page.getByRole('dialog', { name: 'Site navigation', exact: true })
  await expect(dialog).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(menuButton).toHaveAccessibleName('Open menu')
  await expect(menuButton).toBeFocused()
})

for (const slug of caseStudies) {
  test(`${slug} case study can be opened and left through its back link`, async ({ page }) => {
    await page.goto('/')
    await page.locator(`#main a[href="/work/${slug}"]`).first().click()

    await expect(page).toHaveURL(new RegExp(`/work/${slug}/?$`))
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const backLink = page.getByRole('link', { name: /^Back\b/i }).first()
    await expect(backLink).toBeVisible()
    await backLink.click()

    await expect(page).toHaveURL(/\/(?:#work)?$/)
    await expect(page.locator('#main')).toBeVisible()
  })
}
