"use client"

import { usePathname } from "next/navigation"
import * as React from "react"

import { clarityPreference, CLARITY_PREFERENCE_EVENT, CLARITY_PREFERENCE_KEY, createClarityController, isClarityExcludedPath } from "@/lib/clarity"

/** Mounted once in the root layout; layout effects stop recording before admin DOM observers run. */
export function ClarityAnalytics({ projectId }: { projectId: string | null }) {
  const pathname = usePathname()
  const controller = React.useMemo(() => createClarityController(), [])

  React.useLayoutEffect(() => {
    let expiry: ReturnType<typeof setTimeout> | undefined
    const sync = () => {
      clearTimeout(expiry)
      const preference = clarityPreference()
      controller.sync(projectId, window.location.pathname, window.location.hostname, preference.state === "allowed")
      if (preference.expiresAt) expiry = setTimeout(() => window.dispatchEvent(new Event(CLARITY_PREFERENCE_EVENT)), Math.min(preference.expiresAt - Date.now() + 1, 2_147_483_647))
    }
    const storage = (event: StorageEvent) => { if (event.key === CLARITY_PREFERENCE_KEY || event.key === null) sync() }
    const beforeAdmin = (event: MouseEvent) => {
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null
      if (!anchor) return
      try {
        const target = new URL(anchor.getAttribute("href")!, window.location.href)
        if (target.origin === window.location.origin && isClarityExcludedPath(target.pathname)) controller.stop()
      } catch { /* Invalid links must not affect analytics preferences or navigation. */ }
    }
    sync()
    window.addEventListener(CLARITY_PREFERENCE_EVENT, sync)
    window.addEventListener("storage", storage)
    window.addEventListener("popstate", sync)
    document.addEventListener("click", beforeAdmin, true)
    return () => {
      clearTimeout(expiry)
      window.removeEventListener(CLARITY_PREFERENCE_EVENT, sync)
      window.removeEventListener("storage", storage)
      window.removeEventListener("popstate", sync)
      document.removeEventListener("click", beforeAdmin, true)
    }
  }, [controller, pathname, projectId])

  return null
}
