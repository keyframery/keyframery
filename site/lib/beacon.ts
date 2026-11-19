import { type CopyEvent, parseCopyEvent } from "./copy-events"

/* What the browser may send to /api/events (site/lib/send-event.ts), and how the route checks it.
   A view:  { "type": "view", "path": "/docs/installation" }, plus "referrer": "<host>" on a visit's first view.
   A copy:  { "type": "copy", "event": "install_copy", "page": "/", "component": "install-command" } */

export type Beacon = { type: "view"; path: string; referrer: string | null } | { type: "copy"; copy: CopyEvent }

const PATH = /^\/[A-Za-z0-9._~/-]{0,200}$/
const HOST = /^(?=.{1,253}$)[a-z0-9-]+(\.[a-z0-9-]+)+$/

export function parseBeacon(value: unknown): Beacon | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  const { type, ...rest } = value as Record<string, unknown>
  if (type === "view") {
    const keys = Object.keys(rest)
    if (keys.some((key) => key !== "path" && key !== "referrer")) return null
    const { path, referrer } = rest
    if (typeof path !== "string" || !PATH.test(path) || path.includes("..") || path.includes("//")) return null
    if (referrer !== undefined && (typeof referrer !== "string" || !HOST.test(referrer))) return null
    return { type: "view", path, referrer: (referrer as string | undefined) ?? null }
  }
  if (type === "copy") {
    const copy = parseCopyEvent(rest)
    return copy ? { type: "copy", copy } : null
  }
  return null
}

const MAX_BODY_BYTES = 1024
type BeaconRequest = { ok: true; beacon: Beacon } | { ok: false; status: 400 | 403 | 413 | 415 }

/**
 * Same-origin, small, JSON (sent as application/json or, by sendBeacon, as text/plain). The origin check stops
 * other sites' pages from writing; it does not make this public counter abuse-proof (see allowHit).
 */
export async function readBeacon(request: Request): Promise<BeaconRequest> {
  const origin = request.headers.get("origin")
  const site = request.headers.get("sec-fetch-site")
  if (origin !== new URL(request.url).origin || (site && site !== "same-origin")) return { ok: false, status: 403 }
  const type = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase()
  if (type !== "application/json" && type !== "text/plain") return { ok: false, status: 415 }
  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) return { ok: false, status: 413 }
  const reader = request.body?.getReader()
  if (!reader) return { ok: false, status: 400 }
  try {
    const decoder = new TextDecoder()
    let size = 0
    let text = ""
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > MAX_BODY_BYTES) {
        await reader.cancel()
        return { ok: false, status: 413 }
      }
      text += decoder.decode(value, { stream: true })
    }
    const beacon = parseBeacon(JSON.parse(text + decoder.decode()))
    return beacon ? { ok: true, beacon } : { ok: false, status: 400 }
  } catch {
    return { ok: false, status: 400 }
  } finally {
    reader.releaseLock()
  }
}

/* A simple per-visitor limit, kept in this server instance's memory: at most LIMIT hits a minute for one visitor
   code (or one shared bucket when there is none). A person browsing fast stays far below it. */
const WINDOW_MS = 60_000
const LIMIT = 30
const windows = new Map<string, { start: number; count: number }>()

export function allowHit(key: string | null, now: number = Date.now()): boolean {
  const id = key ?? "-"
  const current = windows.get(id)
  if (!current || now - current.start >= WINDOW_MS) {
    if (windows.size >= 10_000) for (const [k, w] of windows) if (now - w.start >= WINDOW_MS) windows.delete(k)
    if (windows.size >= 10_000) windows.clear()
    windows.set(id, { start: now, count: 1 })
    return true
  }
  current.count += 1
  return current.count <= LIMIT
}

/** The referring site's host name, unless it is this site itself (moving between our own pages is not a referral). */
export function externalReferrer(referrer: string | null, requestUrl: string): string | null {
  if (!referrer) return null
  return referrer === new URL(requestUrl).hostname ? null : referrer
}
