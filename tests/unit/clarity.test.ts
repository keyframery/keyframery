import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  canLoadClarity,
  clarityPreference,
  CLARITY_PREFERENCE_EVENT,
  CLARITY_PREFERENCE_KEY,
  CLARITY_PREFERENCE_TTL,
  CLARITY_SCRIPT_ID,
  configuredClarityId,
  createClarityController,
  parseClarityPreference,
  rememberClarityPreference,
} from "../../apps/web/lib/clarity"

beforeEach(() => {
  rememberClarityPreference(false)
  localStorage.clear()
  delete window.clarity
  // Keep test scripts inert: test loading decisions and queues without contacting Microsoft.
  vi.spyOn(document.head, "append").mockImplementation(() => {})
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  delete window.clarity
  document.cookie = "_clck=; Max-Age=0; Path=/"
  document.cookie = "_clsk=; Max-Age=0; Path=/"
})

describe("optional Clarity configuration and consent", () => {
  it("requires a valid production project and public production host", () => {
    expect(configuredClarityId({ CLARITY_PROJECT_ID: "abc123" })).toBeNull()
    expect(configuredClarityId({ VERCEL_ENV: "preview", CLARITY_PROJECT_ID: "abc123" })).toBeNull()
    expect(configuredClarityId({ VERCEL_ENV: "production", CLARITY_PROJECT_ID: "<script>" })).toBeNull()
    expect(configuredClarityId({ VERCEL_ENV: "production", CLARITY_PROJECT_ID: "abc123" })).toBe("abc123")
    expect(canLoadClarity("abc123", "/docs", "keyframery.com")).toBe(true)
    expect(canLoadClarity("abc123", "/", "www.keyframery.com")).toBe(true)
    for (const host of ["localhost", "127.0.0.1", "preview.vercel.app", "keyframery.com.evil.example"]) expect(canLoadClarity("abc123", "/", host)).toBe(false)
    for (const path of ["/admin", "/admin/settings", "/%61dmin", "/admin%2Fsettings", "/%broken"]) expect(canLoadClarity("abc123", path, "keyframery.com")).toBe(false)
  })

  it("requires an explicit, valid, unexpired choice and bounds its lifetime to 180 days", () => {
    const now = Date.now()
    expect(parseClarityPreference(JSON.stringify({ enabled: true, expiresAt: now + 1000 }), now)).toEqual({ enabled: true, expiresAt: now + 1000 })
    for (const value of [null, "{", "true", JSON.stringify({ enabled: "true", expiresAt: now + 1000 }), JSON.stringify({ enabled: true, expiresAt: now }), JSON.stringify({ enabled: true, expiresAt: now + CLARITY_PREFERENCE_TTL + 1 })]) expect(parseClarityPreference(value, now)).toBeNull()
    expect(clarityPreference().state).toBe("off")
    expect(rememberClarityPreference(true)).toBe(true)
    expect(clarityPreference().state).toBe("allowed")
    const stored = JSON.parse(localStorage.getItem(CLARITY_PREFERENCE_KEY)!)
    expect(stored).toEqual({ enabled: true, expiresAt: expect.any(Number) })
    expect(stored.expiresAt - now).toBeLessThanOrEqual(CLARITY_PREFERENCE_TTL + 100)
    expect(rememberClarityPreference(false)).toBe(true)
    expect(clarityPreference().state).toBe("off")
  })

  it("fails closed when browser storage is unavailable, including a failed revocation write", () => {
    expect(rememberClarityPreference(true)).toBe(true)
    const update = vi.fn()
    window.addEventListener(CLARITY_PREFERENCE_EVENT, update)
    vi.stubGlobal("localStorage", { removeItem: () => { throw new Error("blocked") } })
    expect(rememberClarityPreference(false)).toBe(false)
    expect(clarityPreference().state).toBe("unavailable")
    expect(update).toHaveBeenCalledOnce()
    window.removeEventListener(CLARITY_PREFERENCE_EVENT, update)
  })
})

describe("Clarity document lifecycle", () => {
  it("loads nothing without opt-in, a production configuration or on admin pages", () => {
    const controller = createClarityController()
    controller.sync("abc123", "/", "keyframery.com", false)
    controller.sync(null, "/", "keyframery.com", true)
    controller.sync("abc123", "/", "localhost", true)
    controller.sync("abc123", "/admin", "keyframery.com", true)
    expect(document.head.append).not.toHaveBeenCalled()
    expect(window.clarity).toBeUndefined()
  })

  it("clears leftover first-party cookies even when this page never loaded Clarity", () => {
    document.cookie = "_clck=private; Path=/"
    document.cookie = "_clsk=private; Path=/"
    const controller = createClarityController()
    controller.sync(null, "/privacy", "localhost", false)
    expect(document.cookie).not.toMatch(/_clck|_clsk/)
    expect(document.head.append).not.toHaveBeenCalled()
  })

  it("loads a single script after opt-in and keeps advertising denied across SPA transitions", () => {
    const controller = createClarityController()
    controller.sync("abc123", "/privacy", "keyframery.com", true)
    controller.sync("abc123", "/docs", "keyframery.com", true)
    controller.sync("abc123", "/theme", "keyframery.com", true)
    expect(document.head.append).toHaveBeenCalledOnce()
    const script = vi.mocked(document.head.append).mock.calls[0][0] as HTMLScriptElement
    expect(script.id).toBe(CLARITY_SCRIPT_ID)
    expect(script.src).toBe("https://www.clarity.ms/tag/abc123")
    expect(script.referrerPolicy).toBe("no-referrer")
    expect(window.clarity?.q).toEqual([["consentv2", { analytics_Storage: "granted", ad_Storage: "denied" }]])
  })

  it("withdraws queued consent, clears first-party cookies and suppresses later loads", () => {
    const controller = createClarityController()
    controller.sync("abc123", "/", "keyframery.com", true)
    document.cookie = "_clck=private; Path=/"
    document.cookie = "_clsk=private; Path=/"
    expect(document.cookie).toContain("_clck")
    controller.sync("abc123", "/privacy", "keyframery.com", false)
    expect(window.clarity?.q).toEqual([["consentv2", { analytics_Storage: "denied", ad_Storage: "denied" }], ["stop"]])
    expect(document.cookie).not.toMatch(/_clck|_clsk/)
    controller.sync("abc123", "/docs", "keyframery.com", true)
    expect(document.head.append).toHaveBeenCalledOnce()
    const script = vi.mocked(document.head.append).mock.calls[0][0] as HTMLScriptElement
    script.dispatchEvent(new Event("load"))
    expect(window.clarity?.q).toEqual([["consentv2", { analytics_Storage: "denied", ad_Storage: "denied" }], ["stop"]])
  })

  it.each(["withdrawal", "admin navigation"])("stops the active runtime before denying consent and prevents vendor deferred restart after %s", (reason) => {
    vi.useFakeTimers()
    const controller = createClarityController()
    controller.sync("abc123", "/docs", "keyframery.com", true)
    let active = true
    let restarts = 0
    const installInactiveQueue = () => {
      const queue: NonNullable<Window["clarity"]> = (...command) => { queue.q?.push(command) }
      queue.q = []
      window.clarity = queue
    }
    // Model Microsoft's metadata.ts + queue.ts: denying consent while active stops and schedules a
    // direct start call, whereas stop first replaces the global dispatcher with an inactive queue.
    const vendor = vi.fn<NonNullable<Window["clarity"]>>((...command) => {
      if (command[0] === "consentv2" && command[1].analytics_Storage === "denied" && active) {
        active = false
        installInactiveQueue()
        window.setTimeout(() => { active = true; restarts++ }, 100)
      } else if (command[0] === "stop" && active) {
        active = false
        installInactiveQueue()
      }
    })
    window.clarity = vendor
    controller.sync("abc123", reason === "withdrawal" ? "/privacy" : "/admin", "keyframery.com", reason !== "withdrawal")
    expect(vendor.mock.calls).toEqual([["stop"]])
    expect(window.clarity?.q).toEqual([["consentv2", { analytics_Storage: "denied", ad_Storage: "denied" }], ["stop"]])
    vi.advanceTimersByTime(1000)
    expect(active).toBe(false)
    expect(restarts).toBe(0)
    controller.sync("abc123", "/", "keyframery.com", true)
    expect(document.head.append).toHaveBeenCalledOnce()
    expect(vendor).toHaveBeenCalledOnce()
  })

  it.each(["tag pending", "runtime pending"])("blocks Microsoft's late bootstrap/start ordering after withdrawal with %s", (stage) => {
    const controller = createClarityController()
    controller.sync("abc123", "/docs", "keyframery.com", true)
    let runtimeInserted = false
    let active = false
    const call = (...command: unknown[]) => (window.clarity as unknown as (...args: unknown[]) => void)(...command)
    // The real tag checks v/t, inserts the runtime, queues start and moves it ahead of all consent.
    const bootstrap = () => {
      if (window.clarity?.v || window.clarity?.t) return
      window.clarity!.t = true
      runtimeInserted = true
      call("start", { track: true })
      const queue = window.clarity!.q as unknown[][]
      queue.unshift(queue.pop()!)
    }
    if (stage === "runtime pending") bootstrap()
    controller.sync("abc123", "/privacy", "keyframery.com", false)
    if (stage === "tag pending") bootstrap()
    // Microsoft's global.ts invokes queue.process, whose version guard runs before dispatching start.
    const processRuntime = () => {
      if (window.clarity?.v) return
      for (const command of window.clarity?.q ?? []) if ((command as unknown[])[0] === "start") active = true
    }
    processRuntime()
    expect(active).toBe(false)
    expect(runtimeInserted).toBe(stage === "runtime pending")
    expect(window.clarity?.v).toBe("keyframery-disabled")
    expect(window.clarity?.q).toEqual([["consentv2", { analytics_Storage: "denied", ad_Storage: "denied" }], ["stop"]])
  })
})
