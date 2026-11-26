import { expect, test } from '@playwright/test'

type MotionHarness = {
  observers: Array<{ callback: IntersectionObserverCallback; elements: Set<Element> }>
  frames: Map<number, FrameRequestCallback>
  nextFrame: number
  intersectCounters: () => void
  runFrame: (time: number) => void
}

type MotionWindow = Window & { __motionHarness: MotionHarness }

test('theme bootstrap applies a stored preference before body parsing', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('faris-theme', 'light')
    const state = window as typeof window & { firstBodyTheme?: string }
    const observer = new MutationObserver(() => {
      if (!state.firstBodyTheme && document.body) {
        state.firstBodyTheme = document.documentElement.dataset.theme
        observer.disconnect()
      }
    })
    observer.observe(document, { childList: true, subtree: true })
  })
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  expect(await page.evaluate(() => (window as typeof window & { firstBodyTheme?: string }).firstBodyTheme)).toBe('light')
})

test('light, dark and system modes persist and synchronize through the custom store', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.addInitScript(() => {
    if (!localStorage.getItem('faris-theme')) localStorage.setItem('faris-theme', 'light')
  })
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/')
  const control = page.getByRole('button', { name: /^Theme:/ })

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await control.click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.locator('html')).toHaveAttribute('data-theme-mode', 'dark')
  expect(await page.evaluate(() => localStorage.getItem('faris-theme'))).toBe('dark')

  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await control.click()
  await expect(page.locator('html')).toHaveAttribute('data-theme-mode', 'system')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')

  await page.emulateMedia({ colorScheme: 'dark' })
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(control).toHaveAttribute('data-theme-mode', 'system')
  await control.click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect(page.locator('html')).toHaveAttribute('data-theme-mode', 'light')

  const otherTab = await page.context().newPage()
  await otherTab.goto('/')
  await otherTab.evaluate(() => localStorage.removeItem('faris-theme'))
  await expect(page.locator('html')).toHaveAttribute('data-theme-mode', 'system')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await otherTab.close()
})

test('reduced motion neutralizes direct pointer tilt and ambient animation', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const card = page.locator('.case-card').first()
  await card.scrollIntoViewIfNeeded()
  await card.hover({ position: { x: 80, y: 80 } })
  await expect(card).toHaveCSS('transform', 'none')
  expect(await page.locator('.ambient-aura').evaluate(node => getComputedStyle(node).animationName)).toBe('none')
  await expect.poll(() => page.evaluate(() => document.getAnimations().filter(animation => animation.playState === 'running').length)).toBe(0)
})

test('reduced-motion changes finish active counters and disarm pending counters', async ({ page }) => {
  await page.addInitScript(() => {
    const motionWindow = window as unknown as MotionWindow
    const harness: MotionHarness = {
      observers: [],
      frames: new Map(),
      nextFrame: 0,
      intersectCounters: () => {
        for (const observer of harness.observers) {
          const entries = [...observer.elements]
            .filter(element => element.hasAttribute('data-counter'))
            .map(target => ({ isIntersecting: true, target }) as IntersectionObserverEntry)
          if (entries.length) observer.callback(entries, {} as IntersectionObserver)
        }
      },
      runFrame: time => {
        const callbacks = [...harness.frames.values()]
        harness.frames.clear()
        callbacks.forEach(callback => callback(time))
      },
    }
    motionWindow.__motionHarness = harness
    window.requestAnimationFrame = callback => {
      harness.nextFrame += 1
      harness.frames.set(harness.nextFrame, callback)
      return harness.nextFrame
    }
    window.cancelAnimationFrame = frame => { harness.frames.delete(frame) }
    window.IntersectionObserver = class {
      private readonly registration: MotionHarness['observers'][number]
      constructor(callback: IntersectionObserverCallback) {
        this.registration = { callback, elements: new Set() }
        harness.observers.push(this.registration)
      }
      observe(element: Element) { this.registration.elements.add(element) }
      unobserve(element: Element) { this.registration.elements.delete(element) }
      disconnect() { this.registration.elements.clear() }
    } as unknown as typeof IntersectionObserver
  })
  await page.goto('/')
  const counters = page.locator('[data-counter]')
  await expect(counters).toHaveCount(3)
  await page.evaluate(() => {
    const harness = (window as unknown as MotionWindow).__motionHarness
    harness.intersectCounters()
    harness.runFrame(performance.now() + 250)
  })
  await expect(counters.first()).not.toHaveText('25,000')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(counters.nth(0)).toHaveText('25,000')
  await expect(counters.nth(1)).toHaveText('3')
  await expect(counters.nth(2)).toHaveText('5')

  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.reload()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.evaluate(() => {
    const harness = (window as unknown as MotionWindow).__motionHarness
    harness.intersectCounters()
    harness.runFrame(performance.now() + 250)
  })
  await expect(counters.nth(0)).toHaveText('25,000')
  await expect(counters.nth(1)).toHaveText('3')
  await expect(counters.nth(2)).toHaveText('5')
})

test('tilt and ambient tracking cancel queued frames on every termination path', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')
  const card = page.locator('.case-card').first()
  await card.scrollIntoViewIfNeeded()

  for (const termination of ['pointerup', 'pointercancel', 'pointerleave', 'touchend', 'touchcancel', 'blur']) {
    await card.evaluate((node, eventName) => {
      const bounds = node.getBoundingClientRect()
      node.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true, pointerType: 'mouse', clientX: bounds.left + 30, clientY: bounds.top + 30 }))
      node.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerType: 'mouse', clientX: bounds.right - 30, clientY: bounds.bottom - 30 }))
      if (eventName === 'blur') window.dispatchEvent(new Event('blur'))
      else {
        const nativeEvent = eventName === 'pointerleave' ? 'pointerout' : eventName
        node.dispatchEvent(new Event(nativeEvent, { bubbles: true }))
      }
    }, termination)
    await card.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
    await expect(card, termination).toHaveCSS('--rx', '0deg')
    await expect(card, termination).toHaveCSS('--ry', '0deg')
    await expect(card, termination).not.toHaveAttribute('data-pointer-active', 'true')
  }

  for (const termination of ['pointerup', 'pointercancel', 'pointerleave', 'touchend', 'touchcancel', 'blur']) {
    await page.locator('.ambient-field').evaluate((node, eventName) => {
      const host = node.parentElement
      if (!host) throw new Error('Ambient host is missing')
      const bounds = host.getBoundingClientRect()
      host.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerType: 'mouse', clientX: bounds.right - 30, clientY: bounds.bottom - 30 }))
      if (eventName === 'blur') window.dispatchEvent(new Event('blur'))
      else host.dispatchEvent(new Event(eventName, { bubbles: true }))
    }, termination)
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
    await expect(page.locator('.ambient-field')).toHaveCSS('--ambient-x', '0px')
    await expect(page.locator('.ambient-field')).toHaveCSS('--ambient-y', '0px')
    await expect(page.locator('.ambient-field')).not.toHaveAttribute('data-pointer-active', 'true')
  }
})

test.describe('coarse-pointer interactions', () => {
  test.use({ hasTouch: true, viewport: { width: 360, height: 800 } })

  test('ambient motion and card press feedback work without hover', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.ambient-aura')).toHaveCSS('animation-name', 'aura-breathe')
    const card = page.locator('.case-card').first()
    await card.scrollIntoViewIfNeeded()
    const box = await card.boundingBox()
    if (!box) throw new Error('Case card has no interaction bounds')
    await card.dispatchEvent('pointerdown', { pointerType: 'touch', clientX: box.x + box.width / 2, clientY: box.y + box.height / 2 })
    await expect(card).toHaveAttribute('data-pressed', 'true')
    await card.dispatchEvent('pointerup', { pointerType: 'touch' })
    await expect(card).not.toHaveAttribute('data-pressed', 'true')
    await card.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
    await expect(card).toHaveCSS('--rx', '0deg')
    await expect(card).toHaveCSS('--ry', '0deg')
  })

  test('coarse-pointer reduced motion suppresses the ambient aura', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await expect(page.locator('.ambient-aura')).toHaveCSS('animation-name', 'none')
  })

  test('topology provides touch-sized targets and real tap selection', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/simpul')
    const services = page.locator('g[aria-label="Services"] [role="button"]')
    const firstService = services.first()
    const secondService = services.nth(1)
    const name = await secondService.locator('text').first().textContent()
    if (!name) throw new Error('Service has no visible name')
    await expect(firstService).toHaveAttribute('aria-pressed', 'true')
    await secondService.tap()
    const inspector = page.getByLabel('Network selection inspector', { exact: true })
    await expect(inspector.getByRole('heading', { name, exact: true })).toBeVisible()
    await expect(firstService).toHaveAttribute('aria-pressed', 'false')
    await expect(secondService).toHaveAttribute('aria-pressed', 'true')

    const node = page.locator('g[aria-label="Network nodes"] [role="button"]').nth(1)
    const nodeName = await node.locator('text').first().textContent()
    if (!nodeName) throw new Error('Node has no visible name')
    await node.tap()
    await expect(inspector.getByRole('heading', { name: nodeName, exact: true })).toBeVisible()
    await expect(node).toHaveAttribute('aria-pressed', 'true')
    await expect(secondService).toHaveAttribute('aria-pressed', 'false')

    const link = page.locator('g[aria-label="Fiber links"] [role="button"]').first()
    await link.tap()
    await expect(link).toHaveAttribute('aria-pressed', 'true')
    await expect(node).toHaveAttribute('aria-pressed', 'false')

    const targets = await page.evaluate(() => {
      const topology = document.querySelector('[aria-label="Scrollable synthetic network topology"]')
      const svg = topology?.querySelector('svg')
      const serviceHit = document.querySelector('g[aria-label="Services"] [role="button"] rect')?.getBoundingClientRect().height ?? 0
      const nodeHit = document.querySelector('g[aria-label="Network nodes"] [role="button"] rect')?.getBoundingClientRect().height ?? 0
      const group = document.querySelector<SVGGElement>('g[aria-label="Fiber links"] > g[role="button"]')
      const line = group?.querySelector<SVGLineElement>('line')
      if (!(svg instanceof SVGSVGElement) || !group || !line || !topology) throw new Error('Topology geometry is missing')
      const matrix = line.getScreenCTM()
      if (!matrix) throw new Error('Topology has no screen transform')
      const from = new DOMPoint(Number(line.getAttribute('x1')), Number(line.getAttribute('y1'))).matrixTransform(matrix)
      const to = new DOMPoint(Number(line.getAttribute('x2')), Number(line.getAttribute('y2'))).matrixTransform(matrix)
      const length = Math.hypot(to.x - from.x, to.y - from.y)
      const normal = { x: -(to.y - from.y) / length, y: (to.x - from.x) / length }
      const middle = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 }
      const hitOwnership = [-22, 0, 22].map(offset => {
        const hit = document.elementFromPoint(middle.x + normal.x * offset, middle.y + normal.y * offset)
        return hit?.closest('g[role="button"]') === group
      })
      return { linkHitOwnership: hitOwnership, nodeHit, serviceHit }
    })
    expect(targets.linkHitOwnership).toEqual([true, true, true])
    expect(targets.nodeHit).toBeGreaterThanOrEqual(44)
    expect(targets.serviceHit).toBeGreaterThanOrEqual(44)
  })
})

test('content remains visible when IntersectionObserver is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'IntersectionObserver', { configurable: true, value: undefined })
  })
  await page.goto('/')
  const reveals = page.locator('[data-reveal]')
  expect(await reveals.count()).toBeGreaterThan(20)
  expect(await reveals.evaluateAll(nodes => nodes.every(node => getComputedStyle(node).opacity === '1'))).toBe(true)
})

test('the 800ms watchdog reveals content when observer callbacks never fire', async ({ page }) => {
  await page.addInitScript(() => {
    window.IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof IntersectionObserver
  })
  await page.goto('/')
  const contactReveal = page.locator('#contact [data-reveal]').first()
  await contactReveal.scrollIntoViewIfNeeded()
  await expect(contactReveal).toHaveAttribute('data-reveal-state', 'visible', { timeout: 2500 })
  await expect(contactReveal).toHaveCSS('opacity', '1')
})
