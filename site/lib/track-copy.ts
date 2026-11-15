type AnalyticsWindow = Window & { gtag?: (command: "event", name: string, parameters: Record<string, string>) => void }

/** Counts a successful copy. Call only after writeText resolves; a blocked or missing analytics script must not change the copy. */
export function trackCopy(event: "agent_prompt_copy" | "install_copy", component: string): void {
  try {
    ;(window as AnalyticsWindow).gtag?.("event", event, { send_to: "G-R8KDF02XF8", page_path: window.location.pathname, component })
  } catch {
    // Blocked or unavailable analytics must not change a successful copy.
  }
}
