import { expect, test } from '@playwright/test'

test('built HTTP responses publish the enforced security policy and transport headers', async ({ request }) => {
  const response = await request.get('/')
  expect(response.status()).toBe(200)
  const headers = response.headers()

  expect(headers['x-content-type-options']).toBe('nosniff')
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
  expect(headers['x-frame-options']).toBe('SAMEORIGIN')
  expect(headers['strict-transport-security']).toBe('max-age=63072000; includeSubDomains; preload')
  expect(headers['content-security-policy-report-only']).toBeUndefined()

  const csp = headers['content-security-policy']
  expect(csp).toContain("object-src 'none'")
  expect(csp).toContain("base-uri 'self'")
  expect(csp).toContain("form-action 'self'")
  expect(csp).toContain("frame-ancestors 'self'")
  expect(csp).not.toContain("'unsafe-eval'")
})

test('enforced CSP permits application hydration and contact validation without violations', async ({ page }) => {
  await page.addInitScript(() => {
    const target = window as Window & { __cspViolations?: Array<{ blockedURI: string; effectiveDirective: string; disposition: string }> }
    target.__cspViolations = []
    document.addEventListener('securitypolicyviolation', event => {
      target.__cspViolations?.push({
        blockedURI: event.blockedURI,
        effectiveDirective: event.effectiveDirective,
        disposition: event.disposition,
      })
    })
  })
  const pageErrors: string[] = []
  const consoleViolations: string[] = []
  page.on('pageerror', error => pageErrors.push(error.message))
  page.on('console', message => {
    if (/content security policy|refused to|violates/i.test(message.text())) consoleViolations.push(message.text())
  })

  await page.goto('/')
  await expect(page.locator('#main')).toBeVisible()
  await page.locator('#contact').getByRole('button', { name: 'Send message', exact: true }).click()
  await expect(page.getByText('Name is required', { exact: true })).toBeVisible()

  const violations = await page.evaluate(() => (window as Window & { __cspViolations?: unknown[] }).__cspViolations ?? [])
  expect(violations).toEqual([])
  expect(consoleViolations).toEqual([])
  expect(pageErrors).toEqual([])
})
