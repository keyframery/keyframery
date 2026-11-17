"use client"

import * as React from "react"
import { RotateCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAutoplay } from "@/lib/autoplay"
import type { ControlValues } from "@/lib/controls"
import { Speed } from "@/lib/keyframery"
import { cn } from "@/lib/utils"
import { demoLoaders } from "@site/lib/demo-loaders"
import type { DemoModule } from "@site/lib/demo-types"

/* A live demo plays once when first seen. Replay starts it again with its current customization.
   A visitor can take over through the component's own UI SDK interactions at any time.

   Demos are fluid: in a narrow box (a phone) each one switches to its own narrow layout through
   container queries. Only if a demo still cannot fit (a fixed-height grid cell) is it scaled down
   with CSS zoom instead of being cut off. On a phone the box's padding tightens to 16px. */
export function DemoFrame({
  demo,
  slug,
  className,
  pad = 24,
  fitHeight = false,
  values,
  speed,
  replay = true,
}: {
  demo: DemoModule | null
  slug: string
  className?: string
  pad?: number
  /** The box has a fixed height: scale the demo down to fit that too. */
  fitHeight?: boolean
  /** Values from the Customize panel, passed to the demo as props. */
  values?: ControlValues
  /** The duration multiplier from the Customize panel. Leave it out for the motion style's own pace. */
  speed?: number
  /** Comparison stages can provide one shared replay button for both examples. */
  replay?: boolean
}) {
  const [run, setRun] = React.useState(0)
  const box = React.useRef<HTMLDivElement>(null)
  const fit = React.useRef<HTMLDivElement>(null)
  useAutoplay(box, demo?.play, run)

  React.useEffect(() => {
    const outer = box.current
    const inner = fit.current
    if (!outer || !inner || !demo) return
    const measure = () => {
      const p = outer.clientWidth < 440 ? Math.min(pad, 16) : pad
      outer.style.padding = `${p}px`
      inner.style.zoom = "1"
      const wide = (outer.clientWidth - p * 2) / inner.scrollWidth
      const tall = fitHeight ? (outer.clientHeight - p * 2) / inner.scrollHeight : 1
      inner.style.zoom = String(Math.max(0.5, Math.min(1, wide, tall)))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(outer)
    return () => ro.disconnect()
  }, [demo, pad, fitHeight])

  const Component = demo?.default
  return (
    <div ref={box} data-demo={slug} className={cn("relative flex items-center justify-center overflow-hidden", className)} style={{ padding: pad }}>
      {demo && replay && (
        <Button data-agent-hidden variant="ghost" size="icon" onClick={() => setRun((now) => now + 1)} aria-label="Replay the demo" title="Replay animation"
          className="absolute top-3 right-3 z-20 size-8 rounded-[10px] border border-border/70 bg-background/90 text-muted-foreground shadow-sm hover:text-foreground">
          <RotateCw aria-hidden className="size-3.5" />
        </Button>
      )}
      {Component ? (
        <div ref={fit} data-agent-preview-content className="flex w-full min-w-0 justify-center">
          <Speed speed={speed}>
            <Component key={run} {...values} />
          </Speed>
        </div>
      ) : (
        <div aria-hidden className="size-5 animate-spin rounded-full border-2 border-foreground/15 border-t-foreground/50 motion-reduce:animate-none" />
      )}
    </div>
  )
}

/* Loads a demo by its slug when it is first needed. */
export function useDemoModule(slug: string) {
  const [demo, setDemo] = React.useState<DemoModule | null>(null)
  React.useEffect(() => {
    let alive = true
    demoLoaders[slug]?.().then((m) => alive && setDemo(m))
    return () => {
      alive = false
    }
  }, [slug])
  return demo
}

/* The same frame, loading the demo itself. */
export function Demo({ slug, className, pad, fitHeight }: { slug: string; className?: string; pad?: number; fitHeight?: boolean }) {
  const demo = useDemoModule(slug)
  return <DemoFrame demo={demo} slug={slug} className={className} pad={pad} fitHeight={fitHeight} />
}
