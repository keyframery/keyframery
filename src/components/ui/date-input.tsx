"use client"

/* Styled date input: the animated primitive plus the Keyframery look. */

import * as React from "react"

import {
  DateInput as DateInputPrimitive,
  DateInputSegment as DateInputSegmentPrimitive,
  createDateInputController,
} from "@/components/primitives/date-input"
import { cn } from "@/lib/utils"

/* The field look, as in Input: one hairline variable that hover, focus and invalid change. */
const fieldBox =
  "rounded-[10px] bg-background text-[13px] " +
  "[--field-line:rgb(0_0_0/0.09)] dark:[--field-line:rgb(255_255_255/0.1)] " +
  "shadow-[0_0_0_1px_var(--field-line),0_1px_2px_rgb(0_0_0/0.05)] dark:shadow-[0_0_0_1px_var(--field-line)] " +
  "transition-[box-shadow,background-color] duration-[calc(150ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none! " +
  "hover:[--field-line:rgb(0_0_0/0.16)] dark:hover:[--field-line:rgb(255_255_255/0.18)]"

/* The field. The ring follows whichever segment has focus; invalid wins over focus. */
function DateInput({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DateInputPrimitive>) {
  return (
    <DateInputPrimitive
      className={cn(
        fieldBox,
        "inline-flex h-9 w-fit min-w-0 cursor-text items-center px-2 text-foreground tabular-nums",
        "has-[input:focus-visible]:ring-[3px] has-[input:focus-visible]:ring-ring/25 has-[input:focus-visible]:[--field-line:var(--ring)] dark:has-[input:focus-visible]:[--field-line:var(--ring)]",
        "data-invalid:ring-destructive/25! data-invalid:[--field-line:var(--destructive)]!",
        "data-readonly:bg-muted/50",
        /* The highlight the primitive glides under the focused segment. */
        "before:rounded-[6px] before:bg-accent",
        "data-disabled:cursor-not-allowed data-disabled:bg-muted data-disabled:text-muted-foreground data-disabled:[--field-line:rgb(0_0_0/0.06)] dark:data-disabled:[--field-line:rgb(255_255_255/0.06)]",
        className,
      )}
      {...props}
    >
      {children ??
        ((state) =>
          state.segments.map((segment) => (
            <DateInputSegment key={segment.key} segment={segment} />
          )))}
    </DateInputPrimitive>
  )
}

/* A segment sizes to its text. The one with focus sits on the accent tile the primitive glides
   between segments, and an empty one shows its placeholder in a quieter colour. */
function DateInputSegment({
  className,
  ...props
}: React.ComponentProps<typeof DateInputSegmentPrimitive>) {
  return (
    <DateInputSegmentPrimitive
      className={cn(
        "h-6 rounded-[6px] bg-transparent px-[3px] text-center text-[13px] leading-none font-medium text-foreground tabular-nums outline-none",
        "[field-sizing:content] caret-transparent selection:bg-transparent",
        /* Room for the full number even while empty, so the field keeps its width. */
        "data-[type=day]:min-w-[calc(2ch+6px)] data-[type=month]:min-w-[calc(2ch+6px)] data-[type=hour]:min-w-[calc(2ch+6px)] data-[type=minute]:min-w-[calc(2ch+6px)] data-[type=second]:min-w-[calc(2ch+6px)]",
        "data-[type=year]:min-w-[calc(4ch+6px)] data-[type=dayPeriod]:min-w-[calc(2.2em+6px)]",
        "transition-colors duration-[calc(150ms*var(--kf-speed,1))] motion-reduce:transition-none! focus:text-accent-foreground",
        "placeholder:text-muted-foreground/70 data-empty:text-muted-foreground/70",
        "data-[type=literal]:flex data-[type=literal]:items-center data-[type=literal]:px-px data-[type=literal]:font-normal data-[type=literal]:text-muted-foreground/70",
        "data-[type=dayPeriod]:ml-1 data-[type=dayPeriod]:uppercase",
        "data-invalid:not-data-[type=literal]:text-destructive",
        "data-disabled:pointer-events-none data-disabled:text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}

export { DateInput, DateInputSegment, createDateInputController }
