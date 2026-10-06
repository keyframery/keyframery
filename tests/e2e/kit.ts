import { expect, test as base, type Browser, type Page, type TestInfo } from "@playwright/test"

export type Meta = { base: "base" | "radix"; stock: string; motion: "full" | "reduced"; browser: string }
export type Frame = { t: number; on: boolean; names: string[]; durs: number[]; op: number; tf: string; tr: string; aria: string | null; inert: boolean }
export type CutEvent = { cut: string; component: string; phase: "enter" | "exit"; ms: number }

declare global {
  interface Window {
    __kfSample(selector: string, ms: number): Promise<Frame[]>
    __kfEvents: CutEvent[]
  }
}

/** Runs in the page before any app code. */
function probes() {
  window.__kfEvents = []
  document.addEventListener("keyframery:cut", (e) => window.__kfEvents.push((e as CustomEvent).detail))
  window.__kfSample = (selector, ms) =>
    new Promise((resolve) => {
      const frames: Frame[] = []
      const t0 = performance.now()
      const tick = () => {
        const t = Math.round(performance.now() - t0)
        const el = document.querySelector(selector)
        if (el) {
          const cs = getComputedStyle(el)
          const anims = el.getAnimations()
          frames.push({
            t,
            on: true,
            names: anims.map((a) => (a as CSSAnimation).animationName || (a as CSSTransition).transitionProperty || "waapi"),
            durs: anims.map((a) => Number(a.effect?.getTiming().duration) || 0),
            op: Number(cs.opacity),
            tf: cs.transform,
            tr: cs.translate,
            aria: el.getAttribute("aria-hidden"),
            inert: (el as HTMLElement).inert,
          })
        } else frames.push({ t, on: false, names: [], durs: [], op: 0, tf: "", tr: "", aria: null, inert: false })
        if (t < ms) requestAnimationFrame(tick)
        else resolve(frames)
      }
      tick()
    })
}

export const test = base.extend<{ errors: string[] }>({
  page: async ({ page }, use) => {
    await page.addInitScript(probes)
    await use(page)
  },
  errors: async ({ page }, use) => {
    const errors: string[] = []
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text())
    })
    page.on("pageerror", (e) => errors.push(String(e)))
    await use(errors)
  },
})
export { expect }

export const meta = (info: TestInfo) => info.project.metadata as Meta
/** The exit duration a test should expect: full, or the reduced-motion cap. */
export const exitMs = (info: TestInfo, full: number) => (meta(info).motion === "reduced" ? 120 : full)

/** Samples `selector` every frame for `ms`, starting just before `action` runs. */
export async function sample(page: Page, selector: string, ms: number, action: () => Promise<unknown>) {
  const run = page.evaluate(([s, d]) => window.__kfSample(s, d), [selector, ms] as [string, number])
  await action()
  return run
}

export const animNames = (frames: Frame[]) => [...new Set(frames.filter((f) => f.on).flatMap((f) => f.names))]
export const firstOn = (frames: Frame[]) => frames.find((f) => f.on)
export function spanWith(frames: Frame[], name: string) {
  const hit = frames.filter((f) => f.on && f.names.includes(name))
  return hit.length ? hit[hit.length - 1].t - hit[0].t : 0
}
export function translation(transform: string) {
  const m = transform.match(/matrix\(([^)]+)\)/)
  if (!m) return { x: 0, y: 0 }
  const v = m[1].split(",").map(Number)
  return { x: v[4], y: v[5] }
}

export const takeEvents = (page: Page) => page.evaluate(() => window.__kfEvents.splice(0))
export const activeId = (page: Page) =>
  page.evaluate(() => document.activeElement?.getAttribute("data-testid") ?? document.activeElement?.tagName.toLowerCase() ?? null)
export const leftovers = (page: Page) => page.evaluate(() => document.querySelectorAll("[data-kf-ghost],[data-kf-pill]").length)

/** Runs `fn` on the same path of the stock twin (no Keyframery), same browser and motion setting. */
export async function onStock<T>(browser: Browser, info: TestInfo, path: string, fn: (page: Page) => Promise<T>) {
  const m = meta(info)
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: m.motion === "reduced" ? "reduce" : "no-preference" })
  const page = await ctx.newPage()
  const errors: string[] = []
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text())
  })
  page.on("pageerror", (e) => errors.push(String(e)))
  await page.addInitScript(probes)
  await page.goto(m.stock + path)
  try {
    return { value: await fn(page), errors }
  } finally {
    await ctx.close()
  }
}
