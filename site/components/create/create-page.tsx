"use client"

/* /create: build a preset, see it on real components, take it away as one code.

   Left, the controls (Keyframery's own Select, Segmented Control, Slider and Switch, in the Customize
   panel's row design). Right, the code and its install command above a live preview scoped to the
   preset's variables. The preview's light and dark are the site's, so the toggle switches both: the
   components' dark styles follow the page's .dark class. */

import { Check, Copy, Dices, Link2, Moon, RotateCcw, RotateCw, Sun } from "lucide-react"
import { useTheme } from "fumadocs-ui/provider/base"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"
import { useAutoplay } from "@/lib/autoplay"
import { PreviewSlider, PreviewSwitch } from "@/lib/customize"
import { cn } from "@/lib/utils"
import { PresetPreview, replaySteps, visibleSteps } from "@site/components/create/preview"
import { MotionCurve } from "@site/components/create/motion-curve"
import { type Choice, ChoiceRow, PanelHeading } from "@site/components/create/rows"
import { DEFAULT_PRESET, decodePreset, encodePreset, PRESET_FIELDS, type Preset, randomPreset, START_PRESET } from "@site/lib/preset"
import { BASES, BOUNCES, CHARTS, describePreset, FONTS, presetCss, presetPreviewVars, presetTokens, RADII, STYLES, THEMES } from "@site/lib/preset-tokens"
import { trackCopy } from "@site/lib/track-copy"

type Values<K extends keyof Preset> = Preset[K]
/* The same order as every motion style switcher. The code order (PRESET_FIELDS) can only grow at its
   end, so it differs: Subtle was added last but is the default and comes first here. */
const MOTION_ORDER = ["subtle", "calm", "springy", "snappy", "playful"] as const satisfies readonly Preset["motion"][]

const values = <K extends keyof Preset>(key: K) => PRESET_FIELDS.find((field) => field.key === key)!.values as unknown as readonly Values<K>[]

/* How each font is drawn here. The page loads the Google ones with next/font (see app/(home)/create/page.tsx). */
const previewFonts: Record<Preset["font"], string | null> = {
  inherit: null,
  inter: "'Inter Variable', ui-sans-serif, system-ui, sans-serif",
  geist: "var(--font-geist), ui-sans-serif, system-ui, sans-serif",
  figtree: "var(--font-kf-figtree), ui-sans-serif, system-ui, sans-serif",
  manrope: "var(--font-kf-manrope), ui-sans-serif, system-ui, sans-serif",
  "dm-sans": "var(--font-kf-dm-sans), ui-sans-serif, system-ui, sans-serif",
  system: FONTS.system.family,
}

const baseChoices: Choice<Preset["base"]>[] = values("base").map((value) => ({
  value,
  label: BASES[value].label,
  swatch: [presetTokens({ ...DEFAULT_PRESET, base: value }).light["muted-foreground"]],
}))
const themeChoices: Choice<Preset["theme"]>[] = values("theme").map((value) => ({
  value,
  label: THEMES[value].label,
  swatch: [presetTokens({ ...DEFAULT_PRESET, theme: value }).light.primary],
}))
const chartChoices: Choice<Preset["chart"]>[] = values("chart").map((value) => ({ value, label: CHARTS[value].label, swatch: CHARTS[value].light }))
const radiusOrder: Preset["radius"][] = ["0", "0.3", "0.5", "0.625", "0.75", "1"]
const radiusChoices: Choice<Preset["radius"]>[] = radiusOrder.map((value) => ({ value, label: value === "0" ? "None" : RADII[value], hint: value === "0.625" ? "Default" : undefined }))
const fontChoices: Choice<Preset["font"]>[] = values("font").map((value) => ({ value, label: FONTS[value].label, font: previewFonts[value] ?? undefined }))
const bounceChoices: Choice<Preset["bounce"]>[] = values("bounce").map((value) => ({ value, label: BOUNCES[value].label }))

/* The top bar's two trays share one shape: a recessed 36px well and 28px raised keys inside it. */
const tray =
  "flex h-9 items-center rounded-[10px] bg-muted shadow-[inset_0_1px_1px_rgb(0_0_0/0.05),inset_0_0_0_1px_rgb(0_0_0/0.035)] dark:shadow-[inset_0_1px_2px_rgb(0_0_0/0.45),inset_0_0_0_1px_rgb(255_255_255/0.04)]"
const innerKey = "h-7 rounded-[6px] px-2.5 text-[12px] [--button-radius:6px] [--button-height:1.75rem]"

const command = (code: string) => `npx shadcn@latest add @keyframery/preset-${code}`

/* A button that copies, then says so for a moment. */
function CopyButton({ text, label, done = "Copied", event, icon: Icon = Copy, variant = "default", className }: {
  text: () => string
  label: string
  done?: string
  event?: boolean
  icon?: typeof Copy
  variant?: "default" | "primary" | "ghost"
  className?: string
}) {
  const [copied, setCopied] = React.useState(false)
  React.useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1600)
    return () => clearTimeout(t)
  }, [copied])
  return (
    <Button
      variant={variant}
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text())
          setCopied(true)
          if (event) trackCopy("install_copy", "preset")
        } catch { /* Clipboard blocked: nothing to confirm. */ }
      }}
    >
      {copied ? <Check aria-hidden /> : <Icon aria-hidden />}
      <span aria-live="polite">{copied ? done : label}</span>
    </Button>
  )
}

function readCode(): Preset | null {
  try {
    return decodePreset(new URLSearchParams(window.location.search).get("preset"))
  } catch {
    return null
  }
}

export function CreatePage() {
  const [preset, setPreset] = React.useState<Preset>(START_PRESET)
  const code = encodePreset(preset)
  /* Set by the visitor's own changes (not a restored link), so only those replay the motion. */
  const touched = React.useRef(false)
  const choose = (next: Preset | ((now: Preset) => Preset)) => {
    touched.current = true
    setPreset(next)
  }
  const set = <K extends keyof Preset>(key: K, value: Preset[K]) => choose((now) => ({ ...now, [key]: value }))

  /* A shared link restores its preset; every change keeps the address current without adding history. */
  const restored = React.useRef(false)
  React.useLayoutEffect(() => {
    const shared = readCode()
    if (shared) setPreset(shared)
    restored.current = true
  }, [])
  React.useEffect(() => {
    if (!restored.current) return
    const url = new URL(window.location.href)
    if (code === encodePreset(START_PRESET)) url.searchParams.delete("preset")
    else url.searchParams.set("preset", code)
    window.history.replaceState(window.history.state, "", url)
  }, [code])

  /* Replay: plays once in view, again on the button, and again whenever the motion changes. */
  const stage = React.useRef<HTMLDivElement>(null)
  const [run, setRun] = React.useState(0)
  const [steps, setSteps] = React.useState(replaySteps)
  useAutoplay(stage, steps, run)
  /* A replay plays what is on screen: the steps whose targets are in view, and the cards in view remount. */
  const replay = React.useCallback(() => {
    // A short beat first, so the remounted cards are on screen before the first click.
    setSteps([{ wait: 300 }, ...visibleSteps(stage.current, replaySteps)])
    setRun((now) => now + 1)
  }, [])
  const motionKey = `${preset.motion}|${preset.speed}|${preset.bounce}`
  React.useEffect(() => {
    if (!touched.current) return
    touched.current = false
    replay()
  }, [motionKey, replay])

  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  const mode = mounted && resolvedTheme === "dark" ? "dark" : "light"

  /* Both modes as one scoped stylesheet, so the preview is right on the first paint in either theme. */
  const scoped = React.useMemo(() => {
    const decl = (vars: Record<string, string>) => Object.entries(vars).map(([name, value]) => `${name}:${value}`).join(";")
    const font = previewFonts[preset.font]
    return [
      `[data-create-preview]{${decl(presetPreviewVars(preset, "light"))}${font ? `;font-family:${font}` : ""}}`,
      `.dark [data-create-preview]{${decl(presetPreviewVars(preset, "dark"))}}`,
    ].join("\n")
  }, [preset])

  const style = STYLES[preset.motion]
  const isDefault = code === encodePreset(START_PRESET)

  const controls = (
    <div className="flex min-h-full flex-col gap-5">
      <section aria-labelledby="create-look" className="grid gap-2">
        <PanelHeading>
          <span id="create-look">Look</span>
        </PanelHeading>
        <ChoiceRow id="base" label="Base colour" value={preset.base} choices={baseChoices} onChange={(v) => set("base", v)} />
        <ChoiceRow id="theme" label="Theme colour" value={preset.theme} choices={themeChoices} onChange={(v) => set("theme", v)} />
        <ChoiceRow id="chart" label="Chart colours" value={preset.chart} choices={chartChoices} onChange={(v) => set("chart", v)} />
        <ChoiceRow id="radius" label="Radius" value={preset.radius} choices={radiusChoices} onChange={(v) => set("radius", v)} />
        <ChoiceRow id="font" label="Font" value={preset.font} choices={fontChoices} onChange={(v) => set("font", v)} />
        <PreviewSwitch id="highlight" label="Tint highlights" checked={preset.highlight === "tinted"} onChange={(on) => set("highlight", on ? "tinted" : "neutral")} />
      </section>
      <section aria-labelledby="create-motion" className="grid gap-2">
        <PanelHeading>
          <span id="create-motion">Motion</span>
        </PanelHeading>
        <SegmentedControl aria-label="Motion style" value={preset.motion} onValueChange={(next) => next && set("motion", next as Preset["motion"])} className="w-full [--segmented-control-item-padding:0.375rem]">
          {MOTION_ORDER.map((value) => (
            <SegmentedControlItem key={value} value={value} className="min-w-0 flex-1">
              {STYLES[value].label}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
        <p className="px-1 pb-1 text-[12px] leading-[1.45] text-muted-foreground">{style.note}</p>
        <PreviewSlider id="speed" label="Speed" value={Number(preset.speed)} min={0.5} max={1.5} step={0.25} unit="×" onChange={(v) => set("speed", String(v) as Preset["speed"])} />
        <ChoiceRow id="bounce" label="Bounce" value={preset.bounce} choices={bounceChoices} onChange={(v) => set("bounce", v)} />
        <PreviewSwitch id="reduced" label="Gentler for reduced motion" checked={preset.reduced === "gentle"} onChange={(on) => set("reduced", on ? "gentle" : "keep")} />
      </section>
      <MotionCurve preset={preset} />
    </div>
  )

  const actions = (
    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
      <div className={cn(tray, "min-w-0 flex-1 gap-2 ps-3 pe-1 xl:w-[470px] xl:flex-none")}>
        <code className="min-w-0 flex-1 truncate font-mono text-[12.5px]" data-preset-command>{command(code)}</code>
        <CopyButton text={() => command(code)} label="Copy" event variant="primary" className={cn(innerKey, "shrink-0")} />
      </div>
      {/* The same tray as the command: a recessed well holding raised keys, corners concentric (10px out, 4px in, 6px keys). */}
      <div className={cn(tray, "gap-1 p-1")}>
        <CopyButton text={() => presetCss(preset, window.location.origin.includes("localhost") ? window.location.origin : "https://keyframery.com")} label="Copy CSS" className={cn(innerKey, "flex-1 sm:flex-none")} />
        <CopyButton text={() => window.location.href} label="Copy link" icon={Link2} className={cn(innerKey, "flex-1 sm:flex-none")} />
      </div>
    </div>
  )

  /* An app page: on a desktop it fills the window under the header and never scrolls itself. The
     panel scrolls on its own when it is taller; the canvas pans sideways. On a phone it scrolls. */
  return (
    <div className="flex w-full flex-col gap-3 px-4 pt-4 pb-6 md:px-5 lg:h-[calc(100dvh-var(--fd-nav-height,3.5rem))] lg:min-h-[560px] lg:overflow-hidden lg:pb-4">
      <style>{scoped}</style>
      {/* The top bar: what this is, the code and the ways to take it away. */}
      <section aria-label="Your preset" className="grid shrink-0 gap-3 rounded-xl border bg-background px-4 py-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="text-[17px] leading-tight font-semibold tracking-[-0.015em]">Create a preset</h1>
            <span className="flex items-baseline gap-1.5 text-[12px] text-muted-foreground">
              Preset <code data-preset-code className="font-mono text-[13px] font-semibold tracking-tight text-foreground">{code}</code>
            </span>
          </div>
          <p className="mt-0.5 truncate text-[12.5px] leading-[1.45] text-muted-foreground" title={describePreset(preset)}>
            {describePreset(preset)}. Install it with the shadcn CLI.
          </p>
        </div>
        {actions}
      </section>

      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside aria-label="Preset settings" className="order-2 min-h-0 lg:order-1">
          <div className="flex max-h-full flex-col overflow-hidden rounded-xl border bg-background lg:h-full">
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin]">{controls}</div>
            <div className="flex shrink-0 gap-2 border-t p-3">
              <Button size="sm" onClick={() => choose(randomPreset())} className="flex-1">
                <Dices aria-hidden />
                Randomize
              </Button>
              <Button size="sm" variant="ghost" onClick={() => choose(START_PRESET)} disabled={isDefault} className="flex-1 text-muted-foreground">
                <RotateCcw aria-hidden />
                Reset
              </Button>
            </div>
          </div>
        </aside>

        {/* The preview. */}
        <section aria-label="Preview" className="order-1 flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border lg:order-2">
          <div className="flex shrink-0 items-center gap-2 border-b bg-background px-3 py-2">
            <SegmentedControl aria-label="Preview theme" value={mode} onValueChange={(next) => next && setTheme(next as string)}>
              <SegmentedControlItem value="light"><Sun aria-hidden className="size-3.5" /> Light</SegmentedControlItem>
              <SegmentedControlItem value="dark"><Moon aria-hidden className="size-3.5" /> Dark</SegmentedControlItem>
            </SegmentedControl>
            <span className="ms-auto hidden text-[12px] text-muted-foreground tabular-nums sm:inline">
              {style.label}, {preset.speed}×{preset.bounce === "style" ? "" : `, ${BOUNCES[preset.bounce].label.toLowerCase()} bounce`}
            </span>
            <Button size="sm" onClick={replay} className="ms-auto sm:ms-0">
              <RotateCw aria-hidden />
              Replay motion
            </Button>
          </div>
          <div ref={stage} data-create-preview className="min-h-0 flex-1 bg-background p-4 text-foreground sm:p-6 lg:p-0">
            <PresetPreview run={run} />
          </div>
        </section>
      </div>
    </div>
  )
}
