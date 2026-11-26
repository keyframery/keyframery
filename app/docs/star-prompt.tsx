"use client"

import { Star } from "lucide-react"
import * as React from "react"

import { GitHubIcon } from "@site/components/github-icon"
import { REPO } from "@site/lib/shared"
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

/* A one-time ask for a GitHub star, on the docs only, in the middle of the screen. It opens after a visitor
   has spent 12 seconds in the docs (the timer keeps running across page changes, since this lives in the
   docs layout) and never comes back once shown: the flag is written the moment it opens, so closing it
   counts as an answer. With storage blocked (private windows) it stays away rather than asking on every
   visit. It is Keyframery's own Dialog, so Escape, a press outside and focus all behave. Shown, star and
   dismiss are counted in Google Analytics. */
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
const remember = (value: string) => {
  try {
    window.localStorage.setItem(KEY, value)
    return true
  } catch {
    return false
  }
}

export function StarPrompt() {
  const [open, setOpen] = React.useState(false)
  const starred = React.useRef(false)

  React.useEffect(() => {
    let asked: string | null
    try {
      asked = window.localStorage.getItem(KEY)
    } catch {
      return
    }
    if (asked) return
    const timer = window.setTimeout(() => {
      if (!remember("shown")) return
      setOpen(true)
      track("star_prompt_shown")
    }, DELAY)
    return () => window.clearTimeout(timer)
  }, [])

  const onOpenChange = (next: boolean) => {
    setOpen(next)
    if (next || starred.current) return
    remember("dismiss")
    track("star_prompt_dismiss")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogBackdrop />
      <DialogContent initialFocus="content" className="[--dialog-width:380px]">
        <DialogHeader className="items-center pr-0 text-center">
          <span aria-hidden className="mb-2 grid size-11 place-items-center rounded-2xl bg-muted">
            <GitHubIcon className="size-5" />
          </span>
          <DialogTitle>Like Keyframery?</DialogTitle>
          <DialogDescription>It's free and open source. A star on GitHub helps other developers find it.</DialogDescription>
        </DialogHeader>
        <DialogFooter className="justify-center">
          <DialogClose>Not now</DialogClose>
          <a
            href={REPO}
            target="_blank"
            rel="noreferrer noopener"
            onClick={() => {
              starred.current = true
              remember("star")
              track("star_prompt_click")
              setOpen(false)
            }}
            className="inline-flex h-8 items-center gap-1.5 rounded-[9px] bg-foreground px-3 text-[13px] font-medium text-background outline-none transition-[opacity] hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover"
          >
            <Star aria-hidden className="size-3.5" />
            Star on GitHub
          </a>
        </DialogFooter>
        <DialogClose variant="icon" />
      </DialogContent>
    </Dialog>
  )
}
