"use client"

import { usePathname } from "next/navigation"
import * as React from "react"

import { sendEvent } from "@site/lib/send-event"

/* The referring site's host name, only when it is another site. Never the full URL. */
function referrerHost(): string | null {
  try {
    const host = document.referrer ? new URL(document.referrer).hostname.toLowerCase() : ""
    return host && host !== window.location.hostname ? host : null
  } catch {
    return null
  }
}

/**
 * Counts a page view on first load and on every client-side navigation (site/lib/beacon.ts). Sends the path only,
 * never the query string, plus the referrer's host on the first view. Renders nothing and never delays navigation.
 */
export function PageViews() {
  const path = usePathname()
  const last = React.useRef<string | null>(null)
  React.useEffect(() => {
    if (!path || last.current === path) return
    const first = last.current === null
    last.current = path
    const referrer = first ? referrerHost() : null
    sendEvent(referrer ? { type: "view", path, referrer } : { type: "view", path })
  }, [path])
  return null
}
