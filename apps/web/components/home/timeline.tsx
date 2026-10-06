"use client"

/*
 * The editing timeline: every cut that plays on the page lands here as a clip on its track, sized by
 * its duration, under a running playhead. The switch, slow-mo and Director live in its header.
 */

import * as React from "react"

import { useCutsControl } from "@/app/cuts-control"
import { cn } from "@/lib/utils"

type Clip = { id: number; track: Track; label: string; at: number; ms: number }
type Track = "top" | "switch" | "match" | "list" | "value" | "load"

const TRACKS: { id: Track; name: string }[] = [
  { id: "top", name: "On top" },
  { id: "switch", name: "Switch" },
  { id: "match", name: "Match" },
  { id: "list", name: "List" },
  { id: "value", name: "Value" },
  { id: "load", name: "Load" },
]
const WINDOW_MS = 8000 // how much time the timeline shows
const NAMES: Record<string, string> = {
  "rack-focus": "Rack focus",
  "punch-in": "Punch-in",
  fade: "Fade",
  "slide-sink": "Slide",
  slide: "Slide",
  "j-cut": "J-cut",
  whip: "Whip",
  "cut-on-action": "Cut on action",
  tuned: "Tuned",
  "match-cut": "Match cut",
  rise: "Rise",
  "l-cut": "L-cut",
  glide: "Glide",
  dissolve: "Dissolve",
}

function trackOf(component: string): Track {
  if (component === "tabs") return "switch"
  if (component === "match") return "match"
  if (component === "list") return "list"
  if (component === "value") return "value"
  if (component === "load") return "load"
  return "top"
}

export function timecode(ms: number) {
  const frames = Math.floor((ms / 1000) * 24)
  const ff = frames % 24
  const s = Math.floor(frames / 24)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(ff)}`
}

export function Timeline({ director, onDirector }: { director: boolean; onDirector: (on: boolean) => void }) {
  const { enabled, setEnabled, pace, setPace } = useCutsControl()
  const [clips, setClips] = React.useState<Clip[]>([])
  const [now, setNow] = React.useState(0)
  const start = React.useRef(0)
  const nextId = React.useRef(0)

  React.useEffect(() => {
    start.current = performance.now()
    const onCut = (e: Event) => {
      const d = (e as CustomEvent<{ cut: string; component: string; ms: number }>).detail
      const at = performance.now() - start.current
      setClips((cs) => [...cs.filter((c) => at - c.at < WINDOW_MS), { id: nextId.current++, track: trackOf(d.component), label: NAMES[d.cut] ?? d.cut, at, ms: d.ms }])
    }
    document.addEventListener("keyframery:cut", onCut)
    return () => document.removeEventListener("keyframery:cut", onCut)
  }, [])

  React.useEffect(() => {
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches
    let raf = 0
    const tick = () => {
      setNow(performance.now() - start.current)
      raf = requestAnimationFrame(tick)
    }
    if (still) {
      const t = setInterval(() => setNow(performance.now() - start.current), 1000)
      return () => clearInterval(t)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const left = (at: number) => `${((at - (now - WINDOW_MS)) / WINDOW_MS) * 100}%`
  const width = (ms: number) => `max(${(ms / WINDOW_MS) * 100}%, 4px)`

  return (
    <section aria-label="Cut timeline" className="sticky bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-5 gap-y-1.5 px-4 py-2 text-sm">
        <span className="flex items-center gap-2 font-mono text-[13px] tabular-nums" aria-live="off">
          <span aria-hidden="true" className="size-2 rounded-full bg-playhead" />
          <span data-testid="timecode">{timecode(now)}</span>
        </span>
        <label className="flex items-center gap-2">
          <span className={cn(!enabled ? "text-foreground" : "text-muted-foreground")}>Jump cuts</span>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-label="Keyframery cuts"
            data-testid="cuts-switch"
            onClick={() => setEnabled(!enabled)}
            className="relative h-5 w-9 rounded-full bg-muted outline-none ring-ring/50 transition-colors focus-visible:ring-3 aria-checked:bg-foreground"
          >
            <span className={cn("absolute top-0.5 left-0.5 size-4 rounded-full bg-background shadow-sm transition-transform", enabled && "translate-x-4")} />
          </button>
          <span className={cn(enabled ? "text-foreground" : "text-muted-foreground")}>Keyframery</span>
        </label>
        <button type="button" data-testid="slowmo" aria-pressed={pace === 4} onClick={() => setPace(pace === 4 ? undefined : 4)} className="rounded-md px-2 py-1 text-muted-foreground hover:bg-muted aria-pressed:bg-muted aria-pressed:text-foreground">
          Slow-mo
        </button>
        <button type="button" data-testid="director" aria-pressed={director} onClick={() => onDirector(!director)} className="rounded-md px-2 py-1 text-muted-foreground hover:bg-muted aria-pressed:bg-muted aria-pressed:text-foreground">
          Director
        </button>
        <span className="ml-auto hidden text-muted-foreground md:inline">Click anything above. Every cut lands here.</span>
      </div>
      <div className="mx-auto max-w-[1200px] px-4 pb-2.5">
        <div className="relative overflow-hidden rounded-md border bg-card">
          {TRACKS.map((t, i) => (
            <div key={t.id} className={cn("relative flex h-[18px] items-center border-b last:border-b-0", i > 0 && "max-md:hidden")}>
              <span className="z-10 w-16 shrink-0 border-r bg-card px-2 text-[10.5px] leading-[17px] text-muted-foreground">{i === 0 ? <span className="md:hidden">Cuts</span> : null}<span className={i === 0 ? "max-md:hidden" : ""}>{t.name}</span></span>
              <div className="relative h-full flex-1">
                {clips
                  .filter((c) => c.track === t.id || (i === 0 && typeof window !== "undefined" && window.innerWidth < 768))
                  .map((c) => (
                    <span
                      key={c.id}
                      data-clip=""
                      data-track={c.track}
                      className="absolute top-0.5 bottom-0.5 overflow-hidden rounded-[3px] bg-foreground/85 px-1.5 text-[10px] leading-[13px] whitespace-nowrap text-background"
                      style={{ left: left(c.at), width: width(c.ms) }}
                    >
                      {c.label} {c.ms}
                    </span>
                  ))}
              </div>
            </div>
          ))}
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-px bg-playhead" />
        </div>
      </div>
    </section>
  )
}
