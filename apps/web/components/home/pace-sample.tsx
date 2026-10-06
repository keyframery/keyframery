"use client"

import Link from "next/link"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"

export function PaceSample() {
  const [pace, setPace] = React.useState(1)
  return (
    <section className="mx-auto grid w-full max-w-[1200px] gap-8 px-4 py-14 md:grid-cols-[1fr_1.15fr] md:items-center md:gap-12">
      <div>
      <h2 className="text-[28px] font-semibold tracking-[-0.02em]">Theme motion the way you theme colour</h2>
      <p className="mt-3 max-w-[60ch] text-muted-foreground">
        Pace, easing, travel and blur are CSS variables. Set them in globals.css for the whole app, or on any section. The <Link href="/theme" className="underline underline-offset-4">Theme page</Link> builds them for you.
      </p>
      </div>
      <div className="grid gap-4 rounded-lg border bg-card p-4 md:grid-cols-[1fr_auto] md:items-center" data-cut-pace={pace}>
        <div className="grid gap-2">
          <label htmlFor="pace" className="text-sm">Pace: {pace.toFixed(1)}×</label>
          <Slider id="pace" min={0.5} max={3} step={0.1} value={[pace]} onValueChange={(v) => setPace(Array.isArray(v) ? v[0] : v)} aria-label="Pace" />
          <code className="font-mono text-[13px] text-muted-foreground">{`:root { --kf-pace: ${pace.toFixed(1)}; }`}</code>
        </div>
        <Dialog>
          <DialogTrigger render={<Button variant="outline" />}>Open a dialog</DialogTrigger>
          <DialogContent>
            <DialogTitle>Paced at {pace.toFixed(1)}×</DialogTitle>
            <DialogDescription>This dialog was opened from a section with data-cut-pace, so it plays at that pace.</DialogDescription>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  )
}
