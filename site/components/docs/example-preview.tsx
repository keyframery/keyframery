"use client"

import { RotateCcw } from "lucide-react"
import * as React from "react"

import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"
import { cn } from "@/lib/utils"
import { exampleLoaders } from "@site/lib/example-loaders"

/* One small example on a component page: the live example, and its code one click away. Unlike the
   demo at the top it doesn't play by itself; it is there to be clicked. */
export function ExamplePreview({ name, children }: { name: string; children?: React.ReactNode }) {
  const [view, setView] = React.useState("preview")
  const [run, setRun] = React.useState(0)
  const [Example, setExample] = React.useState<React.ComponentType | null>(null)

  React.useEffect(() => {
    let live = true
    exampleLoaders[name]?.().then((mod) => live && setExample(() => mod.default))
    return () => {
      live = false
    }
  }, [name])

  return (
    <div className="not-prose my-4 overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <SegmentedControl aria-label="Show" value={view} onValueChange={(v) => v && setView(v as string)}>
          <SegmentedControlItem value="preview">Preview</SegmentedControlItem>
          <SegmentedControlItem value="code">Code</SegmentedControlItem>
        </SegmentedControl>
        <button
          type="button"
          onClick={() => {
            setView("preview")
            setRun((n) => n + 1)
          }}
          aria-label="Reset the example"
          className="ml-auto grid size-8 place-items-center rounded-[9px] text-muted-foreground outline-none transition-[scale,background-color,color] duration-[calc(200ms*var(--kf-speed,1))] ease-pop hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:scale-90 motion-reduce:transition-none"
        >
          <RotateCcw aria-hidden="true" className="size-4" />
        </button>
      </div>
      <div className={cn(view !== "preview" && "hidden")}>
        <div className="stage-grid flex min-h-[240px] items-center justify-center overflow-x-auto p-6 max-sm:p-4">
          {Example ? (
            <div key={run} className="flex w-full min-w-0 justify-center">
              <Example />
            </div>
          ) : (
            <div aria-hidden className="size-5 animate-spin rounded-full border-2 border-foreground/15 border-t-foreground/50 motion-reduce:animate-none" />
          )}
        </div>
      </div>
      <div className={cn("max-h-[480px] overflow-auto [&_figure]:my-0 [&_figure]:rounded-none [&_figure]:border-0", view !== "code" && "hidden")}>{children}</div>
    </div>
  )
}
