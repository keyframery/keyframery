"use client"

import { Code2, Eye, Monitor, Smartphone, Tablet } from "lucide-react"
import * as React from "react"

import { AgentPreview } from "@/components/agent-preview"
import { Button } from "@/components/ui/button"
import { MotionStyleSwitcher } from "@/components/ui/preferences"
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"
import { type ControlValues, defaultValues } from "@/lib/controls"
import { Customize } from "@/lib/customize"
import { cn } from "@/lib/utils"
import { Demo, DemoFrame, useDemoModule } from "@site/components/demo"
import { PreviewCode } from "@site/components/docs/preview-code"
import { ResponsivePreview, type PreviewViewport } from "@site/components/docs/responsive-preview"
import { previewCode, type PreviewSource } from "@site/lib/preview-code"
import { previewPreferencesKey, readPreviewPreferences, writePreviewPreferences } from "@site/lib/preview-preferences"

const devices = [
  { value: "desktop", label: "Desktop", Icon: Monitor },
  { value: "tablet", label: "Tablet", Icon: Tablet },
  { value: "mobile", label: "Mobile", Icon: Smartphone },
] as const

export function ComponentPreview(props: { slug: string; source?: PreviewSource; children?: React.ReactNode }) {
  return <ComponentPlayground key={props.slug} {...props} />
}

/** One configuration drives the mounted demo, the displayed source and the clipboard. */
function ComponentPlayground({ slug, source, children }: { slug: string; source?: PreviewSource; children?: React.ReactNode }) {
  const [view, setView] = React.useState("preview")
  const [viewport, setViewport] = React.useState<PreviewViewport>("desktop")
  const demo = useDemoModule(slug)
  const [changed, setChanged] = React.useState<ControlValues>({})
  const [speed, setSpeed] = React.useState(1)
  const [restored, setRestored] = React.useState(false)
  React.useLayoutEffect(() => {
    if (!demo) return
    try {
      const saved = readPreviewPreferences(localStorage.getItem(previewPreferencesKey(slug)), demo.controls)
      setChanged(saved.values)
      setSpeed(saved.speed)
    } catch { /* Storage may be unavailable; this visit still keeps its live settings. */ }
    setRestored(true)
  }, [demo, slug])
  React.useEffect(() => {
    if (!restored || !demo) return
    try {
      const key = previewPreferencesKey(slug)
      const saved = writePreviewPreferences(changed, demo.controls, speed)
      if (saved === null) localStorage.removeItem(key)
      else localStorage.setItem(key, saved)
    } catch { /* Keep customization usable when browser storage is disabled or full. */ }
  }, [changed, demo, restored, slug, speed])
  const values = React.useMemo(() => ({ ...defaultValues(demo?.controls), ...changed }), [demo, changed])
  const code = React.useMemo(() => source ? previewCode(source, values, speed) : null, [source, values, speed])
  const customized = speed !== 1 || Object.entries(demo?.controls ?? {}).some(([name, control]) => values[name] !== control.default)
  const hasCode = Boolean(source || children)

  return (
    <section id="preview" aria-label="Component playground" className="not-prose my-5 min-w-0 scroll-mt-24 space-y-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {hasCode ? (
          <SegmentedControl aria-label="Demo view" value={view} onValueChange={(value) => value && setView(value as string)}>
            <SegmentedControlItem value="preview"><Eye aria-hidden className="size-3.5" /> Preview</SegmentedControlItem>
            <SegmentedControlItem value="code"><Code2 aria-hidden className="size-3.5" /> Code</SegmentedControlItem>
          </SegmentedControl>
        ) : <span className="text-[13px] font-medium">Live preview</span>}
          <div role="group" aria-label="Screen size" className="ms-auto flex items-center gap-0.5 rounded-[11px] bg-muted p-1 shadow-[inset_0_0_0_1px_rgb(0_0_0/0.035)] dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.04)]">
            {devices.map(({ value, label, Icon }) => (
              <Button key={value} variant="ghost" size="icon-sm" aria-pressed={viewport === value} aria-label={label} title={value === "tablet" ? "Tablet · 768px" : value === "mobile" ? "Mobile · 375px" : "Desktop · full width"}
                onClick={() => { setViewport(value); setView("preview") }}
                className="size-7 rounded-[8px] text-muted-foreground aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-sm dark:aria-pressed:bg-accent">
                <Icon aria-hidden className="size-3.5" />
              </Button>
            ))}
          </div>
          <MotionStyleSwitcher className="w-full sm:w-auto" />
      </div>
      <div className="min-w-0 overflow-hidden rounded-xl border bg-background">
        <div className={cn(view !== "preview" && "hidden")}>
          <AgentPreview label={slug}>
            <ResponsivePreview viewport={viewport} onViewportChange={setViewport}>
              <DemoFrame demo={demo} slug={slug} values={values} speed={speed === 1 ? undefined : speed} className="min-h-[320px] sm:min-h-[360px]" pad={24} />
            </ResponsivePreview>
          </AgentPreview>
        </div>
        {hasCode && view === "code" && (code
          ? <PreviewCode code={code} changed={customized} />
          : <div className="max-h-[480px] overflow-auto [&_figure]:my-0 [&_figure]:rounded-none [&_figure]:border-0">{children}</div>)}
      </div>
      <div id="customize" className="scroll-mt-24"><Customize className="rounded-xl border bg-background p-4" controls={demo?.controls} values={values}
        onChange={(name, value) => setChanged((now) => ({ ...now, [name]: value }))}
        speed={speed} onSpeedChange={setSpeed} onReset={() => { setChanged({}); setSpeed(1) }} /></div>
    </section>
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
