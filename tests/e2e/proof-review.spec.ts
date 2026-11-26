import { expect, test } from '@playwright/test'
import { CASE_STUDIES } from '../../src/lib/constants'

test('hero puts the synthetic flagship and its evidence boundary in the first decision path', async ({ page }) => {
  await page.goto('/')
  const hero = page.locator('#hero')

  await expect(hero.getByRole('link', { name: 'Run SIMPUL reference', exact: true })).toHaveAttribute('href', '/simpul')
  await expect(hero.getByRole('link', { name: 'Read flagship boundaries', exact: true })).toHaveAttribute('href', '/work/simpul')
  await expect(hero.getByLabel('Infrastructure context and flagship evidence', { exact: true })).toContainText('Interactive browser run')
  await expect(hero.getByLabel('Infrastructure context and flagship evidence', { exact: true })).toContainText('Synthetic only')
  await expect(hero.getByLabel('Infrastructure context and flagship evidence', { exact: true })).toContainText('No production connection')
  await expect(hero.getByRole('list', { name: 'AI engineering operating contract', exact: true })).toBeVisible()
})

test('case study exposes its evidence front door, structured metadata and contextual conversion', async ({ page }) => {
  await page.goto('/work/rag-eval')

  await expect(page.locator('dl').filter({ hasText: 'Strongest public proof' })).toContainText('Committed results')
  await expect(page.locator('dl').filter({ hasText: 'Data exposure' }).first()).toContainText('Public')
  await expect(page.getByRole('navigation', { name: 'On this page', exact: true })).toBeVisible()
  await page.getByRole('link', { name: 'Inspect the public evidence', exact: true }).click()
  await expect(page).toHaveURL(/#evidence$/)
  await expect(page.getByRole('heading', { name: /Inspect the artifact/i })).toBeVisible()

  const jsonLdScripts = await page.locator('script[type="application/ld+json"]').allTextContents()
  const jsonLd = jsonLdScripts.find(script => script.includes('TechArticle'))
  expect(jsonLd).toBeDefined()
  const structured = JSON.parse(jsonLd!) as {
    '@type': string
    headline: string
    mainEntityOfPage: string
    citation: string[]
  }
  expect(structured['@type']).toBe('TechArticle')
  expect(structured.headline).toContain('RAG')
  expect(structured.mainEntityOfPage).toMatch(/\/work\/rag-eval$/)
  expect(structured.citation.length).toBeGreaterThan(0)
  expect(structured.citation.every(url => url.startsWith('https://'))).toBe(true)
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article')
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute('content', 'Faris Maulana, AI Engineering Manager')

  await expect(page.getByRole('heading', { name: /Discuss the control model behind/i })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Discuss this system', exact: true })).toHaveAttribute('href', '/#contact')
  await expect(page.getByRole('link', { name: 'Email the brief', exact: true })).toHaveAttribute('href', /mailto:.*subject=Architecture%20review/)
})

test('instrumented document CTAs still start the actual PDF downloads', async ({ page, request }) => {
  for (const path of ['/cv/Faris_Maulana_CV.pdf', '/cv/Faris_Maulana_Quantitative_Portfolio.pdf']) {
    const response = await request.get(path)
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('application/pdf')
    expect((await response.body()).subarray(0, 4).toString()).toBe('%PDF')
  }

  await page.goto('/')
  const cvDownload = page.waitForEvent('download')
  await page.locator('#hero').getByRole('link', { name: 'Executive CV', exact: true }).click()
  expect((await cvDownload).suggestedFilename()).toBe('Faris_Maulana_CV.pdf')

  const quantDownload = page.waitForEvent('download')
  await page.getByRole('link', { name: 'Download quantitative methods and evidence boundaries', exact: true }).click()
  expect((await quantDownload).suggestedFilename()).toBe('Faris_Maulana_Quantitative_Portfolio.pdf')
})

test('every case study preserves narrow-screen reachability and wide-screen layout', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 812 })
  for (const study of CASE_STUDIES) {
    await page.goto(`/work/${study.id}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'On this page', exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Discuss this system', exact: true })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), `case overflow at 320px: ${study.id}`).toBe(true)
  }

  await page.setViewportSize({ width: 1920, height: 1080 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/work/rag-eval')
  const stickyNavigation = page.getByRole('navigation', { name: 'On this page', exact: true })
  await expect(stickyNavigation).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), 'case overflow at 1920px').toBe(true)
  const stickyContract = await stickyNavigation.evaluate(node => {
    const ancestors = []
    let ancestor = node.parentElement
    while (ancestor) {
      const style = getComputedStyle(ancestor)
      if (['hidden', 'auto', 'scroll'].includes(style.overflowX) || ['hidden', 'auto', 'scroll'].includes(style.overflowY)) {
        ancestors.push(`${ancestor.tagName}.${ancestor.className}`)
      }
      ancestor = ancestor.parentElement
    }
    return { ancestors, position: getComputedStyle(node).position }
  })
  expect(stickyContract.position).toBe('sticky')
  expect(stickyContract.ancestors).toEqual([])
  await page.evaluate(() => window.scrollTo({ top: 1000, behavior: 'instant' }))
  await expect.poll(() => stickyNavigation.evaluate(node => Math.round(node.getBoundingClientRect().top))).toBe(92)
})

test('contact prompts frame context, constraints and the decision without changing the form contract', async ({ page }) => {
  await page.goto('/#contact')
  const prompts = page.locator('.contact-brief')
  await expect(prompts).toContainText('System context')
  await expect(prompts).toContainText('Constraint')
  await expect(prompts).toContainText('Decision needed')
  await expect(page.getByRole('button', { name: 'Send message', exact: true })).toBeVisible()
})
