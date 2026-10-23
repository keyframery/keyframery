import { afterEach, describe, expect, it, vi } from "vitest"

import { parseCopyEvent } from "../../apps/web/lib/copy-events"
import { trackCopy } from "../../apps/web/lib/track-copy"

const event = { event: "install_copy", page: "/", component: "install-command" }

afterEach(() => {
  vi.unstubAllGlobals()
  window.history.replaceState(null, "", "/")
})

describe("aggregate copy events", () => {
  it("accepts only the fixed action, page and component combinations", () => {
    expect(parseCopyEvent(event)).toEqual(event)
    expect(parseCopyEvent({ event: "agent_prompt_copy", page: "/", component: "agent-prompt-button" })).not.toBeNull()
    for (const name of ["install_copy", "agent_prompt_copy", "theme_copy", "theme_share"]) {
      expect(parseCopyEvent({ event: name, page: "/theme", component: "theme-builder" })).not.toBeNull()
    }
    for (const body of [null, [], {}, { ...event, contents: "private" }, { ...event, page: "/?email=private" }, { ...event, page: "/made-up" }, { ...event, component: "theme-builder" }, { ...event, event: "theme_copy" }]) {
      expect(parseCopyEvent(body)).toBeNull()
    }
  })

  it("sends only fixed metadata without cookies, referrers, URL settings or clipboard data", () => {
    const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal("fetch", fetch)
    window.history.replaceState(null, "", "/theme?name=private&dialog=fade#private")
    trackCopy("agent_prompt_copy", "theme-builder")
    expect(fetch).toHaveBeenCalledOnce()
    expect(fetch).toHaveBeenCalledWith("/api/events", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ event: "agent_prompt_copy", page: "/theme", component: "theme-builder" }),
      credentials: "omit",
      referrerPolicy: "no-referrer",
      mode: "same-origin",
    }))
    trackCopy("theme_copy", "install-command")
    expect(fetch).toHaveBeenCalledOnce()
  })

  it("keeps collector failures independent of the clipboard UI", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")))
    expect(() => trackCopy("install_copy", "install-command")).not.toThrow()
    await Promise.resolve()
    vi.stubGlobal("fetch", () => { throw new Error("unavailable") })
    expect(() => trackCopy("install_copy", "install-command")).not.toThrow()
  })
})

describe("Google Analytics copy events", () => {
  it("sends all four successful actions with fixed metadata and no theme settings", () => {
    const gtag = vi.fn()
    vi.stubGlobal("gtag", gtag)
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })))
    window.history.replaceState(null, "", "/theme?name=private&dialog=fade#private")

    for (const name of ["install_copy", "agent_prompt_copy", "theme_copy", "theme_share"] as const) {
      trackCopy(name, "theme-builder")
      expect(gtag).toHaveBeenLastCalledWith("event", name, {
        send_to: "G-R8KDF02XF8",
        page_path: "/theme",
        component: "theme-builder",
      })
    }
    expect(gtag).toHaveBeenCalledTimes(4)
    trackCopy("theme_copy", "install-command")
    expect(gtag).toHaveBeenCalledTimes(4)
  })

  it("still sends GA events when the aggregate collector fails", () => {
    const gtag = vi.fn()
    vi.stubGlobal("gtag", gtag)
    vi.stubGlobal("fetch", () => { throw new Error("unavailable") })

    expect(() => trackCopy("install_copy", "install-command")).not.toThrow()
    expect(gtag).toHaveBeenCalledWith("event", "install_copy", {
      send_to: "G-R8KDF02XF8",
      page_path: "/",
      component: "install-command",
    })
  })

  it("keeps aggregate collection and successful copies working when GA fails", () => {
    const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal("fetch", fetch)
    vi.stubGlobal("gtag", () => { throw new Error("blocked") })

    expect(() => trackCopy("agent_prompt_copy", "agent-prompt-button")).not.toThrow()
    expect(fetch).toHaveBeenCalledOnce()
  })
})
