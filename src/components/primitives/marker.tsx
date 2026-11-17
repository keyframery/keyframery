"use client"

/* An animated marker, on UI SDK's core. UI SDK ships no marker, so the behaviour is defined in
   `@/components/core/marker` with `definePrimitive` and rendered here. This file adds motion only.
   Colours, rules, spacing and type stay yours.

   - Draw: a `separator` marker's rules (its `before:` and `after:`) draw outward from the words;
     a `border` marker's rule (its `after:`) draws from the start of the line.
   - Pop: the icon lands with a little overshoot.
   - The words rise out of a soft blur. While `pending`, a light sweeps across them; when the work
     is done they rise in again, so the new text arrives instead of just replacing the old. */

import { createParts } from "@ui-sdk/react/primitive"
import * as React from "react"

import { marker } from "@/components/core/marker"
import { cn } from "@/lib/utils"

const { Root: MarkerRoot, Icon: MarkerIconPart, Content: MarkerContentPart } = createParts(marker, {
  root: "div",
  icon: "span",
  content: "span",
})

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

const keyframes =
  "@keyframes kf-marker-in{from{opacity:0;translate:0 6px;filter:blur(4px)}}" +
  "@keyframes kf-marker-pop{from{opacity:0;scale:0.5}}" +
  "@keyframes kf-marker-line{from{scale:0 1}}" +
  "@keyframes kf-marker-sweep{from{background-position:100% 0}to{background-position:0 0}}"

function Marker({ className, ...props }: React.ComponentProps<typeof MarkerRoot>) {
  return (
    <>
      <style href="kf-marker" precedence="default">
        {keyframes}
      </style>
      <MarkerRoot
        className={withClass(
          cn(
            /* Rules draw outward from the words: the one before grows from its inner end. */
            "data-[variant=separator]:before:origin-right data-[variant=separator]:after:origin-left",
            "rtl:data-[variant=separator]:before:origin-left rtl:data-[variant=separator]:after:origin-right",
            "data-[variant=separator]:before:animate-[kf-marker-line_calc(700ms*var(--kf-speed,1))_var(--ease-spring)_backwards]",
            "data-[variant=separator]:after:animate-[kf-marker-line_calc(700ms*var(--kf-speed,1))_var(--ease-spring)_backwards]",
            /* The border rule draws from where the line starts. */
            "data-[variant=border]:after:origin-left rtl:data-[variant=border]:after:origin-right",
            "data-[variant=border]:after:animate-[kf-marker-line_calc(820ms*var(--kf-speed,1))_var(--ease-house)_backwards]",
            "motion-reduce:before:animate-none! motion-reduce:after:animate-none!",
          ),
          className,
        )}
        {...props}
      />
    </>
  )
}

/* Pops in once the work it marks is done (a spinner swapped for a check pops on arrival too). */
function MarkerIcon({ className, ...props }: React.ComponentProps<typeof MarkerIconPart>) {
  return (
    <MarkerIconPart
      className={withClass(
        cn(
          "inline-flex",
          "not-data-pending:animate-[kf-marker-pop_calc(460ms*var(--kf-speed,1))_var(--ease-pop)_calc(60ms*var(--kf-speed,1))_backwards]",
          "motion-reduce:animate-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* The sweep is a gradient of the text's own colour, clipped to the letters. Switching between the
   sweep and the rise restarts the rise, so finished text always arrives with it. */
function MarkerContent({ className, ...props }: React.ComponentProps<typeof MarkerContentPart>) {
  return (
    <MarkerContentPart
      className={withClass(
        cn(
          "not-data-pending:animate-[kf-marker-in_calc(480ms*var(--kf-speed,1))_var(--ease-spring)_backwards]",
          "data-pending:bg-[linear-gradient(90deg,currentColor_0_32%,color-mix(in_oklch,currentColor_15%,transparent)_50%,currentColor_68%_100%)]",
          "data-pending:bg-size-[300%_100%] data-pending:bg-clip-text data-pending:[-webkit-text-fill-color:transparent]",
          "data-pending:animate-[kf-marker-sweep_calc(1800ms*var(--kf-speed,1))_var(--ease-house)_infinite]",
          "rtl:data-pending:[animation-direction:reverse]",
          "motion-reduce:animate-none! motion-reduce:data-pending:bg-none! motion-reduce:data-pending:[-webkit-text-fill-color:currentColor]!",
        ),
        className,
      )}
      {...props}
    />
  )
}

export { Marker, MarkerContent, MarkerIcon }
