"use client"

import { Star, X } from "lucide-react"
import * as React from "react"

import { GitHubIcon } from "@site/components/github-icon"
import { REPO } from "@site/lib/shared"

/* A one-time ask for a GitHub star, on the docs only. It appears after a visitor has spent 12 seconds in the
   docs (the timer keeps running across page changes, since this lives in the docs layout), sits in the corner
   without taking focus, and never comes back once shown: the flag is written the moment it appears, so
   ignoring it counts as an answer. With storage blocked (private windows) it stays away rather than asking
   on every visit. Shown, star and dismiss are counted in Google Analytics. */
const KEY = "kf-star-prompt"
const DELAY = 12_000

type AnalyticsWindow = Window & { gtag?: (command: "event", name: string, parameters: Record<string, string>) => void }
const track = (name: string) => {
  try {
    ;(window as AnalyticsWindow).gtag?.("event", name, { send_to: "G-R8KDF02XF8", page_path: window.location.pathname })
  } catch {
    // Blocked analytics never changes the prompt.
  }
}

export function StarPrompt() {
  const [open, setOpen] = React.useState(false)
  const [leaving, setLeaving] = React.useState(false)

  React.useEffect(() => {
    let asked: string | null
    try {
      asked = window.localStorage.getItem(KEY)
    } catch {
      return
    }
    if (asked) return
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(KEY, "shown")
      } catch {
        return
      }
      setOpen(true)
      track("star_prompt_shown")
    }, DELAY)
    return () => window.clearTimeout(timer)
  }, [])

  const close = React.useCallback((reason: "star" | "dismiss") => {
    try {
      window.localStorage.setItem(KEY, reason)
    } catch {
      // Already marked as shown.
    }
    track(reason === "star" ? "star_prompt_click" : "star_prompt_dismiss")
    setLeaving(true)
    window.setTimeout(() => setOpen(false), 220)
  }, [])

  React.useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close("dismiss")
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, close])

  if (!open) return null
  return (
    <aside
      aria-label="Star Keyframery on GitHub"
      data-leaving={leaving || undefined}
      className={[
        "fixed z-50 max-sm:inset-x-3 max-sm:bottom-3 sm:right-5 sm:bottom-5 sm:w-[340px]",
        "rounded-2xl bg-popover p-4 text-popover-foreground",
        "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_6px_-2px_rgb(0_0_0/0.08),0_16px_40px_-12px_rgb(0_0_0/0.25)]",
        "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_16px_40px_-12px_rgb(0_0_0/0.8)]",
        "transition-[opacity,translate] duration-[calc(320ms*var(--kf-speed,1))] ease-house",
        "starting:translate-y-2 starting:opacity-0 data-leaving:translate-y-2 data-leaving:opacity-0",
        "motion-reduce:transition-none",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted">
          <GitHubIcon className="size-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold leading-tight tracking-tight">Like Keyframery?</p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            It's free and open source. A star on GitHub helps other developers find it.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <a
              href={REPO}
              target="_blank"
              rel="noreferrer noopener"
              onClick={() => close("star")}
              className="inline-flex h-8 items-center gap-1.5 rounded-[9px] bg-foreground px-3 text-[13px] font-medium text-background outline-none transition-[opacity] hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover"
            >
              <Star aria-hidden className="size-3.5" />
              Star on GitHub
            </a>
            <button
              type="button"
              onClick={() => close("dismiss")}
              className="inline-flex h-8 items-center rounded-[9px] px-3 text-[13px] font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => close("dismiss")}
          aria-label="Close"
          className="-mt-1 -mr-1 grid size-7 shrink-0 place-items-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X aria-hidden className="size-4" />
        </button>
      </div>
    </aside>
  )
}
