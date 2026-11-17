"use client"

export * from "@/components/primitives/time-input"

/* Styled time input: the animated primitive plus the Keyframery look. */

/* Theming: inherit these optional variables; unset values retain the original light/dark tokens.
   --time-input-face: Time field surface (default: --background; --muted at 50% read-only; --muted disabled).
   --time-input-ink: Time segment text (default: --foreground; --accent-foreground focused; --muted-foreground disabled).
   --time-input-accent: Focused segment tile (default: --accent).
   --time-input-height: Field height (default: 2.25rem).
   --time-input-radius: Field corners (default: 10px).
   --time-input-segment-radius: Segment tile corners (default: 6px).
 */

import * as React from "react"

import {
  TimeInput as TimeInputPrimitive,
  TimeInputSegment as TimeInputSegmentPrimitive,
  createTimeInputController,
} from "@/components/primitives/time-input"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* The field look, as in Input: one hairline variable that hover, focus and invalid change. */
const fieldBox =
  "rounded-[var(--time-input-radius,10px)] bg-[var(--time-input-face,var(--background))] text-[13px] " +
  "[--field-line:rgb(0_0_0/0.09)] dark:[--field-line:rgb(255_255_255/0.1)] " +
  "shadow-[0_0_0_1px_var(--field-line),0_1px_2px_rgb(0_0_0/0.05)] dark:shadow-[0_0_0_1px_var(--field-line)] " +
  "transition-[box-shadow,background-color] duration-[calc(150ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none! " +
  "hover:[--field-line:rgb(0_0_0/0.16)] dark:hover:[--field-line:rgb(255_255_255/0.18)]"

/* The field. The ring follows whichever segment has focus; invalid wins over focus. */
function TimeInput({
  speed,
  className,
  children,
  ...props
}: React.ComponentProps<typeof TimeInputPrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <TimeInputPrimitive
        className={withClass(
          cn(
            fieldBox,
            "inline-flex h-[var(--time-input-height,2.25rem)] w-fit min-w-0 cursor-text items-center px-2 text-[color:var(--time-input-ink,var(--foreground))] tabular-nums",
            "has-[input:focus-visible]:ring-[3px] has-[input:focus-visible]:ring-ring/25 has-[input:focus-visible]:[--field-line:var(--ring)] dark:has-[input:focus-visible]:[--field-line:var(--ring)]",
            "data-invalid:ring-destructive/25! data-invalid:[--field-line:var(--destructive)]!",
            "data-readonly:bg-[var(--time-input-face,color-mix(in_oklab,var(--muted)_50%,transparent))]",
            /* The highlight the primitive glides under the focused segment. */
            "before:rounded-[var(--time-input-segment-radius,6px)] before:bg-[var(--time-input-accent,var(--accent))]",
            "data-disabled:cursor-not-allowed data-disabled:bg-[var(--time-input-face,var(--muted))] data-disabled:text-[color:var(--time-input-ink,var(--muted-foreground))] data-disabled:[--field-line:rgb(0_0_0/0.06)] dark:data-disabled:[--field-line:rgb(255_255_255/0.06)]",
          ),
          className,
        )}
        {...props}
      >
        {children ??
          ((state) =>
            state.segments.map((segment) => (
              <TimeInputSegment key={segment.key} segment={segment} />
            )))}
      </TimeInputPrimitive>
    </Speed>
  )
}

/* A segment sizes to its text. The one with focus sits on the accent tile the primitive glides
   between segments, and an empty one shows its placeholder in a quieter colour. */
function TimeInputSegment({
  className,
  ...props
}: React.ComponentProps<typeof TimeInputSegmentPrimitive>) {
  return (
    <TimeInputSegmentPrimitive
      className={withClass(
        cn(
          "h-6 rounded-[var(--time-input-segment-radius,6px)] bg-transparent px-[3px] text-center text-[13px] leading-none font-medium text-[color:var(--time-input-ink,var(--foreground))] tabular-nums outline-none",
          "[field-sizing:content] caret-transparent selection:bg-transparent",
          /* Room for the full number even while empty, so the field keeps its width. */
          "data-[type=day]:min-w-[calc(2ch+6px)] data-[type=month]:min-w-[calc(2ch+6px)] data-[type=hour]:min-w-[calc(2ch+6px)] data-[type=minute]:min-w-[calc(2ch+6px)] data-[type=second]:min-w-[calc(2ch+6px)]",
          "data-[type=year]:min-w-[calc(4ch+6px)] data-[type=dayPeriod]:min-w-[calc(2.2em+6px)]",
          "transition-colors duration-[calc(150ms*var(--kf-speed,1))] motion-reduce:transition-none! focus:text-[color:var(--time-input-ink,var(--accent-foreground))]",
          "placeholder:text-muted-foreground/70 data-empty:text-muted-foreground/70",
          "data-[type=literal]:flex data-[type=literal]:items-center data-[type=literal]:px-px data-[type=literal]:font-normal data-[type=literal]:text-muted-foreground/70",
          "data-[type=dayPeriod]:ml-1 data-[type=dayPeriod]:uppercase",
          "data-invalid:not-data-[type=literal]:text-destructive",
          "data-disabled:pointer-events-none data-disabled:text-[color:var(--time-input-ink,var(--muted-foreground))]",
        ),
        className,
      )}
      {...props}
    />
  )
}

export { TimeInput, TimeInputSegment, createTimeInputController }
