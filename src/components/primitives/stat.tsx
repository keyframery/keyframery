"use client"

/* Animated stats, on UI SDK's core. UI SDK ships no stat, so the behaviour is defined in
   `@/components/core/stat` with `definePrimitive` and rendered here: `Stat` with `StatLabel`,
   `StatValue`, `StatDelta`, `StatComparison`, `StatIcon` and `StatChart` (which holds a Sparkline),
   and `StatGroup` for several on one surface. This file adds motion only. Colours, radii, type and
   spacing stay yours (style `data-trend`, `data-tone` and `data-loading`).

   - Cascade: on arrival the parts rise out of a light blur one after another, label first.
   - Roll: the value and the delta roll digit by digit to each new number.
   - Flip: when the delta changes direction its colour crossfades (the styled arrow turns).
   - Loading: the parts keep their own geometry while loading; when it ends their ink fades back
     in, one after another. */

import type { StateOf } from "@ui-sdk/core"
import { createParts, type PartProps, usePart, usePrimitive } from "@ui-sdk/react/primitive"
import * as React from "react"

import { stat, statGroup, type StatOptions } from "@/components/core/stat"
import { cn } from "@/lib/utils"

type StatPart<Slot extends "root" | "label" | "value" | "delta" | "comparison" | "icon" | "chart", Tag extends keyof React.JSX.IntrinsicElements = "div"> = PartProps<Tag, StateOf<typeof stat, Slot>>

/* UI SDK parts take a class name or a function of the part's state. Keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* ---------------------------------------------------------------- Roll */

/* Roll: every digit is a column of 0 to 9 that slides to its value on a spring; other characters
   stay put. Positions are keyed from the right, so a new leading digit is added instead of
   everything shifting. Screen readers get the plain text. */
function Roll({ text, className }: { text: string; className?: string }) {
  const chars = text.split("")
  return (
    <>
      <span className="sr-only">{text}</span>
      <span data-roll="" aria-hidden className={cn("inline-flex h-[1lh] overflow-hidden whitespace-pre tabular-nums", className)}>
        {chars.map((c, i) => {
          const key = chars.length - i
          return /\d/.test(c) ? (
            <span
              key={key}
              style={{ "--d": Number(c), "--k": key } as React.CSSProperties}
              className="flex flex-col transition-[translate] duration-[calc(560ms*var(--kf-speed,1))] ease-spring [transition-delay:calc(min(var(--k),8)*calc(18ms*var(--kf-speed,1)))] [translate:0_calc(var(--d)*-1lh)] motion-reduce:transition-none!"
            >
              {Array.from({ length: 10 }, (_, d) => (
                <span key={d} className="h-[1lh]">
                  {d}
                </span>
              ))}
            </span>
          ) : (
            <span key={key}>{c}</span>
          )
        })}
      </span>
    </>
  )
}

/* ---------------------------------------------------------------- motion */

const keyframes = "@keyframes kf-stat-part{from{opacity:0;translate:0 10px;filter:blur(5px)}}"

/* Each part rises in after the one before it; while loading its ink is hidden (the styled part
   draws the placeholder), and when loading ends the ink comes back in the same order. */
const partMotion = cn(
  "animate-[kf-stat-part_calc(560ms*var(--kf-speed,1))_var(--ease-spring)_backwards] motion-reduce:animate-none",
  "[animation-delay:calc(calc(40ms*var(--kf-speed,1))+(min(sibling-index(),8)-1)*calc(60ms*var(--kf-speed,1)))]",
  "transition-[color,background-color,opacity,filter] duration-[calc(420ms*var(--kf-speed,1))] ease-house",
  "[transition-delay:calc((min(sibling-index(),8)-1)*calc(50ms*var(--kf-speed,1)))] data-loading:[transition-delay:0ms]",
  "motion-reduce:transition-none",
)

/* ---------------------------------------------------------------- stat */

type StatProps = StatOptions & Omit<StatPart<"root">, keyof StatOptions>

/** One number. With no children it shows its label, value and delta. */
function Stat({ label, value, formatValue, delta, formatDelta, downIsGood, flatThreshold, loading, className, children, ...props }: StatProps) {
  const handle = usePrimitive(stat, { label, value, formatValue, delta, formatDelta, downIsGood, flatThreshold, loading })
  return (
    <>
      <style href="kf-stat" precedence="default">
        {keyframes}
      </style>
      {usePart(
        handle,
        "root",
        {},
        {
          ...props,
          className: withClass("group/stat relative min-w-0", className),
          children: children ?? (
            <>
              <StatLabel />
              <StatValue />
              <StatDelta />
            </>
          ),
        },
        "div",
      )}
    </>
  )
}

/** The label. With no children it shows the stat's `label`. */
function StatLabel({ className, children, ...props }: StatPart<"label">) {
  return usePart(stat, "label", {}, { ...props, className: withClass(partMotion, className), children: children ?? ((state) => state.label) }, "div")
}

/** The number. With no children its formatted value Rolls to each new number. */
function StatValue({ className, children, ...props }: StatPart<"value">) {
  return usePart(stat, "value", {}, { ...props, className: withClass(partMotion, className), children: children ?? ((state) => <Roll text={state.text} />) }, "div")
}

/** The change. With no children: its direction in words for screen readers, and its size, which Rolls. */
function StatDelta({ className, children, ...props }: StatPart<"delta">) {
  return usePart(
    stat,
    "delta",
    {},
    {
      ...props,
      className: withClass(partMotion, className),
      children:
        children ??
        ((state) => (
          <>
            <span className="sr-only">{state.words}</span>
            <span aria-hidden>{state.trend === "up" ? "+" : state.trend === "down" ? "−" : ""}</span>
            <span aria-hidden>
              <Roll text={state.text} />
            </span>
          </>
        )),
    },
    "div",
  )
}

/** What the delta compares against, like "vs last 30 days". */
function StatComparison({ className, ...props }: StatPart<"comparison">) {
  return usePart(stat, "comparison", {}, { ...props, className: withClass(partMotion, className) }, "div")
}

/** A small icon for the number. */
function StatIcon({ className, ...props }: StatPart<"icon">) {
  return usePart(stat, "icon", {}, { ...props, className: withClass(partMotion, className) }, "div")
}

/** Holds a Sparkline (or any small chart) under the number. Its `data-tone` matches the delta. */
function StatChart({ className, ...props }: StatPart<"chart">) {
  return usePart(stat, "chart", {}, { ...props, className: withClass(partMotion, className) }, "div")
}

/* ---------------------------------------------------------------- group */

const group = createParts(statGroup, { root: "div", grid: "div" })

/** Several stats as one object. Name it with `aria-label`. Its children go in its grid. */
function StatGroup({ className, children, gridClassName, ...props }: React.ComponentProps<typeof group.Root> & { gridClassName?: string }) {
  return (
    <group.Root className={withClass("relative min-w-0", className)} {...props}>
      <group.Grid className={cn("grid", gridClassName)}>{children as React.ReactNode}</group.Grid>
    </group.Root>
  )
}

export { Roll, Stat, StatChart, StatComparison, StatDelta, StatGroup, StatIcon, StatLabel, type StatProps, StatValue }
export { defaultFormatDelta, type StatTone, type StatTrend } from "@/components/core/stat"
