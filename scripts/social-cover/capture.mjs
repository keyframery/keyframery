// Run from the repo root: node scripts/social-cover/capture.mjs
// Requires Chrome. The temporary Next.js route is removed even if capture fails.
import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { once } from "node:events"
import { copyFile, mkdir, rm, rmdir, unlink } from "node:fs/promises"
import { setTimeout } from "node:timers/promises"
import { chromium } from "playwright-core"

const route = new URL("../../app/og-cover/", import.meta.url)
const output = new URL("../../public/og/keyframery-ui-v1.png", import.meta.url)
const port = 4642
const url = `http://localhost:${port}/og-cover?play=off`
let server
let browser

// Refuse to overwrite an existing route.
await mkdir(route)
try {
  await copyFile(new URL("./page.tsx", import.meta.url), new URL("page.tsx", route))
  server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "-p", String(port)], { stdio: ["ignore", "pipe", "pipe"] })
  let logs = ""
  for (const stream of [server.stdout, server.stderr]) stream.on("data", (chunk) => { logs = (logs + chunk).slice(-4000) })
  let ready = false
  for (let i = 0; i < 100; i++) {
    if (server.exitCode !== null) throw new Error(logs)
    try {
      ready = (await fetch(url, { signal: AbortSignal.timeout(1000) })).ok
    } catch { /* Next is starting. */ }
    if (ready) break
    await setTimeout(300)
  }
  assert(ready, `Cover server did not start: ${logs}`)
  browser = await chromium.launch({ channel: "chrome" })
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, colorScheme: "dark" })
  const errors = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto(url, { waitUntil: "networkidle" })
  await page.evaluate(() => document.fonts.ready)
  await page.locator('#c-tabs [role="tab"]').nth(3).click()
  await page.getByRole("heading", { name: "Team plan" }).waitFor()
  await page.waitForTimeout(700)
  await page.addStyleTag({ content: "nextjs-portal { display: none !important } * { caret-color: transparent !important } :focus-visible { outline: none !important; box-shadow: none !important }" })
  await page.mouse.move(5, 5)
  assert.deepEqual(errors, [], "Cover must render without browser errors")
  await mkdir(new URL("../../public/og/", import.meta.url), { recursive: true })
  await page.screenshot({ path: output.pathname, animations: "disabled" })
  console.log(`Saved ${output.pathname} (1200×630)`)
} finally {
  try {
    await browser?.close()
  } finally {
    if (server && server.exitCode === null) {
      const exited = once(server, "exit")
      server.kill("SIGTERM")
      await exited
    }
    await unlink(new URL("page.tsx", route))
    await rmdir(route)
    // Next's generated dev types still reference the temporary page until dev restarts.
    await rm(new URL("../../.next/dev/types/", import.meta.url), { recursive: true, force: true })
  }
}
