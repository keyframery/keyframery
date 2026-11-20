"use client"

/* How the admin looks and moves: theme, sidebar style, density, reading direction, motion style
   and motion speed. The store holds all of it except the motion style, which is a UI SDK
   preference (`backroomMotion`) so every Keyframery component, popups included, follows it.
   Nothing is remembered between visits.

   `useApplyAppearance` puts the choices on the page; `AppearanceDrawer` is the settings sheet. */

import { Monitor, Moon, RotateCcw, Sun } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Drawer, DrawerBackdrop, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { createMotionStyle, MotionStyleSwitcher, type MotionStyleValue, usePreference } from "@/components/ui/motion-style"
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Slider, SliderControl, SliderIndicator, SliderThumb, SliderTrack, SliderValue } from "@/components/ui/slider"

import { useShellState } from "./shell-state"
import { type Appearance, DEFAULT_APPEARANCE, useStore } from "./store"

/** The admin's motion style. On <html>, so popups follow it; not saved between visits. */
export const backroomMotion = createMotionStyle({ storageKey: null })

/* Each style's own speed, from the motion tokens. The speed setting multiplies it. */
const STYLE_SPEED: Record<MotionStyleValue, number> = { calm: 1.35, springy: 1, snappy: 0.6, playful: 1.15 }

/** Puts the appearance on <html>: the `dark` class, `dir`, and `--kf-speed`. Restores what was there when the admin unmounts. */
export function useApplyAppearance(appearance: Appearance) {
  const { value: motion } = usePreference(backroomMotion)

  React.useEffect(() => {
    const html = document.documentElement
    const before = { dark: html.classList.contains("dark"), scheme: html.style.colorScheme, dir: html.getAttribute("dir"), speed: html.style.getPropertyValue("--kf-speed") }
    return () => {
      html.classList.toggle("dark", before.dark)
      html.style.colorScheme = before.scheme
      if (before.dir === null) html.removeAttribute("dir")
      else html.setAttribute("dir", before.dir)
      if (before.speed) html.style.setProperty("--kf-speed", before.speed)
      else html.style.removeProperty("--kf-speed")
    }
  }, [])

  React.useEffect(() => {
    const html = document.documentElement
    const query = window.matchMedia("(prefers-color-scheme: dark)")
    const apply = () => {
      const dark = appearance.theme === "dark" || (appearance.theme === "system" && query.matches)
      html.classList.toggle("dark", dark)
      html.style.colorScheme = dark ? "dark" : "light"
    }
    apply()
    if (appearance.theme !== "system") return
    query.addEventListener("change", apply)
    return () => query.removeEventListener("change", apply)
  }, [appearance.theme])

  React.useEffect(() => {
    document.documentElement.setAttribute("dir", appearance.dir)
  }, [appearance.dir])

  React.useEffect(() => {
    document.documentElement.style.setProperty("--kf-speed", String(+(STYLE_SPEED[motion] * appearance.speed).toFixed(3)))
  }, [motion, appearance.speed])
}

const icon = { size: 16, strokeWidth: 1.75, "aria-hidden": true } as const

function Section({ title, hint, changed, onReset, children }: { title: string; hint: string; changed: boolean; onReset: () => void; children: React.ReactNode }) {
  const id = React.useId()
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3 py-5 first:pt-4">
      <div className="flex min-h-7 items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h3 id={id} className="text-[13px] leading-none font-semibold">
            {title}
          </h3>
          <p className="text-[12px] leading-[1.4] text-muted-foreground">{hint}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Reset ${title.toLowerCase()}`}
          disabled={!changed}
          onClick={onReset}
          className="-me-1.5 shrink-0 text-muted-foreground transition-opacity data-disabled:opacity-0"
        >
          <RotateCcw />
          Reset
        </Button>
      </div>
      {children}
    </section>
  )
}

/* Full width segmented controls, one item per choice, the same height everywhere. */
/* The items share the row, and so do their copies inside the key (see segmented-control.tsx). */
const fill = "flex w-full [&>[data-slot=segmented-control-item]]:flex-1 [&_[data-slot=segmented-control-item-copy]]:flex-1"

export function AppearanceDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { state, actions } = useStore()
  const a = state.appearance
  const { value: motion } = usePreference(backroomMotion)
  const set = actions.setAppearance
  const changed = (Object.keys(DEFAULT_APPEARANCE) as (keyof Appearance)[]).some((k) => a[k] !== DEFAULT_APPEARANCE[k]) || motion !== "springy"

  /* Close the drawer after changing how things move, and the page plays its arrival again in the new style. */
  const { replayPage } = useShellState()
  const atOpen = React.useRef({ motion, speed: a.speed })
  React.useEffect(() => {
    if (open) atOpen.current = { motion, speed: a.speed }
    // Only when it opens: what was set then is what a change is measured against.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])
  const close = (next: boolean) => {
    if (!next && (atOpen.current.motion !== motion || atOpen.current.speed !== a.speed)) replayPage()
    onOpenChange(next)
  }

  return (
    <Drawer open={open} onOpenChange={close} side="end">
      <DrawerBackdrop />
      <DrawerContent aria-label="Appearance" className="[--drawer-width:400px]">
        <DrawerHeader className="flex-row items-start justify-between gap-3 px-6 pt-6">
          <div className="flex flex-col gap-1">
            <DrawerTitle>Appearance</DrawerTitle>
            <DrawerDescription>How Backroom looks and moves on this device.</DrawerDescription>
          </div>
        </DrawerHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-4">
          <AppearanceSections />
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border px-6 pt-4">
          <p className="text-[12px] text-muted-foreground">{changed ? "Some settings differ from the defaults." : "Everything is on its default."}</p>
          <Button
            disabled={!changed}
            onClick={() => {
              set(DEFAULT_APPEARANCE)
              backroomMotion.set("springy")
            }}
          >
            <RotateCcw {...icon} />
            Reset all
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

/** Every appearance setting, each with its own reset. The drawer shows them as one column; Settings › Appearance
    has the room for two, so it asks for the look (theme, sidebar, density, direction) and the motion apart. */
export function AppearanceSections({ className, group }: { className?: string; group?: "look" | "motion" }) {
  const { state, actions } = useStore()
  const a = state.appearance
  const { value: motion } = usePreference(backroomMotion)
  const set = actions.setAppearance
  return (
    <div className={cn("flex flex-col divide-y divide-border", className)}>
      {group !== "motion" && (
        <>
          <Section title="Theme" hint="System follows your device." changed={a.theme !== DEFAULT_APPEARANCE.theme} onReset={() => set({ theme: DEFAULT_APPEARANCE.theme })}>
            <SegmentedControl aria-label="Theme" value={a.theme} onValueChange={(v) => v && set({ theme: v as Appearance["theme"] })} className={fill}>
              <SegmentedControlItem value="light">
                <Sun {...icon} />
                Light
              </SegmentedControlItem>
              <SegmentedControlItem value="dark">
                <Moon {...icon} />
                Dark
              </SegmentedControlItem>
              <SegmentedControlItem value="system">
                <Monitor {...icon} />
                System
              </SegmentedControlItem>
            </SegmentedControl>
          </Section>
          <Section title="Sidebar" hint="Inset sets the page on a sheet; floating lifts the sidebar." changed={a.sidebar !== DEFAULT_APPEARANCE.sidebar} onReset={() => set({ sidebar: DEFAULT_APPEARANCE.sidebar })}>
            <SegmentedControl aria-label="Sidebar style" value={a.sidebar} onValueChange={(v) => v && set({ sidebar: v as Appearance["sidebar"] })} className={fill}>
              <SegmentedControlItem value="inset">Inset</SegmentedControlItem>
              <SegmentedControlItem value="floating">Floating</SegmentedControlItem>
              <SegmentedControlItem value="plain">Plain</SegmentedControlItem>
            </SegmentedControl>
          </Section>
          <Section title="Density" hint="Compact fits more rows on a screen." changed={a.density !== DEFAULT_APPEARANCE.density} onReset={() => set({ density: DEFAULT_APPEARANCE.density })}>
            <SegmentedControl aria-label="Density" value={a.density} onValueChange={(v) => v && set({ density: v as Appearance["density"] })} className={fill}>
              <SegmentedControlItem value="comfortable">Comfortable</SegmentedControlItem>
              <SegmentedControlItem value="compact">Compact</SegmentedControlItem>
            </SegmentedControl>
          </Section>
          <Section title="Direction" hint="Right to left mirrors the whole admin." changed={a.dir !== DEFAULT_APPEARANCE.dir} onReset={() => set({ dir: DEFAULT_APPEARANCE.dir })}>
            <SegmentedControl aria-label="Reading direction" value={a.dir} onValueChange={(v) => v && set({ dir: v as Appearance["dir"] })} className={fill}>
              <SegmentedControlItem value="ltr">Left to right</SegmentedControlItem>
              <SegmentedControlItem value="rtl">Right to left</SegmentedControlItem>
            </SegmentedControl>
          </Section>
        </>
      )}
      {group !== "look" && (
        <>
          <Section title="Motion style" hint="How every panel, menu and number moves." changed={motion !== "springy"} onReset={() => backroomMotion.set("springy")}>
            <MotionStyleSwitcher preference={backroomMotion} className={fill} />
            <MotionPreview motion={motion} speed={a.speed} inPanel={!group} />
          </Section>
          <Section title="Motion speed" hint="Slower or quicker than the style's own pace." changed={a.speed !== DEFAULT_APPEARANCE.speed} onReset={() => set({ speed: DEFAULT_APPEARANCE.speed })}>
            <Slider
              aria-label="Motion speed"
              value={a.speed}
              min={0.5}
              max={2}
              step={0.25}
              onValueChange={(v) => set({ speed: Array.isArray(v) ? v[0] : (v as number) })}
              format={{ maximumFractionDigits: 2 }}
              className="flex flex-col gap-2.5"
            >
              <div className="flex items-center justify-between text-[12px] text-muted-foreground">
                <span>Quicker</span>
                <span className="font-medium text-foreground tabular-nums">
                  <SliderValue>{(state) => `${state.text}×`}</SliderValue>
                </span>
                <span>Slower</span>
              </div>
              <SliderControl>
                <SliderTrack>
                  <SliderIndicator />
                  <SliderThumb aria-label="Motion speed" />
                </SliderTrack>
              </SliderControl>
            </Slider>
          </Section>
        </>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ the motion preview */

/* Keyframes for the preview. Every duration is multiplied by --kf-speed and every easing is a house token, so the
   preview moves exactly as the admin's own panels, menus and numbers do in the chosen style. */
const previewKeyframes = `
@keyframes br-preview-rise { from { opacity: 0; translate: 0 14px; scale: 0.96 } to { opacity: 1; translate: 0 0; scale: 1 } }
@keyframes br-preview-pop { from { opacity: 0; scale: 0.4 } to { opacity: 1; scale: 1 } }
@keyframes br-preview-fill { from { scale: 0 1 } to { scale: 1 1 } }
@keyframes br-preview-slide { from { translate: 0 0 } to { translate: var(--br-preview-travel) 0 } }`

const MOTION_NOTE: Record<MotionStyleValue, string> = {
  calm: "Slower, no bounce",
  springy: "A light spring",
  snappy: "Fast and crisp",
  playful: "Bigger bounce",
}

/** A small order card that arrives, gets its badge, fills its bar and slides its key, in the chosen style.
    It plays again on every change and on "Play again". Decorative: the switcher above is the control. */
function MotionPreview({ motion, speed, inPanel }: { motion: MotionStyleValue; speed: number; inPanel: boolean }) {
  const [run, setRun] = React.useState(0)
  const t = (ms: number) => `calc(${ms}ms*var(--kf-speed,1))`
  return (
    <div className="mt-3 flex flex-col gap-2">
      <style href="br-motion-preview" precedence="default">
        {previewKeyframes}
      </style>
      <div
        aria-hidden
        key={`${motion}-${speed}-${run}`}
        className="relative h-[92px] overflow-hidden rounded-[12px] bg-[color-mix(in_oklab,var(--muted)_70%,transparent)] p-3 shadow-[inset_0_0_0_1px_var(--border)]"
      >
        <div
          className="flex h-full flex-col justify-between rounded-[9px] bg-background p-2.5 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_6px_-2px_rgb(0_0_0/0.12)] motion-reduce:animate-none! dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]"
          style={{ animation: `br-preview-rise ${t(560)} var(--ease-spring) both` }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold tabular-nums">#1482</span>
            <span
              className="rounded-full bg-[color-mix(in_oklch,oklch(0.62_0.16_150)_16%,transparent)] px-2 py-0.5 text-[11px] font-medium text-[color:color-mix(in_oklch,oklch(0.62_0.16_150)_82%,var(--foreground))] motion-reduce:animate-none!"
              style={{ animation: `br-preview-pop ${t(420)} var(--ease-pop) ${t(260)} both` }}
            >
              Paid
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <span
                className="block h-full origin-left rounded-full bg-[var(--chart-1)] motion-reduce:animate-none! rtl:origin-right"
                style={{ animation: `br-preview-fill ${t(700)} var(--ease-house) ${t(380)} both` }}
              />
            </span>
            <span className="relative h-4 w-8 shrink-0 rounded-full bg-[var(--chart-1)] [--br-preview-travel:16px] rtl:[--br-preview-travel:-16px]">
              <span
                className="absolute top-0.5 left-0.5 size-3 rounded-full bg-background motion-reduce:animate-none! rtl:right-0.5 rtl:left-auto"
                style={{ animation: `br-preview-slide ${t(380)} var(--ease-spring) ${t(620)} both` }}
              />
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-muted-foreground">{MOTION_NOTE[motion]}. {inPanel ? "Close this panel and the page plays again." : "Everything you open next moves this way."}</span>
        <Button size="sm" variant="ghost" onClick={() => setRun((n) => n + 1)}>
          <RotateCcw {...icon} />
          Play again
        </Button>
      </div>
    </div>
  )
}
