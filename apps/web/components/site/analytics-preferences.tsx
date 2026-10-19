"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { clarityPreference, CLARITY_PREFERENCE_EVENT, CLARITY_PREFERENCE_KEY, rememberClarityPreference } from "@/lib/clarity"

const snapshot = () => clarityPreference().state
const serverSnapshot = () => "off" as const
const subscribe = (update: () => void) => {
  const storage = (event: StorageEvent) => { if (event.key === CLARITY_PREFERENCE_KEY || event.key === null) update() }
  window.addEventListener(CLARITY_PREFERENCE_EVENT, update)
  window.addEventListener("storage", storage)
  return () => {
    window.removeEventListener(CLARITY_PREFERENCE_EVENT, update)
    window.removeEventListener("storage", storage)
  }
}

export function AnalyticsPreferences({ configured }: { configured: boolean }) {
  const preference = React.useSyncExternalStore(subscribe, snapshot, serverSnapshot)
  const [notice, setNotice] = React.useState("")
  const choose = (enabled: boolean) => {
    const saved = rememberClarityPreference(enabled)
    setNotice(saved ? enabled ? "Preference saved. Optional session analytics is allowed on public pages. After turning it off, reload a public page to enable it again." : "Optional session analytics is off. This site's Clarity cookies have been cleared." : "Your browser could not save this preference. Optional session analytics stays off on this page.")
  }

  return (
    <div className="grid gap-3 rounded-lg border bg-card p-4 text-sm" aria-label="Analytics preferences">
      <p>{configured ? `Optional session analytics: ${preference === "allowed" ? "allowed" : "off"}.` : "Optional session analytics is not configured and stays off."}</p>
      <p>Allow Microsoft Clarity to record masked page interactions for heatmaps and session replays. Advertising storage stays denied. Your choice is stored on this device for 180 days; you can turn it off here at any time.</p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" disabled={!configured || preference === "allowed"} onClick={() => choose(true)}>Allow optional analytics</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => choose(false)}>Turn off optional analytics</Button>
      </div>
      <p role="status">{notice || (preference === "unavailable" ? "Browser storage is unavailable. Optional session analytics stays off." : "Clarity sends no requests before you opt in.")}</p>
    </div>
  )
}
