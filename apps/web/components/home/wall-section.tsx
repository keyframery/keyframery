"use client"

/* "Try it on real screens": the wall, with its own switch, slow-mo and Director. None of them reach past the wall. */

import { track } from "@vercel/analytics"
import { useSearchParams } from "next/navigation"
import * as React from "react"

import { cn } from "@/lib/utils"

import { Director } from "./director"
import { Wall } from "./wall"

/** ?director=fast shortens the idle wait to 500 ms (used by the tests). */
function IdleDirector({ active, onActiveChange }: { active: boolean; onActiveChange: (on: boolean) => void }) {
  const fast = useSearchParams().get("director") === "fast"
  return <Director active={active} onActiveChange={onActiveChange} idleMs={fast ? 500 : 4000} />
}

const control =
  "rounded-md px-3 py-1.5 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"

export function WallSection() {
  const [stock, setStock] = React.useState(false)
  const [slow, setSlow] = React.useState(false)
  const [director, setDirector] = React.useState(false)
  const pick = (next: boolean) => {
    if (next === stock) return
    track("cuts_switch", { on: !next })
    setStock(next)
  }
  return (
    <section aria-labelledby="wall-title" className="pt-24 md:pt-36">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 pb-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-[600px]">
          <h2 id="wall-title" className="text-[30px] leading-[1.1] font-semibold tracking-[-0.025em] md:text-[38px]">
            Try it on real screens
          </h2>
          <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">
            Six app screens made of stock shadcn/ui components. Click anything. Switch Keyframery off to compare, or slow every cut down to watch it closely.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Motion on these screens" className="inline-flex rounded-lg border bg-card p-0.5">
            <button type="button" data-testid="wall-stock" aria-pressed={stock} onClick={() => pick(true)} className={cn(control, "aria-pressed:bg-foreground aria-pressed:text-background")}>
              shadcn/ui
            </button>
            <button type="button" data-testid="wall-kf" aria-pressed={!stock} onClick={() => pick(false)} className={cn(control, "aria-pressed:bg-foreground aria-pressed:text-background")}>
              Keyframery
            </button>
          </div>
          <button
            type="button"
            data-testid="slowmo"
            aria-pressed={slow}
            onClick={() => {
              track("slowmo", { on: !slow })
              setSlow(!slow)
            }}
            className={cn(control, "border border-transparent aria-pressed:border-border aria-pressed:bg-card aria-pressed:text-foreground")}
          >
            Slow-mo
          </button>
          <button
            type="button"
            data-testid="director"
            aria-pressed={director}
            onClick={() => setDirector(!director)}
            className={cn(control, "border border-transparent aria-pressed:border-border aria-pressed:bg-card aria-pressed:text-foreground")}
          >
            Play it for me
          </button>
        </div>
      </div>
      <Wall stock={stock} slow={slow} />
      <React.Suspense>
        <IdleDirector active={director} onActiveChange={setDirector} />
      </React.Suspense>
    </section>
  )
}
