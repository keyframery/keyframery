"use client"

import * as React from "react"

import built from "@site/lib/github-stars.generated.json"

/* The repo's live star count, shared by every place that shows it (header, docs sidebar, star prompt).
   The page renders with the count written at build time (scripts/stamp-stars.mjs), so the server HTML and the
   first client render match and nothing shifts. Then the visitor's browser asks GitHub once for the current
   count. That costs the site no request and no function call; GitHub allows 60 of these an hour per visitor,
   and the answer is kept in sessionStorage for five minutes so moving between pages doesn't ask again. If
   GitHub can't be reached, the build count stays. */
const API = "https://api.github.com/repos/keyframery/keyframery"
const KEY = "kf-github-stars"
const FRESH_FOR = 5 * 60_000

const builtCount = typeof built.stars === "number" ? built.stars : null
let current = builtCount
let started = false
const listeners = new Set<() => void>()

function set(stars: number) {
  if (stars === current) return
  current = stars
  for (const listener of listeners) listener()
}

function refresh() {
  if (started) return
  started = true
  try {
    const cached = JSON.parse(window.sessionStorage.getItem(KEY) ?? "null") as { stars?: unknown; at?: unknown } | null
    if (cached && typeof cached.stars === "number" && typeof cached.at === "number" && Date.now() - cached.at < FRESH_FOR) {
      set(cached.stars)
      return
    }
  } catch {
    // Storage blocked: ask GitHub instead.
  }
  fetch(API, { headers: { Accept: "application/vnd.github+json" } })
    .then((res) => (res.ok ? res.json() : null))
    .then((data: { stargazers_count?: unknown } | null) => {
      if (typeof data?.stargazers_count !== "number") return
      set(data.stargazers_count)
      try {
        window.sessionStorage.setItem(KEY, JSON.stringify({ stars: data.stargazers_count, at: Date.now() }))
      } catch {
        // Nothing to keep it in; the next page asks again.
      }
    })
    .catch(() => {
      // Offline or rate-limited: the build count stays.
    })
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  refresh()
  return () => {
    listeners.delete(listener)
  }
}

export function useGitHubStars() {
  return React.useSyncExternalStore(
    subscribe,
    () => current,
    () => builtCount,
  )
}

/* The next round number to ask for: 50, then 100, 200, 300, 400, 500, then 1,000, 2,000 … 5,000, 10,000 and on. */
export function nextStarGoal(stars: number) {
  if (stars < 50) return 50
  for (let base = 100; ; base *= 10) for (const step of [1, 2, 3, 4, 5]) if (base * step > stars) return base * step
}

export const formatStars = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "")}k` : String(n))
