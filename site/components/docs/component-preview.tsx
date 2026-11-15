"use client"

import { RotateCcw } from "lucide-react"
import * as React from "react"

import { MotionStyleSwitcher } from "@/components/ui/motion-style"
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"
import { cn } from "@/lib/utils"
import { Demo } from "@site/components/demo"

/* A component's live demo, with its example code one click away. The motion style switcher changes how
   the whole site moves (and remembers it), so the demo shows the component the way your app would. */
export function ComponentPreview({ slug, children }: { slug: string; children?: React.ReactNode }) {
  const [view, setView] = React.useState("preview")
  const [run, setRun] = React.useState(0)
  return (
    <div className="not-prose my-6 overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-3 py-2.5">
        {children ? (
          <SegmentedControl aria-label="Show" value={view} onValueChange={(v) => v && setView(v as string)}>
            <SegmentedControlItem value="preview">Preview</SegmentedControlItem>
            <SegmentedControlItem value="code">Code</SegmentedControlItem>
          </SegmentedControl>
        ) : (
          <span className="px-1 text-[13px] font-medium">Live demo</span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden text-[12.5px] text-muted-foreground sm:inline">Motion</span>
          <MotionStyleSwitcher />
          <button
            type="button"
            onClick={() => {
              setView("preview")
              setRun((n) => n + 1)
            }}
            aria-label="Replay the demo"
            className="grid size-8 place-items-center rounded-[9px] text-muted-foreground outline-none transition-[scale,background-color,color] duration-[calc(200ms*var(--kf-speed,1))] ease-pop hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:scale-90 motion-reduce:transition-none"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>
      <div className={cn(view !== "preview" && "hidden")}>
        <Demo key={run} slug={slug} className="stage-grid min-h-[460px]" pad={32} />
        <p className="border-t px-4 py-2.5 text-[12.5px] text-muted-foreground">The demo plays by itself. Point at it or press Tab to take over.</p>
      </div>
      <div className={cn("max-h-[560px] overflow-auto [&_figure]:my-0 [&_figure]:rounded-none [&_figure]:border-0", view !== "code" && "hidden")}>{children}</div>
    </div>
  )
}

/* Two demos under one switcher, for the motion styles page. */
export function MotionStylePlayground({ slugs = ["switch", "segmented-control"] }: { slugs?: string[] }) {
  return (
    <div className="not-prose my-6 overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-wrap items-center gap-3 border-b px-3 py-2.5">
        <span className="text-[13px] font-medium">Motion style</span>
        <MotionStyleSwitcher />
        <span className="text-[12.5px] text-muted-foreground">Changes the whole site, and is remembered.</span>
      </div>
      <div className="grid gap-px bg-border sm:grid-cols-2">
        {slugs.map((slug) => (
          <Demo key={slug} slug={slug} className="stage-grid min-h-[340px]" pad={24} />
        ))}
      </div>
    </div>
  )
}
