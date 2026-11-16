"use client"

import * as React from "react"

import { useAutoplay } from "@/lib/autoplay"
import { cn } from "@/lib/utils"
import { demoLoaders } from "@site/lib/demo-loaders"
import type { DemoModule } from "@site/lib/demo-types"

/* A live demo that plays itself while it is on screen, the same as in the lab. It pauses while the
   pointer is over it, so a visitor can take over.

   Demos are fluid: in a narrow box (a phone) each one switches to its own narrow layout through
   container queries. Only if a demo still cannot fit (a fixed-height grid cell) is it scaled down
   with CSS zoom instead of being cut off. On a phone the box's padding tightens to 16px. */
export function DemoFrame({
  demo,
  slug,
  className,
  pad = 24,
  fitHeight = false,
}: {
  demo: DemoModule | null
  slug: string
  className?: string
  pad?: number
  /** The box has a fixed height: scale the demo down to fit that too. */
  fitHeight?: boolean
}) {
  const box = React.useRef<HTMLDivElement>(null)
  const fit = React.useRef<HTMLDivElement>(null)
  useAutoplay(box, demo?.play)

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
      {Component ? (
        <div ref={fit} className="flex w-full min-w-0 justify-center">
          <Component />
        </div>
      ) : (
        <div aria-hidden className="size-5 animate-spin rounded-full border-2 border-foreground/15 border-t-foreground/50 motion-reduce:animate-none" />
      )}
    </div>
  )
}

/* The same, loading the demo by its slug when it is first needed. */
export function Demo({ slug, className, pad, fitHeight }: { slug: string; className?: string; pad?: number; fitHeight?: boolean }) {
  const [demo, setDemo] = React.useState<DemoModule | null>(null)
  React.useEffect(() => {
    let alive = true
    demoLoaders[slug]?.().then((m) => alive && setDemo(m))
    return () => {
      alive = false
    }
  }, [slug])
  return <DemoFrame demo={demo} slug={slug} className={className} pad={pad} fitHeight={fitHeight} />
}
