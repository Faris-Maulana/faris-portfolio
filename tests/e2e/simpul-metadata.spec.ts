import { expect, test } from '@playwright/test'

const TITLE = 'SIMPUL, synthetic network flight recorder'
const DESCRIPTION = 'Replay deterministic synthetic fiber incidents, inspect evidence and branch policy decisions locally. No production network control or live model integration.'
const IMAGE_ALT = 'SIMPUL by Faris Maulana: local deterministic replay of synthetic fiber incidents, evidence inspection and policy branching.'

test('SIMPUL publishes route-specific social metadata and restrained parseable JSON-LD', async ({ page }) => {
  await page.goto('/simpul')

  const canonical = page.locator('head link[rel="canonical"]')
  await expect(canonical).toHaveAttribute('href', /\/simpul$/)
  const canonicalUrl = await canonical.getAttribute('href')
  expect(canonicalUrl).not.toBeNull()
  const simpulUrl = new URL(canonicalUrl!)
  expect(simpulUrl.pathname).toBe('/simpul')
  expect(simpulUrl.search).toBe('')
  expect(simpulUrl.hash).toBe('')
  const socialImageUrl = new URL('/opengraph-image', simpulUrl).toString()

  await expect(page).toHaveTitle(`${TITLE} · Faris Maulana`)
  await expect(page.locator('head meta[property="og:url"]')).toHaveAttribute('content', simpulUrl.toString())
  await expect(page.locator('head meta[property="og:type"]')).toHaveAttribute('content', 'website')
  await expect(page.locator('head meta[property="og:site_name"]')).toHaveAttribute('content', 'Faris Maulana')
  await expect(page.locator('head meta[property="og:title"]')).toHaveAttribute('content', TITLE)
  await expect(page.locator('head meta[property="og:description"]')).toHaveAttribute('content', DESCRIPTION)
  await expect(page.locator('head meta[property="og:image"]')).toHaveAttribute('content', socialImageUrl)
  await expect(page.locator('head meta[property="og:image:alt"]')).toHaveAttribute('content', IMAGE_ALT)
  await expect(page.locator('head meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image')
  await expect(page.locator('head meta[name="twitter:title"]')).toHaveAttribute('content', TITLE)
  await expect(page.locator('head meta[name="twitter:description"]')).toHaveAttribute('content', DESCRIPTION)
  await expect(page.locator('head meta[name="twitter:image"]')).toHaveAttribute('content', socialImageUrl)
  await expect(page.locator('head meta[name="twitter:image:alt"]')).toHaveAttribute('content', IMAGE_ALT)

  const sources = await page.locator('script[type="application/ld+json"]').evaluateAll(scripts => (
    scripts.map(script => script.textContent ?? '')
  ))
  const records = sources.map(source => JSON.parse(source) as Record<string, unknown>)
  const application = records.find(record => record['@type'] === 'SoftwareApplication' && record.name === 'SIMPUL')

  expect(application).toBeDefined()
  expect(application).toMatchObject({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SIMPUL',
    description: DESCRIPTION,
    url: simpulUrl.toString(),
    applicationCategory: 'DeveloperApplication',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
    author: { '@type': 'Person', name: 'Faris Maulana', url: simpulUrl.origin },
    featureList: [
      'Deterministic replay of synthetic fiber-network incidents',
      'Local event and evidence inspection',
      'Counterfactual policy-decision branching without production control',
      'Self-contained replay JSON export',
    ],
  })
  expect(application).not.toHaveProperty('aggregateRating')
  expect(application).not.toHaveProperty('review')
  expect(application).not.toHaveProperty('ratingValue')
  expect(application).not.toHaveProperty('interactionStatistic')
  for (const source of sources) expect(source).not.toContain('<')
})
