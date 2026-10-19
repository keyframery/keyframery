/** Fixed aggregate actions: no clipboard contents, query strings, referrers or visitor identifiers. */
export const COPY_EVENTS = ["install_copy", "agent_prompt_copy", "theme_copy", "theme_share"] as const
export type CopyEventName = (typeof COPY_EVENTS)[number]
export type CopyComponent = "install-command" | "agent-prompt-button" | "theme-builder"
export type CopyEvent = { event: CopyEventName; page: "/" | "/theme"; component: CopyComponent }

/** Allow only combinations actually emitted by the site, keeping storage cardinality bounded. */
export function parseCopyEvent(value: unknown): CopyEvent | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  const fields = Object.keys(value)
  if (fields.length !== 3 || fields.some((key) => !["event", "page", "component"].includes(key))) return null
  const { event, page, component } = value as Record<string, unknown>
  if (page === "/" && ((component === "install-command" && event === "install_copy") || (component === "agent-prompt-button" && event === "agent_prompt_copy"))) {
    return { event, page, component }
  }
  if (page === "/theme" && component === "theme-builder" && COPY_EVENTS.includes(event as CopyEventName)) {
    return { event: event as CopyEventName, page, component }
  }
  return null
}

const MAX_BODY_BYTES = 512
type CopyRequest = { ok: true; event: CopyEvent } | { ok: false; status: 400 | 403 | 413 | 415 }

/** Origin + JSON requirements reject browser cross-site writes; this public counter is not abuse-proof. */
export async function readCopyEvent(request: Request): Promise<CopyRequest> {
  const origin = request.headers.get("origin")
  const site = request.headers.get("sec-fetch-site")
  if (origin !== new URL(request.url).origin || (site && site !== "same-origin")) return { ok: false, status: 403 }
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") return { ok: false, status: 415 }
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
    const event = parseCopyEvent(JSON.parse(text + decoder.decode()))
    return event ? { ok: true, event } : { ok: false, status: 400 }
  } catch {
    return { ok: false, status: 400 }
  } finally {
    reader.releaseLock()
  }
}
