import { expect, test } from '@playwright/test'

test('evidence index filters real supporting cases without hiding the flagship', async ({ page }) => {
  await page.goto('/')
  const index = page.locator('.case-index')
  const controls = index.getByRole('group', { name: 'Filter supporting case studies by evidence type' })

  await controls.getByRole('button', { name: 'Interactive runs', exact: true }).click()
  await expect(controls.getByRole('button', { name: 'Interactive runs', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(index.getByRole('status')).toContainText('Showing 1 of 6 supporting cases')
  await expect(index.locator('#wealth-advisor')).toBeVisible()
  await expect(index.locator('#rag-eval')).toBeHidden()
  await expect(page.getByRole('link', { name: 'Open proving ground', exact: true })).toBeVisible()

  await controls.getByRole('button', { name: 'Test and result artifacts', exact: true }).click()
  await expect(index.getByRole('status')).toContainText('Showing 3 of 6 supporting cases')
  for (const id of ['wealth-advisor', 'ottodot', 'rag-eval']) {
    await expect(index.locator(`#${id}`)).toBeVisible()
    await expect(index.locator(`#${id}`).getByRole('link', { name: 'Inspect evidence and limits' })).toHaveAttribute('href', `/work/${id}`)
  }
  await expect(index.locator('#text2sql')).toBeHidden()

  await controls.getByRole('button', { name: 'Private-data boundaries', exact: true }).click()
  await expect(index.getByRole('status')).toContainText('Showing 3 of 6 supporting cases')
  for (const id of ['text2sql', 'noc-agent', 'appraisal']) await expect(index.locator(`#${id}`)).toBeVisible()

  await controls.getByRole('button', { name: 'All cases', exact: true }).click()
  await expect(index.getByRole('status')).toContainText('Showing 6 of 6 supporting cases')
})

test('evidence index remains usable at mobile width without page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 })
  await page.goto('/')
  const controls = page.getByRole('group', { name: 'Filter supporting case studies by evidence type' })
  await controls.getByRole('button', { name: 'Private-data boundaries', exact: true }).click()
  await expect(page.locator('.case-index').getByRole('status')).toContainText('Showing 3 of 6')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
})

test('every supporting case remains in the initial no-JavaScript evidence index', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('/')
  for (const id of ['wealth-advisor', 'ottodot', 'rag-eval', 'text2sql', 'noc-agent', 'appraisal']) {
    await expect(page.locator(`.case-index #${id}`)).toBeVisible()
  }
  await context.close()
})
