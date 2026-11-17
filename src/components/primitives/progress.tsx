"use client"

/* Animated drop-in for `@ui-sdk/react/progress`: same parts, same props. Swap the import and keep your code.
   This file adds motion only. Colours, radii, shadows and spacing stay yours. */

import {
  ProgressIndicator as ProgressIndicatorPart,
  ProgressTrack as ProgressTrackPart,
  ProgressValue as ProgressValuePart,
} from "@ui-sdk/react/progress"
import * as React from "react"

import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export * from "@ui-sdk/react/progress"

/* Roll: every digit is a column of 0 to 9 that slides to its value on a spring; other characters
   (%, spaces, units) stay put. Positions are keyed from the right, so 9% to 10% rolls the units
   digit and adds a tens digit instead of shifting everything. Exported for other numbers. */
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
function ProgressValue({ children, ...props }: React.ComponentProps<typeof ProgressValuePart>) {
  return (
    <ProgressValuePart {...props}>
      {children ?? ((state) => <Roll text={state.text} />)}
    </ProgressValuePart>
  )
}

/* The track clips the fill, so its spring overshoot never shows outside. */
function ProgressTrack({ className, ...props }: React.ComponentProps<typeof ProgressTrackPart>) {
  return <ProgressTrackPart className={withClass("overflow-hidden", className)} {...props} />
}

/* The fill moves to each new width on a spring (it overshoots a little and settles). While the
   amount is unknown, a 40% bar slides through the track; with reduced motion it rests full width. */
function ProgressIndicator({ className, ...props }: React.ComponentProps<typeof ProgressIndicatorPart>) {
  return (
    <>
      <style href="kf-progress-slide" precedence="default">
        {"@keyframes kf-progress-slide{from{translate:-100% 0}to{translate:250% 0}}"}
      </style>
      <ProgressIndicatorPart
        className={withClass(
          cn(
            "block h-full [transition:width_calc(700ms*var(--kf-speed,1))_var(--ease-spring),background-color_calc(300ms*var(--kf-speed,1))_var(--ease-house)]",
            "data-indeterminate:w-2/5 data-indeterminate:animate-[kf-progress-slide_1.3s_cubic-bezier(0.65,0,0.35,1)_infinite]",
            "motion-reduce:transition-none! motion-reduce:data-indeterminate:w-full motion-reduce:data-indeterminate:animate-none!",
          ),
          className,
        )}
        {...props}
      />
    </>
  )
}

export { ProgressIndicator, ProgressTrack, ProgressValue, Roll }
