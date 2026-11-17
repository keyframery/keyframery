"use client"

/* Animated badge, on UI SDK's core. UI SDK ships no badge, so the behaviour is defined in
   `@/components/core/badge` with `definePrimitive` and rendered here with shadcn's part name: swap
   the import and keep your markup. This file adds motion only. Colours, radii and spacing stay yours.

   - The badge pops in when it mounts.
   - Roll: a `count` is drawn as one column of digits per place that slides to its value on a spring,
     so it rolls up when it grows and down when it shrinks.
   - `dot`: the status dot pops and sends out one ring each time what the badge says changes
     (`data-pulse` on the dot). Nothing pulses on the first render. */

import { createParts, type PartProps, usePart, usePrimitive } from "@ui-sdk/react/primitive"
import type { StateOf } from "@ui-sdk/core"
import * as React from "react"

import { badge, roll } from "@/components/core/badge"
import { cn } from "@/lib/utils"

type BadgeRootState = StateOf<typeof badge, "root">

/* Two copies of each keyframe, one per `data-pulse` value: switching the animation name restarts it. */
const keyframes =
  "@keyframes kf-badge-in{from{opacity:0;scale:.6}}" +
  "@keyframes kf-badge-in-b{from{opacity:0;scale:.6}}" +
  "@keyframes kf-badge-ping{from{opacity:.55;scale:1}to{opacity:0;scale:3.4}}" +
  "@keyframes kf-badge-ping-b{from{opacity:.55;scale:1}to{opacity:0;scale:3.4}}"

/* A class name that may be a function of the part's state, merged after ours. */
function withClass<S>(ours: string, theirs: string | ((state: S) => string | undefined) | undefined) {
  return typeof theirs === "function" ? (state: S) => cn(ours, theirs(state)) : cn(ours, theirs)
}

const { Root: RollRoot, Digit: RollDigit } = createParts(roll, { root: "span", digit: "span" })

/* Roll: each digit is a column of 0 to 9 that slides to its value on a spring. Columns are keyed
   from the right, so a new leading digit rises in from below instead of every digit shifting.
   Exported for other numbers. */
function Roll({ text, className }: { text: string; className?: string }) {
  return (
    <RollRoot
      text={text}
      className={cn(
        "inline-flex h-[1lh] overflow-hidden whitespace-pre tabular-nums [mask-image:linear-gradient(transparent,black_18%,black_82%,transparent)]",
        className,
      )}
    >
      {(state) =>
        state.places.map((place) => (
          <RollDigit
            key={place}
            value={place}
            className={(digit) =>
              digit.digit === undefined
                ? undefined
                : "flex flex-col transition-[translate] duration-[calc(520ms*var(--kf-speed,1))] ease-spring [translate:0_calc(var(--d)*-1lh)] starting:[translate:0_1lh] motion-reduce:transition-none!"
            }
          >
            {(digit) =>
              digit.digit === undefined
                ? digit.char
                : Array.from({ length: 10 }, (_, d) => (
                    <span key={d} className="h-[1lh]">
                      {d}
                    </span>
                  ))
            }
          </RollDigit>
        ))
      }
    </RollRoot>
  )
}

/* The status dot: a solid core (`before`) and a ring (`after`) that spreads and fades. Both play
   on each change, keyed on `data-pulse`. */
function BadgeDot({ className, ...props }: PartProps<"span", StateOf<typeof badge, "dot">>) {
  return usePart(
    badge,
    "dot",
    {},
    {
      ...props,
      className: withClass(
        cn(
          "relative inline-block size-1.5 shrink-0",
          "before:absolute before:inset-0 before:rounded-full before:bg-current",
          "after:absolute after:inset-0 after:rounded-full after:bg-current after:opacity-0",
          "data-[pulse=odd]:before:animate-[kf-badge-in_calc(420ms*var(--kf-speed,1))_var(--ease-pop)_backwards]",
          "data-[pulse=even]:before:animate-[kf-badge-in-b_calc(420ms*var(--kf-speed,1))_var(--ease-pop)_backwards]",
          "data-[pulse=odd]:after:animate-[kf-badge-ping_calc(800ms*var(--kf-speed,1))_var(--ease-house)]",
          "data-[pulse=even]:after:animate-[kf-badge-ping-b_calc(800ms*var(--kf-speed,1))_var(--ease-house)]",
          "motion-reduce:before:animate-none! motion-reduce:after:animate-none!",
        ),
        className,
      ),
    },
    "span",
  )
}

function textOf(node: unknown): string {
  return typeof node === "string" || typeof node === "number" ? String(node) : ""
}

function Badge({
  className,
  count,
  max,
  dot,
  children,
  ...props
}: Omit<PartProps<"span", BadgeRootState>, "children"> & {
  /** Renders the number as rolling digits that roll up or down when it changes. */
  count?: number
  /** Above this, shows `max+`. */
  max?: number
  /** A leading status dot that pulses once whenever the badge's value (count or text) changes. */
  dot?: boolean
  children?: React.ReactNode | ((state: BadgeRootState) => React.ReactNode)
}) {
  const handle = usePrimitive(badge, { count, max, dot, text: textOf(children) })
  return (
    <>
      <style href="kf-badge" precedence="default">
        {keyframes}
      </style>
      {usePart(
        handle,
        "root",
        {},
        {
          ...props,
          className: withClass(
            "animate-[kf-badge-in_calc(380ms*var(--kf-speed,1))_var(--ease-pop)_backwards] motion-reduce:animate-none!",
            className,
          ),
          children: (state: BadgeRootState) => (
            <>
              {state.dot && <BadgeDot />}
              {state.count !== undefined && (
                <>
                  <Roll text={state.countText} />
                  <span className="sr-only">{state.countText}</span>
                </>
              )}
              {typeof children === "function" ? children(state) : children}
            </>
          ),
        },
        "span",
      )}
    </>
  )
}

export { Badge, BadgeDot, Roll }
