import fs from "node:fs"
import path from "node:path"

import { meta, test } from "../e2e/kit"

const OUT = path.resolve(new URL("../../.reports/frames", import.meta.url).pathname)

async function freeze(page: import("@playwright/test").Page, dir: string, label: string, times: number[]) {
  for (const t of times) {
    await page.evaluate((ms) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = ms }), t)
    await page.screenshot({ path: path.join(dir, `${label}-${String(t).padStart(4, "0")}.png`) })
  }
  await page.evaluate(() => document.getAnimations().forEach((a) => a.play()))
}

test("frames", async ({ page }, info) => {
  test.skip(meta(info).motion === "reduced")
  const dir = path.join(OUT, info.project.name)
  fs.mkdirSync(dir, { recursive: true })
  await page.goto("/")
  await page.getByTestId("dialog-trigger").click()
  await freeze(page, dir, "dialog-open", [0, 60, 120, 200, 340])
  await page.waitForTimeout(400)
  await page.keyboard.press("Escape")
  await freeze(page, dir, "dialog-close", [0, 60, 120, 170, 220])
  await page.waitForTimeout(500)
  await page.getByTestId("sheet-trigger").click()
  await freeze(page, dir, "sheet-open", [0, 80, 160, 260, 460])
  await page.keyboard.press("Escape")
  await page.waitForTimeout(700)
  await page.getByTestId("tab-analytics").click()
  await freeze(page, dir, "tabs", [0, 50, 100, 160, 240, 370])
  await page.waitForTimeout(500)
  await page.getByTestId("toast-trigger").click()
  await freeze(page, dir, "toast", [0, 100, 200, 320, 480])
})
