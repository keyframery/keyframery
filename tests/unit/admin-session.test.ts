import { describe, expect, it } from "vitest"

import { adminPassword, createSession, passwordMatches, SESSION_HOURS, sessionValid } from "../../apps/web/lib/admin/session"

const PASSWORD = "correct-horse-battery-staple-42"

describe("admin session", () => {
  it("stays closed without a long enough password", () => {
    expect(adminPassword({})).toBeNull()
    expect(adminPassword({ KEYFRAMERY_ADMIN_PASSWORD: "short" })).toBeNull()
    expect(adminPassword({ KEYFRAMERY_ADMIN_PASSWORD: PASSWORD })).toBe(PASSWORD)
  })

  it("matches only the exact password", () => {
    expect(passwordMatches(PASSWORD, PASSWORD)).toBe(true)
    expect(passwordMatches(PASSWORD + " ", PASSWORD)).toBe(false)
    expect(passwordMatches("", PASSWORD)).toBe(false)
  })

  it("accepts its own cookie until it expires", () => {
    const now = Date.UTC(2026, 9, 16)
    const { value, expires } = createSession(PASSWORD, now)
    expect(expires.getTime()).toBe(now + SESSION_HOURS * 3_600_000)
    expect(sessionValid(value, PASSWORD, now + 1000)).toBe(true)
    expect(sessionValid(value, PASSWORD, expires.getTime())).toBe(false)
  })

  it("rejects forged, edited or stale cookies", () => {
    const now = Date.UTC(2026, 9, 16)
    const { value } = createSession(PASSWORD, now)
    const [expires, signature] = value.split(".")
    expect(sessionValid(`${Number(expires) + 1}.${signature}`, PASSWORD, now)).toBe(false)
    expect(sessionValid(`${expires}.${signature.slice(1)}`, PASSWORD, now)).toBe(false)
    expect(sessionValid(value, "a-different-password-of-good-length", now)).toBe(false)
    expect(sessionValid(value, null, now)).toBe(false)
    expect(sessionValid(undefined, PASSWORD, now)).toBe(false)
    expect(sessionValid("garbage", PASSWORD, now)).toBe(false)
  })
})
