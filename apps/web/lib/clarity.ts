/** Optional Clarity support. Nothing contacts Microsoft until a visitor explicitly opts in. */
export const CLARITY_PREFERENCE_KEY = "keyframery:clarity:v1"
export const CLARITY_PREFERENCE_EVENT = "keyframery:analytics-preference"
export const CLARITY_PREFERENCE_TTL = 180 * 24 * 60 * 60 * 1000
export const CLARITY_SCRIPT_ID = "keyframery-clarity"

type Preference = { enabled: boolean; expiresAt: number }
export type PreferenceState = "allowed" | "off" | "unavailable"
type Consent = { analytics_Storage: "granted" | "denied"; ad_Storage: "denied" }
type Command = ["consentv2", Consent] | ["stop"]
type ClarityApi = ((...command: Command) => void) & { q?: Command[]; v?: string; t?: boolean }

declare global {
  interface Window { clarity?: ClarityApi }
}

/** The project ID is public, but configuration stays server-side and previews are always excluded. */
export function configuredClarityId(env: Record<string, string | undefined> = process.env): string | null {
  const id = env.CLARITY_PROJECT_ID?.trim()
  return env.VERCEL_ENV === "production" && id && /^[a-z0-9]{1,32}$/i.test(id) ? id : null
}

export function parseClarityPreference(raw: string | null, now = Date.now()): Preference | null {
  try {
    const value: unknown = JSON.parse(raw ?? "null")
    if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).length !== 2) return null
    const { enabled, expiresAt } = value as Record<string, unknown>
    if (typeof enabled !== "boolean" || typeof expiresAt !== "number" || !Number.isSafeInteger(expiresAt) || expiresAt <= now || expiresAt > now + CLARITY_PREFERENCE_TTL) return null
    return { enabled, expiresAt }
  } catch {
    return null
  }
}

let storageFailed = false

export function clarityPreference(): { state: PreferenceState; expiresAt?: number } {
  if (storageFailed) return { state: "unavailable" }
  try {
    const value = parseClarityPreference(localStorage.getItem(CLARITY_PREFERENCE_KEY))
    return value?.enabled ? { state: "allowed", expiresAt: value.expiresAt } : { state: "off" }
  } catch {
    return { state: "unavailable" }
  }
}

/** A failed storage operation fails closed for this document, including an unsuccessful revocation write. */
export function rememberClarityPreference(enabled: boolean): boolean {
  let saved = false
  try {
    if (!enabled) localStorage.removeItem(CLARITY_PREFERENCE_KEY)
    localStorage.setItem(CLARITY_PREFERENCE_KEY, JSON.stringify({ enabled, expiresAt: Date.now() + CLARITY_PREFERENCE_TTL }))
    saved = true
  } catch {
    // A blocked store cannot safely persist an opt-in.
  }
  storageFailed = !saved
  window.dispatchEvent(new Event(CLARITY_PREFERENCE_EVENT))
  return saved
}

export function canLoadClarity(projectId: string | null, pathname: string, hostname: string): boolean {
  return Boolean(projectId && /^[a-z0-9]{1,32}$/i.test(projectId) && ["keyframery.com", "www.keyframery.com"].includes(hostname) && !isClarityExcludedPath(pathname))
}

export function isClarityExcludedPath(pathname: string): boolean {
  try { return /^\/admin(?:\/|$)/i.test(decodeURIComponent(pathname)) } catch { return true }
}

function clearClarityCookies() {
  // Clear this site's cookies, including the parent-domain form. Microsoft-domain cookies cannot be
  // deleted from this origin; ad storage remains denied and the stopped document cannot resume collection.
  const parts = window.location.hostname.split(".")
  const domains = ["", ...parts.slice(0, -1).map((_, index) => `; Domain=${parts.slice(index).join(".")}`)]
  for (const name of ["_clck", "_clsk"]) for (const domain of domains) {
    try { document.cookie = `${name}=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/${domain}; SameSite=Lax` } catch { /* Storage restrictions must not break revocation. */ }
  }
}

/** One controller per document. After withdrawal/admin entry, only a full new page load can start again. */
export function createClarityController() {
  let started = false
  let stopped = false
  let script: HTMLScriptElement | null = null

  const signalStop = () => {
    const clarity = window.clarity
    if (clarity?.q) clarity.q.length = 0 // Revoke an opt-in queued while the external script was still loading.
    // Stop FIRST: denying consent while active schedules Microsoft's cookieless runtime to restart.
    // An active stop replaces window.clarity with an inactive queue (Microsoft's queue.ts).
    try { clarity?.("stop") } catch { /* Cookie cleanup still runs if a blocked vendor script fails. */ }
    const inactive = window.clarity
    if (inactive?.q) inactive.q.length = 0
    // Both Microsoft's tag bootstrap and runtime queue.process check v/t before starting. An inert
    // document sentinel also blocks a late tag from prepending a new start ahead of the denied queue.
    const disabled: ClarityApi = () => {}
    disabled.q = [["consentv2", { analytics_Storage: "denied", ad_Storage: "denied" }], ["stop"]]
    disabled.v = "keyframery-disabled"
    disabled.t = true
    window.clarity = disabled
    clearClarityCookies()
  }

  const stop = () => {
    if (!started || stopped) { clearClarityCookies(); return }
    stopped = true
    script?.remove()
    signalStop()
  }

  return {
    sync(projectId: string | null, pathname: string, hostname: string, allowed: boolean) {
      if (!allowed || !canLoadClarity(projectId, pathname, hostname)) { stop(); return }
      if (started || stopped) return
      started = true
      const queued: ClarityApi = (...command) => { queued.q?.push(command) }
      queued.q = []
      window.clarity ??= queued
      window.clarity("consentv2", { analytics_Storage: "granted", ad_Storage: "denied" })
      if (document.getElementById(CLARITY_SCRIPT_ID)) return
      script = document.createElement("script")
      script.id = CLARITY_SCRIPT_ID
      script.async = true
      script.referrerPolicy = "no-referrer"
      script.src = `https://www.clarity.ms/tag/${projectId}`
      script.onload = () => { if (stopped) signalStop() }
      document.head.append(script)
    },
    stop,
  }
}
