import { parseCopyEvent, type CopyComponent, type CopyEventName } from "./copy-events"

type AnalyticsWindow = Window & {
  gtag?: (command: "event", name: CopyEventName, parameters: { send_to: string; page_path: string; component: CopyComponent }) => void
}

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
  try {
    // The Google tag is loaded only in production. Keep both collectors independent.
    const analytics = window as AnalyticsWindow
    analytics.gtag?.("event", body.event, {
      send_to: "G-R8KDF02XF8",
      page_path: body.page,
      component: body.component,
    })
  } catch {
    // Blocked or unavailable analytics must not change a successful copy.
  }
}
