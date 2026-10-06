import type { Page } from "@playwright/test"

import { expect, leftovers, meta, takeEvents, takeGhosts, test } from "./kit"

const matchCuts = async (page: Page) => (await takeEvents(page)).filter((e) => e.component === "match").length

/** Waits until `n` MatchCut events have arrived (counting across polls), then checks no more come. */
async function expectMatchCuts(page: Page, n: number) {
  let seen = 0
  await expect.poll(async () => (seen += await matchCuts(page))).toBeGreaterThanOrEqual(n)
  await page.waitForTimeout(150)
  expect(seen + (await matchCuts(page))).toBe(n)
}

/** Clicks `testId` in the page and reports the first keyframe of the MatchCut `target` against the boxes. */
const pressAndRead = (page: Page, testId: string, source: string, target: string) =>
  page.evaluate(
    async ([id, s, t]) => {
      const from = document.querySelector(s)!.getBoundingClientRect()
      ;(document.querySelector(`[data-testid="${id}"]`) as HTMLElement).click()
      await new Promise((r) => setTimeout(r, 0))
      const el = document.querySelector(t) as HTMLElement
      const anim = el.getAnimations()[0]
      if (!anim) return null
      const first = (anim.effect as KeyframeEffect).getKeyframes()[0] as Record<string, string>
      anim.finish()
      const to = el.getBoundingClientRect()
      return { transform: first.transform ?? null, opacity: first.opacity, expected: { dx: from.left - to.left, dy: from.top - to.top, sx: from.width / to.width } }
    },
    [testId, source, target] as [string, string, string],
  )

function expectGrowsFrom(read: Awaited<ReturnType<typeof pressAndRead>>) {
  expect(read).not.toBeNull()
  // WebKit and Firefox write translate(228px) when y is 0; Chromium writes translate(228px, 0px)
  const m = read!.transform!.match(/translate\(([-\d.e]+)px(?:,\s*([-\d.e]+)px)?\)\s*scale\(([-\d.e]+)(?:,\s*([-\d.e]+))?\)/)!
  expect(Math.abs(Number(m[1]) - read!.expected.dx)).toBeLessThanOrEqual(2)
  expect(Math.abs(Number(m[2] ?? 0) - read!.expected.dy)).toBeLessThanOrEqual(2)
  expect(Math.abs(Number(m[3]) - read!.expected.sx)).toBeLessThanOrEqual(0.02)
}

test("a card opens into its detail and closes back into it (same page)", async ({ page, errors }, info) => {
  const reduced = meta(info).motion === "reduced"
  await page.goto("/helpers")
  await takeGhosts(page)
  const open = await pressAndRead(page, "open-2", '[data-testid="card-2"]', '[data-testid="detail"]')
  if (reduced) expect(open!.transform).toBeNull()
  else {
    expectGrowsFrom(open)
    expect((await takeGhosts(page)).map((g) => g.slot)).toEqual(["match-cut-ghost"])
  }
  expect(await matchCuts(page)).toBe(1)
  await expect.poll(() => leftovers(page)).toBe(0)
  await page.getByTestId("close-detail").click()
  await expect(page.getByTestId("card-2")).toBeVisible()
  await expectMatchCuts(page, 1) // only card 2 cuts back; its siblings come back to where they were
  await expect.poll(() => leftovers(page)).toBe(0)
  expect(errors).toEqual([])
})

test("remounting MatchCuts in place (same ids, same boxes) does not morph them from themselves", async ({ page }) => {
  await page.goto("/helpers")
  await page.getByTestId("rerender").click()
  await page.waitForTimeout(200)
  expect(await matchCuts(page)).toBe(0)
})

test("a card and its detail on screen together: the dialog's content grows from the card and goes back", async ({ page }) => {
  await page.goto("/helpers")
  await page.getByTestId("profile-open").click()
  await expect(page.getByTestId("profile-detail")).toBeVisible()
  await expectMatchCuts(page, 1)
  await page.keyboard.press("Escape")
  await expect(page.getByTestId("profile-detail")).toHaveCount(0)
  await expectMatchCuts(page, 1)
  await expect.poll(() => leftovers(page)).toBe(0)
})

test("across a Next.js route change, the detail page grows from the card", async ({ page, errors }) => {
  await page.goto("/match")
  await page.getByTestId("route-open-2").click()
  await expect(page.getByTestId("route-detail")).toBeVisible()
  await expectMatchCuts(page, 1)
  await page.getByTestId("route-back").click()
  await expect(page.getByTestId("route-card-2")).toBeVisible()
  await expectMatchCuts(page, 1)
  await expect.poll(() => leftovers(page)).toBe(0)
  expect(errors).toEqual([])
})
