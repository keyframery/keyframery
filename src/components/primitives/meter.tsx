"use client"

/* Animated drop-in for `@ui-sdk/react/meter`: same parts, same props. Swap the import and keep your code.
   This file adds motion only. Colours, radii, shadows and spacing stay yours. */

import {
  MeterIndicator as MeterIndicatorPart,
  MeterTrack as MeterTrackPart,
  MeterValue as MeterValuePart,
} from "@ui-sdk/react/meter"
import * as React from "react"

import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export * from "@ui-sdk/react/meter"

/* Roll: every digit is a column of 0 to 9 that slides to its value on a spring; other characters
   (the decimal point, units) stay put. Positions are keyed from the right, so a new leading
   digit is added instead of everything shifting. Exported for other numbers. */
function Roll({ text, className }: { text: string; className?: string }) {
  const chars = text.split("")
  /* Screen readers get the plain value; the digit columns are only for the eye. */
  return (
    <>
    <span className="sr-only">{text}</span>
    <span data-slot="roll" aria-hidden className={cn("inline-flex h-[1lh] overflow-hidden whitespace-pre tabular-nums", className)}>
      {chars.map((c, i) => {
        const key = chars.length - i
        return /\d/.test(c) ? (
          <span
            key={key}
            style={{ "--d": Number(c) } as React.CSSProperties}
            className="flex flex-col transition-[translate] duration-[calc(500ms*var(--kf-speed,1))] ease-spring [translate:0_calc(var(--d)*-1lh)] motion-reduce:transition-none!"
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

/* The value rolls to each new reading. Pass children to render your own. */
function MeterValue({ children, ...props }: React.ComponentProps<typeof MeterValuePart>) {
  return <MeterValuePart {...props}>{children ?? ((state) => <Roll text={state.text} />)}</MeterValuePart>
}

/* The track clips the fill, so its spring overshoot never shows outside. */
function MeterTrack({ className, ...props }: React.ComponentProps<typeof MeterTrackPart>) {
  return <MeterTrackPart className={withClass("overflow-hidden", className)} {...props} />
}

/* The fill moves to each new reading on a spring: it overshoots a little and settles. */
function MeterIndicator({ className, ...props }: React.ComponentProps<typeof MeterIndicatorPart>) {
  return (
    <MeterIndicatorPart
      className={withClass("block h-full [transition:width_calc(700ms*var(--kf-speed,1))_var(--ease-spring),background-color_calc(300ms*var(--kf-speed,1))_var(--ease-house)] motion-reduce:transition-none!", className)}
      {...props}
    />
  )
}

export { MeterIndicator, MeterTrack, MeterValue, Roll }
