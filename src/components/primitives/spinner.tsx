"use client"

/* Animated spinner, on UI SDK's core. UI SDK ships no spinner, so the behaviour is defined in
   `@/components/core/spinner` with `definePrimitive` and rendered here. This file draws the
   spinner (in `currentColor`) and moves it. Its size and colour stay yours.

   The spinner is the one Keyframery part allowed to keep moving at rest, because it means "busy".
   - `ring`: an arc turns at a steady pace while its length stretches and shrinks (`ease-house`),
     so it reads as effort, not a wheel.
   - `spokes`: eight spokes fade one after another around the dial.
   - Both pop in with `ease-pop` when they appear (a spinner usually replaces a label).
   Reduced motion: no turning. The ring holds a three-quarter arc, the spokes a still gradient,
   and `role="status"` still tells a screen reader it is loading. */

import type { StateOf } from "@ui-sdk/core"
import { type PartProps, usePart, usePrimitive } from "@ui-sdk/react/primitive"
import * as React from "react"

import { spinner, type SpinnerOptions, type SpinnerVariant } from "@/components/core/spinner"
import { cn } from "@/lib/utils"

/* `className` may be a string or a function of the part's state: keep both working. */
function withClass<C>(className: C, ...base: string[]): C {
  return (typeof className === "function"
    ? (state: unknown) => cn(...base, (className as (state: unknown) => string | undefined)(state))
    : cn(...base, className as string | undefined)) as C
}

const keyframes =
  "@keyframes kf-spinner-in{from{opacity:0;scale:0.4;filter:blur(2px)}}" +
  "@keyframes kf-spinner-turn{to{rotate:360deg}}" +
  "@keyframes kf-spinner-arc{0%{stroke-dasharray:6 100;stroke-dashoffset:0}50%{stroke-dasharray:62 100;stroke-dashoffset:-14}100%{stroke-dasharray:6 100;stroke-dashoffset:-94}}" +
  "@keyframes kf-spinner-spoke{from{opacity:1}to{opacity:0.16}}" +
  "@media (prefers-reduced-motion:reduce){@keyframes kf-spinner-in{from{opacity:0}}}"

const spokes = Array.from({ length: 8 }, (_, i) => i)

function Ring() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="size-full animate-[kf-spinner-turn_calc(780ms*var(--kf-speed,1))_linear_infinite] motion-reduce:animate-none"
    >
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="2.5" opacity="0.16" />
      <circle
        cx="12"
        cy="12"
        r="9.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        pathLength={100}
        className="origin-center -rotate-90 [stroke-dasharray:72_100] animate-[kf-spinner-arc_calc(1500ms*var(--kf-speed,1))_var(--ease-house)_infinite] motion-reduce:animate-none"
      />
    </svg>
  )
}

function Spokes() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-full">
      {spokes.map((i) => (
        <line
          key={i}
          x1="12"
          y1="3"
          x2="12"
          y2="7.5"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          transform={`rotate(${i * 45} 12 12)`}
          /* Each spoke starts its fade one eighth of a turn after the last: the brightest one walks round. */
          style={{ "--kf-i": i, opacity: 1 - i * 0.1 } as React.CSSProperties}
          className="animate-[kf-spinner-spoke_calc(800ms*var(--kf-speed,1))_linear_infinite] [animation-delay:calc((var(--kf-i)-8)*100ms*var(--kf-speed,1))] motion-reduce:animate-none"
        />
      ))}
    </svg>
  )
}

function Spinner({
  label,
  variant = "ring",
  className,
  children,
  ...props
}: SpinnerOptions & PartProps<"span", StateOf<typeof spinner, "root">>) {
  const handle = usePrimitive(spinner, { label, variant })
  return (
    <>
      <style href="kf-spinner" precedence="default">
        {keyframes}
      </style>
      {usePart(
        handle,
        "root",
        {},
        {
          ...props,
          className: withClass(className, "inline-flex shrink-0 animate-[kf-spinner-in_calc(420ms*var(--kf-speed,1))_var(--ease-pop)_backwards] motion-reduce:animate-none"),
          children: children ?? (variant === "spokes" ? <Spokes /> : <Ring />),
        },
        "span",
      )}
    </>
  )
}

export { Spinner, type SpinnerVariant }
