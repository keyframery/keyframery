/**
 * Sends one page view or copy to /api/events (site/lib/beacon.ts) without waiting for it: sendBeacon when the
 * browser has it, a keepalive fetch otherwise. No cookies are set and nothing is kept in browser storage.
 * Skipped under automation (navigator.webdriver), so the site's and the lab's own browser tests are never counted.
 */
export function sendEvent(body: Record<string, string>): void {
  try {
    if (navigator.webdriver) return
    const data = JSON.stringify(body)
    if (typeof navigator.sendBeacon === "function" && navigator.sendBeacon("/api/events", data)) return
    void fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: data,
      credentials: "omit",
      mode: "same-origin",
      referrerPolicy: "no-referrer",
      keepalive: true,
    }).catch(() => {})
  } catch {
    // A blocked or failed collector never affects the page.
  }
}
