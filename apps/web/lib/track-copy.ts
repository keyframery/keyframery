import { parseCopyEvent, type CopyComponent, type CopyEventName } from "./copy-events"

/** Call only after writeText resolves. Collection failures must not change a successful clipboard action. */
export function trackCopy(event: CopyEventName, component: CopyComponent): void {
  const body = parseCopyEvent({ event, page: window.location.pathname, component })
  if (!body) return
  try {
    void fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "omit",
      mode: "same-origin",
      referrerPolicy: "no-referrer",
      keepalive: true,
    }).catch(() => {})
  } catch {
    // Network restrictions or a disabled collector do not affect the copy.
  }
}
