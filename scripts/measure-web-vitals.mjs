import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

const base = process.argv[2] ?? process.env.EVAL_BASE_URL ?? 'https://faris-portfolio-red.vercel.app'
const destination = process.argv[3]
const runsPerRoute = 5
const routes = ['/', '/simpul', '/work/rag-eval']
const conditions = {
  browser: 'Chromium',
  viewport: '390x844',
  hasTouch: true,
  isMobile: true,
  deviceScaleFactor: 1,
  cpuSlowdownMultiplier: 4,
  roundTripLatencyMs: 150,
  downloadThroughputBytesPerSecond: 1.6 * 1024 * 1024 / 8,
  uploadThroughputBytesPerSecond: 750 * 1024 / 8,
  coldBrowserContextPerRun: true,
  reducedMotion: 'no-preference',
  waitAfterLoadMs: 1500,
}

const median = values => {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

const browser = await chromium.launch({ headless: true })
const samples = []
const pageErrors = []
try {
  for (const route of routes) {
    for (let run = 1; run <= runsPerRoute; run += 1) {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 1,
      })
      const page = await context.newPage()
      page.on('pageerror', error => pageErrors.push({ route, run, message: error.message }))
      await page.addInitScript(() => {
        window.__labVitals = { lcpMs: 0, cls: 0 }
        new PerformanceObserver(list => {
          const entries = list.getEntries()
          const latest = entries.at(-1)
          if (latest) window.__labVitals.lcpMs = latest.startTime
        }).observe({ type: 'largest-contentful-paint', buffered: true })
        new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) window.__labVitals.cls += entry.value
          }
        }).observe({ type: 'layout-shift', buffered: true })
      })
      const client = await context.newCDPSession(page)
      await client.send('Network.enable')
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: conditions.roundTripLatencyMs,
        downloadThroughput: conditions.downloadThroughputBytesPerSecond,
        uploadThroughput: conditions.uploadThroughputBytesPerSecond,
      })
      await client.send('Emulation.setCPUThrottlingRate', { rate: conditions.cpuSlowdownMultiplier })
      const response = await page.goto(new URL(route, base).toString(), { waitUntil: 'load', timeout: 60_000 })
      await page.waitForTimeout(conditions.waitAfterLoadMs)
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0]
        const firstContentfulPaint = performance.getEntriesByName('first-contentful-paint')[0]
        const resources = performance.getEntriesByType('resource')
        return {
          vitals: window.__labVitals,
          ttfbMs: navigation?.responseStart ?? null,
          fcpMs: firstContentfulPaint?.startTime ?? null,
          loadMs: navigation?.loadEventEnd ?? null,
          navigationTransferBytes: navigation?.transferSize ?? null,
          resourceTransferBytes: resources.reduce((total, resource) => total + resource.transferSize, 0),
          scriptTransferBytes: resources.filter(resource => resource.initiatorType === 'script').reduce((total, resource) => total + resource.transferSize, 0),
        }
      })
      samples.push({
        route,
        run,
        status: response?.status() ?? null,
        ttfbMs: metrics.ttfbMs,
        fcpMs: metrics.fcpMs,
        lcpMs: metrics.vitals.lcpMs,
        cls: metrics.vitals.cls,
        loadMs: metrics.loadMs,
        navigationTransferBytes: metrics.navigationTransferBytes,
        resourceTransferBytes: metrics.resourceTransferBytes,
        scriptTransferBytes: metrics.scriptTransferBytes,
      })
      await context.close()
    }
  }
} finally {
  await browser.close()
}

const summaries = routes.map(route => {
  const selected = samples.filter(sample => sample.route === route && sample.status === 200)
  const metric = key => median(selected.map(sample => sample[key]).filter(Number.isFinite))
  return {
    route,
    successfulRuns: selected.length,
    medianTtfbMs: metric('ttfbMs'),
    medianFcpMs: metric('fcpMs'),
    medianLcpMs: metric('lcpMs'),
    medianCls: metric('cls'),
    medianLoadMs: metric('loadMs'),
    medianNavigationTransferBytes: metric('navigationTransferBytes'),
    medianResourceTransferBytes: metric('resourceTransferBytes'),
    medianScriptTransferBytes: metric('scriptTransferBytes'),
  }
})
const report = {
  base,
  recordedAt: new Date().toISOString(),
  conditions,
  runsPerRoute,
  summaries,
  samples,
  pageErrors,
  limitation: 'Five cold-context Chromium lab runs on one machine with emulated throughput and CPU. Not Lighthouse, CrUX, multi-browser, a performance SLA or proof of user-perceived improvement.',
}
const serialized = `${JSON.stringify(report, null, 2)}\n`
if (destination) {
  await mkdir(path.dirname(destination), { recursive: true })
  await writeFile(destination, serialized)
}
console.log(JSON.stringify({ base, summaries, pageErrors }, null, 2))
if (samples.some(sample => sample.status !== 200 || !Number.isFinite(sample.lcpMs)) || pageErrors.length) process.exitCode = 1
