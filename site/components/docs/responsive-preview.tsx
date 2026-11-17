"use client"

import * as React from "react"

import { createResizableController, Resizable, ResizableHandle, ResizablePanel } from "@/components/ui/resizable"

export type PreviewViewport = "desktop" | "tablet" | "mobile" | "custom"

const handleWidth = 12

/** One persistent demo surface: presets change its real layout width, never its scale or key. */
export function ResponsivePreview({
  children,
  viewport,
  onViewportChange,
}: {
  children: React.ReactNode
  viewport: PreviewViewport
  onViewportChange?: (viewport: PreviewViewport) => void
}) {
  const [controller] = React.useState(createResizableController)
  const panelId = React.useId()
  const instructionsId = React.useId()
  const canvas = React.useRef<HTMLDivElement>(null)
  const panel = React.useRef<HTMLDivElement>(null)
  const [availableWidth, setAvailableWidth] = React.useState(0)
  const [width, setWidth] = React.useState<number | null>(null)

  React.useLayoutEffect(() => {
    const container = canvas.current
    const preview = panel.current
    if (!container || !preview) return
    const measure = () => {
      // The Code tab hides this surface. Keep its last measurement until it is visible again.
      if (container.clientWidth > 0) setAvailableWidth(container.clientWidth)
      const next = preview.getBoundingClientRect().width
      if (next > 0) setWidth(Math.round(next))
    }
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    observer.observe(preview)
    measure()
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    if (availableWidth === 0 || viewport === "custom") return
    controller.resize(panelId, viewport === "desktop" ? 100 : viewport === "tablet" ? "768px" : "375px")
  }, [availableWidth, controller, panelId, viewport])

  // Pixel bounds must fit the actual docs lane, including on phones narrower than the preset.
  const minimum = Math.min(320, Math.max(0, availableWidth - handleWidth))

  return (
    <div data-preview-viewport={viewport} className="min-w-0">
      <Resizable
        ref={canvas}
        controller={controller}
        orientation="horizontal"
        step={1}
        largeStep={10}
        className="min-h-[320px] min-w-0 overflow-hidden bg-muted/20 sm:min-h-[360px]"
        onLayoutChange={(_, details) => {
          if (details.reason === "drag" || details.reason === "step-key") onViewportChange?.("custom")
        }}
      >
        <ResizablePanel
          ref={panel}
          id={panelId}
          defaultSize={100}
          minSize={`${minimum}px`}
          className="@container/preview min-w-0 bg-background"
        >
          {children}
        </ResizablePanel>
        <ResizableHandle
          aria-label="Resize preview width"
          aria-describedby={instructionsId}
          aria-valuetext={width === null ? undefined : `${width} pixels`}
          style={{ width: handleWidth }}
          className="border-x border-border/70 bg-muted/40 [--resizable-grip-length:2.5rem] [--resizable-grip-width:0.75rem] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        />
        <ResizablePanel
          defaultSize={0}
          minSize={0}
          aria-hidden="true"
          className="min-w-0 bg-[repeating-linear-gradient(135deg,transparent,transparent_5px,var(--border)_5px,var(--border)_6px)] opacity-30"
        />
      </Resizable>
      <div className="flex min-h-9 items-center justify-between gap-3 border-t bg-background px-4 text-[11px] leading-relaxed text-muted-foreground">
        <span id={instructionsId}>
          <span className="hidden sm:inline">Drag the edge to resize</span>
          <span className="sm:hidden">Resize preview</span>
          <span className="sr-only">. Focus the handle and use the left or right arrow keys. Hold Shift for larger steps.</span>
        </span>
        <output aria-label="Preview width" className="shrink-0 font-mono tabular-nums">
          {width === null ? "—" : width} <span className="text-muted-foreground/70">px</span>
        </output>
      </div>
    </div>
  )
}
