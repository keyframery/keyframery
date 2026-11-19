import { parseCopyEvent } from "./copy-events"
import { sendEvent } from "./send-event"

type AnalyticsWindow = Window & { gtag?: (command: "event", name: string, parameters: Record<string, string>) => void }

/**
 * Counts a successful copy, in Google Analytics and in the site's own counts (/api/events, site/lib/usage.ts).
 * Call only after writeText resolves; a blocked or failed collector must not change the copy.
 */
export function trackCopy(event: "agent_prompt_copy" | "install_copy", component: string): void {
  try {
    const copy = parseCopyEvent({ event, page: window.location.pathname, component })
    if (copy) sendEvent({ type: "copy", ...copy })
  } catch {
    // Network restrictions or a disabled collector do not affect the copy.
  }
  try {
    ;(window as AnalyticsWindow).gtag?.("event", event, { send_to: "G-R8KDF02XF8", page_path: window.location.pathname, component })
  } catch {
    // Blocked or unavailable analytics must not change a successful copy.
  }
}
