// @vitest-environment node
import { describe, expect, it } from "vitest"

import { readCopyEvent } from "../../apps/web/lib/copy-events"

const event = { event: "install_copy", page: "/", component: "install-command" }
const request = (body: unknown, headers: Record<string, string> = {}) => new Request("https://keyframery.com/api/events", {
  method: "POST",
  headers: { Origin: "https://keyframery.com", "Content-Type": "application/json", ...headers },
  body: JSON.stringify(body),
})

describe("copy collector request validation", () => {
  it("validates same-origin JSON before accepting any data", async () => {
    expect(await readCopyEvent(request(event, { "Sec-Fetch-Site": "same-origin" }))).toEqual({ ok: true, event })
    expect(await readCopyEvent(request(event, { Origin: "https://elsewhere.example" }))).toEqual({ ok: false, status: 403 })
    expect(await readCopyEvent(request(event, { Origin: "null" }))).toEqual({ ok: false, status: 403 })
    expect(await readCopyEvent(request(event, { Origin: "" }))).toEqual({ ok: false, status: 403 })
    expect(await readCopyEvent(request(event, { "Sec-Fetch-Site": "cross-site" }))).toEqual({ ok: false, status: 403 })
    expect(await readCopyEvent(request(event, { "Content-Type": "text/plain" }))).toEqual({ ok: false, status: 415 })
    expect(await readCopyEvent(request({ ...event, clipboard: "private" }))).toEqual({ ok: false, status: 400 })
  })

  it("caps the actual body even without a declared length, and rejects malformed JSON", async () => {
    expect(await readCopyEvent(request(event, { "Content-Length": "10000" }))).toEqual({ ok: false, status: 413 })
    expect(await readCopyEvent(request({ ...event, page: "x".repeat(600) }))).toEqual({ ok: false, status: 413 })
    const invalid = new Request("https://keyframery.com/api/events", { method: "POST", headers: { Origin: "https://keyframery.com", "Content-Type": "application/json" }, body: "{" })
    expect(await readCopyEvent(invalid)).toEqual({ ok: false, status: 400 })
  })
})
