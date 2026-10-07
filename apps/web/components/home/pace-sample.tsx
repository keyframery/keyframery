"use client"

import Link from "next/link"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"

export function PaceSample() {
  const [pace, setPace] = React.useState(1)
  return (
    <section aria-labelledby="pace-title" className="mx-auto grid w-full max-w-[1200px] gap-10 px-4 pt-24 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-center md:gap-16 md:pt-36">
      <div>
        <h2 id="pace-title" className="text-[30px] leading-[1.1] font-semibold tracking-[-0.025em] md:text-[38px]">
          Set the speed like you set colours
        </h2>
        <p className="mt-4 max-w-[46ch] text-[17px] leading-relaxed text-muted-foreground">
          Speed, easing, travel and blur are CSS variables in your globals.css, next to your colours. Set them for the whole app or for one section. The{" "}
          <Link href="/theme" className="font-medium text-foreground underline underline-offset-4">
            Theme page
          </Link>{" "}
          writes them for you.
        </p>
      </div>
      <div className="grid gap-5 rounded-xl border bg-card p-5 shadow-xs sm:grid-cols-[1fr_auto] sm:items-center md:p-6" data-cut-pace={pace}>
        <div className="grid gap-3">
          <label htmlFor="pace" className="flex items-baseline justify-between text-sm font-medium">
            Pace <span className="font-mono text-[13px] font-normal text-muted-foreground tabular-nums">{pace.toFixed(1)}× duration</span>
          </label>
          <Slider id="pace" min={0.5} max={3} step={0.1} value={[pace]} onValueChange={(v) => setPace(Array.isArray(v) ? v[0] : v)} aria-label="Pace" />
          <code className="font-mono text-[13px] text-muted-foreground">{`:root { --kf-pace: ${pace.toFixed(1)}; }`}</code>
        </div>
        <Dialog>
          <DialogTrigger render={<Button variant="outline" />}>Open a dialog</DialogTrigger>
          <DialogContent>
            <DialogTitle>Paced at {pace.toFixed(1)}×</DialogTitle>
            <DialogDescription>This dialog opened from a section with data-cut-pace, so it plays at that speed.</DialogDescription>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  )
}
