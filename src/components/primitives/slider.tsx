"use client"

/* Animated drop-in for `@ui-sdk/react/slider`: same parts, same props. Swap the import and keep your code.
   This file adds motion only. Colours, radii, shadows and spacing stay yours. */

import {
  SliderIndicator as SliderIndicatorPart,
  SliderThumb as SliderThumbPart,
  SliderValue as SliderValuePart,
} from "@ui-sdk/react/slider"
import * as React from "react"

import { cn } from "@/lib/utils"

export * from "@ui-sdk/react/slider"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* When the value jumps (a key, a value set from code) the fill and thumbs travel there on a
   spring. UI SDK marks a press on the track as the start of a drag, so while dragging they
   follow on a short spring instead: a press on the track still springs there, and a drag
   stays close to the pointer. */
const follow =
  "[transition:left_calc(420ms*var(--kf-speed,1))_var(--ease-spring),right_calc(420ms*var(--kf-speed,1))_var(--ease-spring),width_calc(420ms*var(--kf-speed,1))_var(--ease-spring),bottom_calc(420ms*var(--kf-speed,1))_var(--ease-spring),height_calc(420ms*var(--kf-speed,1))_var(--ease-spring),scale_calc(260ms*var(--kf-speed,1))_var(--ease-pop)]"
const dragging =
  "[[data-slot=slider][data-dragging]_&]:[transition:left_calc(200ms*var(--kf-speed,1))_var(--ease-spring),right_calc(200ms*var(--kf-speed,1))_var(--ease-spring),width_calc(200ms*var(--kf-speed,1))_var(--ease-spring),bottom_calc(200ms*var(--kf-speed,1))_var(--ease-spring),height_calc(200ms*var(--kf-speed,1))_var(--ease-spring),scale_calc(260ms*var(--kf-speed,1))_var(--ease-pop)]"

function SliderIndicator({ className, ...props }: React.ComponentProps<typeof SliderIndicatorPart>) {
  return (
    <SliderIndicatorPart
      className={withClass(
        cn(
          follow, dragging, "motion-reduce:[transition:none]!",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* The thumb grows with a pop while it is held. */
function SliderThumb({ className, ...props }: React.ComponentProps<typeof SliderThumbPart>) {
  return (
    <SliderThumbPart
      className={withClass(
        cn(follow, dragging, "data-dragging:scale-[1.3] motion-reduce:[transition:none]!"),
        className,
      )}
      {...props}
    />
  )
}

/* Roll: every digit is a column of 0 to 9 that slides to its value on a spring. Other
   characters (currency, separators, units) sit still. Screen readers get the plain text. */
function Roll({ text }: { text: string }) {
  const chars = text.split("")
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="inline-flex h-[1lh] overflow-hidden whitespace-pre">
        {chars.map((c, i) => {
          const key = chars.length - i
          return /\d/.test(c) ? (
            <span key={key} className="relative inline-block">
              <span className="invisible">0</span>
              <span
                style={{ "--kf-d": Number(c) } as React.CSSProperties}
                className="absolute inset-x-0 top-0 flex flex-col [translate:0_calc(var(--kf-d)*-1lh)] transition-[translate] duration-[calc(500ms*var(--kf-speed,1))] ease-spring motion-reduce:transition-none!"
              >
                {Array.from({ length: 10 }, (_, d) => (
                  <span key={d} className="h-[1lh] text-center">
                    {d}
                  </span>
                ))}
              </span>
            </span>
          ) : (
            <span key={key + c}>{c}</span>
          )
        })}
      </span>
    </>
  )
}

function SliderValue({ className, children, ...props }: React.ComponentProps<typeof SliderValuePart>) {
  return (
    <SliderValuePart
      className={withClass("tabular-nums", className)}
      {...props}
    >
      {children ?? ((state: { text: string }) => <Roll text={state.text} />)}
    </SliderValuePart>
  )
}

export { SliderIndicator, SliderThumb, SliderValue }
