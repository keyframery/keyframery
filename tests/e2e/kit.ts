import { expect, test as base, type Browser, type Page, type TestInfo } from "@playwright/test"

export type Meta = { base: "base" | "radix"; stock: string; motion: "full" | "reduced"; browser: string }
export type Frame = { t: number; on: boolean; names: string[]; durs: number[]; op: number; tf: string; tr: string; aria: string | null; inert: boolean }
export type CutEvent = { cut: string; component: string; phase: "enter" | "exit"; ms: number }
export type AnimEvent = { type: "end" | "cancel"; name: string; slot: string | null }

declare global {
  interface Window {
    __kfSample(selector: string, ms: number): Promise<Frame[]>
    __kfEvents: CutEvent[]
    __kfAnim: AnimEvent[]
  }
}

/** Runs in the page before any app code. */
function probes() {
  window.__kfEvents = []
  window.__kfAnim = []
  document.addEventListener("keyframery:cut", (e) => window.__kfEvents.push((e as CustomEvent).detail))
  // Track every CSS animation from its start: its `finished` promise resolves if it plays to the end,
  // and rejects if the element is removed first. (Base UI removes a part in the same frame its exit
  // finishes, before animationend is delivered, so the event alone can't tell.)
  document.addEventListener(
    "animationstart",
    (e) => {
      const ev = e as AnimationEvent
      const el = ev.target as Element
      const anim = el.getAnimations().find((a) => (a as CSSAnimation).animationName === ev.animationName)
      const record = (type: "end" | "cancel") => window.__kfAnim.push({ type, name: ev.animationName, slot: el.getAttribute("data-slot") })
      anim?.finished.then(() => record("end"), () => record("cancel"))
    },
    true,
  )
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
    // Wait for hydration: pressing keys before the libraries attach their listeners makes flaky runs.
    const goto = page.goto.bind(page)
    page.goto = (url, options) => goto(url, { waitUntil: "networkidle", ...options })
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
/** True when the CSS animation `name` on a `slot` part ran to its end (an exit the library didn't cut short). */
export const ranToEnd = (page: Page, slot: string, name: string) =>
  page.evaluate(([s, n]) => window.__kfAnim.some((a) => a.type === "end" && a.slot === s && a.name === n), [slot, name] as [string, string])

/** The computed transform of `selector` at the very first instant of its CSS animation `name` (null if it isn't running). */
export const startTransform = (page: Page, selector: string, name: string) =>
  page.evaluate(([s, n]) => {
    const el = document.querySelector(s)
    const anim = el?.getAnimations().find((a) => (a as CSSAnimation).animationName === n)
    if (!el || !anim) return null
    const t = anim.currentTime
    anim.pause()
    anim.currentTime = 0
    const tf = getComputedStyle(el).transform
    anim.currentTime = t
    anim.play()
    return tf
  }, [selector, name] as [string, string])

/** Centre of the first element matching `selector`, and the --kf-dx/--kf-dy the engine wrote on it. */
export const centre = (page: Page, selector: string) =>
  page.evaluate((s) => {
    const el = document.querySelector(s) as HTMLElement | null
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, dx: parseFloat(el.style.getPropertyValue("--kf-dx")), dy: parseFloat(el.style.getPropertyValue("--kf-dy")) }
  }, selector)
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
  await page.goto(m.stock + path, { waitUntil: "networkidle" })
  try {
    return { value: await fn(page), errors }
  } finally {
    await ctx.close()
  }
}
