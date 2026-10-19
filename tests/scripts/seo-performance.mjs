// Run against a production build: pnpm -C tests exec node scripts/seo-performance.mjs
// Live baseline: pnpm -C tests exec node scripts/seo-performance.mjs --base https://keyframery.com
// This is a bounded navigation lab audit, not Lighthouse, field INP or a Core Web Vitals pass.
import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { chromium, devices } from "@playwright/test"

const args = process.argv.slice(2)
let base = "http://localhost:4500"
let samples = 2
let selectedRoute
for (let index = 0; index < args.length; index++) {
  if (args[index] === "--base") base = args[++index]
  else if (args[index] === "--samples") samples = Number(args[++index])
  else if (args[index] === "--route") selectedRoute = args[++index]
  else throw new Error(`Unknown option: ${args[index]}. Use --base URL, --samples 2..5 or --route PATH.`)
}
const baseURL = new URL(base)
if (!["http:", "https:"].includes(baseURL.protocol)) throw new Error("The audit base must use http or https.")
if (!Number.isInteger(samples) || samples < 2 || samples > 5) throw new Error("Use 2 to 5 samples per route and profile.")

const capturedAt = new Date().toISOString()
const output = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../.reports/seo", `${capturedAt.replace(/[:.]/g, "-")}-${baseURL.host.replace(/[^a-z0-9.-]/gi, "-")}`)
await fs.mkdir(output, { recursive: true })
const allRoutes = ["/", "/docs/components/dialog", "/docs/helpers/list-cut", "/theme"]
if (selectedRoute && !allRoutes.includes(selectedRoute)) throw new Error(`Choose a measured route: ${allRoutes.join(", ")}`)
const routes = selectedRoute ? [selectedRoute] : allRoutes
const profiles = {
  desktop: { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 },
  mobile: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } },
}
const observationAfterLoadMs = 3000
const results = []
const browser = await chromium.launch({ headless: true })

try {
  for (const [profile, options] of Object.entries(profiles)) {
    for (const route of routes) {
      for (let sample = 1; sample <= samples; sample++) {
        const context = await browser.newContext({ ...options, colorScheme: "light" })
        const page = await context.newPage()
        const errors = []
        page.on("pageerror", (error) => errors.push(error.message))
        try {
          await page.addInitScript(() => {
            const data = { supported: PerformanceObserver.supportedEntryTypes, lcp: null, shifts: [], longTasks: [], observers: [] }
            window.__seoAudit = data
            const elementName = (node) => {
              const element = node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement
              return element ? `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}${element.getAttribute("data-slot") ? `[data-slot="${element.getAttribute("data-slot")}"]` : ""}` : null
            }
            const observe = (type, consume) => {
              if (!data.supported.includes(type)) return
              const observer = new PerformanceObserver((list) => consume(list.getEntries()))
              observer.observe({ type, buffered: true })
              data.observers.push({ observer, consume })
            }
            observe("largest-contentful-paint", (entries) => {
              const entry = entries.at(-1)
              data.lcp = { startTime: entry.startTime, size: entry.size, url: entry.url || null, element: elementName(entry.element) }
            })
            observe("layout-shift", (entries) => {
              for (const entry of entries) if (!entry.hadRecentInput) data.shifts.push({ startTime: entry.startTime, value: entry.value, elements: entry.sources?.map((source) => elementName(source.node)) ?? [] })
            })
            observe("longtask", (entries) => {
              for (const entry of entries) data.longTasks.push({ startTime: entry.startTime, duration: entry.duration, name: entry.name })
            })
          })
          const response = await page.goto(new URL(route, baseURL).href, { waitUntil: "load", timeout: 30_000 })
          await page.waitForTimeout(observationAfterLoadMs)
          const observations = await page.evaluate(() => {
            const data = window.__seoAudit
            for (const { observer, consume } of data.observers) {
              const entries = observer.takeRecords()
              if (entries.length) consume(entries)
              observer.disconnect()
            }
            // CLS uses the largest session window: <1s between shifts, <5s total; recent input is excluded.
            let cls = 0
            let windowValue = 0
            let windowStart = 0
            let lastShift = 0
            for (const shift of data.shifts) {
              if (shift.startTime - lastShift < 1000 && shift.startTime - windowStart < 5000) windowValue += shift.value
              else {
                windowStart = shift.startTime
                windowValue = shift.value
              }
              lastShift = shift.startTime
              cls = Math.max(cls, windowValue)
            }
            const navigation = performance.getEntriesByType("navigation")[0]
            const resources = performance.getEntriesByType("resource").map((entry) => ({ url: entry.name, type: entry.initiatorType, startTime: entry.startTime, duration: entry.duration, transferBytes: entry.transferSize, decodedBytes: entry.decodedBodySize }))
            return {
              measuredUntilMs: performance.now(),
              visibility: document.visibilityState,
              supportedEntryTypes: data.supported,
              metrics: {
                ttfbMs: navigation?.responseStart ?? null,
                domContentLoadedMs: navigation?.domContentLoadedEventEnd ?? null,
                loadMs: navigation?.loadEventEnd ?? null,
                fcpMs: performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? null,
                lcpMs: data.lcp?.startTime ?? null,
                cls: data.supported.includes("layout-shift") ? cls : null,
                longTaskCount: data.supported.includes("longtask") ? data.longTasks.length : null,
                longTaskTotalMs: data.supported.includes("longtask") ? data.longTasks.reduce((sum, entry) => sum + entry.duration, 0) : null,
                longTaskMaxMs: data.supported.includes("longtask") ? Math.max(0, ...data.longTasks.map((entry) => entry.duration)) : null,
                knownResourceTransferBytes: resources.reduce((sum, entry) => sum + entry.transferBytes, 0),
              },
              evidence: {
                lcpCandidate: data.lcp,
                layoutShifts: data.shifts,
                longestTasks: data.longTasks.sort((a, b) => b.duration - a.duration).slice(0, 10),
                slowestResources: [...resources].sort((a, b) => b.duration - a.duration).slice(0, 10),
                largestKnownTransfers: [...resources].sort((a, b) => b.transferBytes - a.transferBytes).slice(0, 10),
                resourceCount: resources.length,
              },
            }
          })
          const screenshot = `${profile}-${route === "/" ? "home" : route.slice(1).replaceAll("/", "-")}-${sample}.png`
          await page.screenshot({ path: path.join(output, screenshot) })
          const result = { profile, route, sample, status: response?.status() ?? null, finalURL: page.url(), screenshot, errors, ...observations }
          results.push(result)
          if (result.status !== 200 || result.visibility !== "visible") process.exitCode = 1
          console.log(`${profile} ${route} ${sample}/${samples}: HTTP ${result.status}; LCP ${observations.metrics.lcpMs?.toFixed(0) ?? "unavailable"} ms; CLS ${observations.metrics.cls?.toFixed(4) ?? "unavailable"}`)
        } catch (error) {
          results.push({ profile, route, sample, error: error.message, errors })
          process.exitCode = 1
          console.error(`${profile} ${route} ${sample}/${samples}: ${error.message}`)
        } finally {
          await context.close()
        }
      }
    }
  }
} finally {
  const median = (values) => {
    const sorted = values.filter((value) => value !== null && Number.isFinite(value)).sort((a, b) => a - b)
    if (!sorted.length) return null
    const middle = Math.floor(sorted.length / 2)
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
  }
  const summary = Object.keys(profiles).flatMap((profile) => routes.map((route) => {
    const successful = results.filter((result) => result.profile === profile && result.route === route && result.status === 200 && result.metrics)
    const metrics = successful[0] ? Object.fromEntries(Object.keys(successful[0].metrics).map((key) => [key, median(successful.map((result) => result.metrics[key]))])) : null
    return { profile, route, successfulSamples: successful.length, requestedSamples: samples, median: metrics }
  }))
  const report = {
    capturedAt,
    baseURL: baseURL.href,
    browserVersion: browser.version(),
    methodology: {
      kind: "navigation-only lab observations",
      profiles,
      samplesPerRouteAndProfile: samples,
      observationAfterLoadMs,
      cache: "fresh browser context per sample; server/CDN caches may remain warm",
      throttling: "none; mobile is viewport/user-agent emulation on the host CPU and network",
      limitations: ["No field data, p75, INP, interaction testing, Lighthouse score or Core Web Vitals pass is measured.", "LCP candidate and CLS cover navigation plus the fixed observation window, not the full page lifetime or cross-origin iframe content.", "Resource transfer bytes can be unavailable for cross-origin resources without Timing-Allow-Origin; zero is not proof of a free resource.", "Long tasks identify main-thread blocking observations, not their JavaScript source or a measured interaction delay.", "Two samples provide a small directional baseline; repeat under comparable conditions before attributing a change."],
      sources: ["https://web.dev/articles/lcp", "https://web.dev/articles/cls", "https://developer.mozilla.org/en-US/docs/Web/API/PerformanceLongTaskTiming"],
    },
    summary,
    samples: results,
  }
  await fs.writeFile(path.join(output, "report.json"), `${JSON.stringify(report, null, 2)}\n`)
  await browser.close()
  console.log(`Saved lab report and viewport screenshots to ${output}`)
}
