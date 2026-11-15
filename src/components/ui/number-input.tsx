"use client"

/* Styled number input: the animated primitive plus the Keyframery look. */

import * as React from "react"

import {
  NumberInput as NumberInputRoot,
  NumberInputControl as NumberInputControlPrimitive,
  NumberInputDecrement as NumberInputDecrementPrimitive,
  NumberInputGroup as NumberInputGroupPrimitive,
  NumberInputIncrement as NumberInputIncrementPrimitive,
  NumberInputScrubArea as NumberInputScrubAreaPart,
  NumberInputScrubAreaCursor as NumberInputScrubAreaCursorPart,
  createNumberInputController,
} from "@/components/primitives/number-input"
import { cn } from "@/lib/utils"

function NumberInput({ className, ...props }: React.ComponentProps<typeof NumberInputRoot>) {
  return <NumberInputRoot className={cn("flex min-w-0 flex-col gap-1.5", className)} {...props} />
}

/* The group is the field: two keys with the value between them. */
function NumberInputGroup({
  className,
  ...props
}: React.ComponentProps<typeof NumberInputGroupPrimitive>) {
  return (
    <NumberInputGroupPrimitive
      className={cn(
        "flex h-9 w-full min-w-0 items-center gap-1 rounded-[10px] bg-background p-1 text-[13px]",
        "outline-0 outline-ring",
        "[--field-line:rgb(0_0_0/0.09)] dark:[--field-line:rgb(255_255_255/0.1)]",
        "shadow-[0_0_0_1px_var(--field-line),0_1px_2px_rgb(0_0_0/0.05)] dark:shadow-[0_0_0_1px_var(--field-line)]",
        "hover:[--field-line:rgb(0_0_0/0.16)] dark:hover:[--field-line:rgb(255_255_255/0.18)]",
        "has-[input:focus-visible]:outline-[3px] has-[input:focus-visible]:outline-ring/30 has-[input:focus-visible]:[--field-line:var(--ring)] dark:has-[input:focus-visible]:[--field-line:var(--ring)]",
        "data-scrubbing:outline-[3px] data-scrubbing:outline-ring/30 data-scrubbing:[--field-line:var(--ring)] dark:data-scrubbing:[--field-line:var(--ring)]",
        "has-aria-invalid:outline-destructive has-aria-invalid:has-[input:focus-visible]:outline-destructive/30 has-aria-invalid:[--field-line:var(--destructive)] dark:has-aria-invalid:[--field-line:var(--destructive)]",
        "data-readonly:bg-muted/50",
        "data-disabled:cursor-not-allowed data-disabled:bg-muted data-disabled:[--field-line:rgb(0_0_0/0.06)] dark:data-disabled:[--field-line:rgb(255_255_255/0.06)]",
        className,
      )}
      {...props}
    />
  )
}

function NumberInputControl({
  className,
  ...props
}: React.ComponentProps<typeof NumberInputControlPrimitive>) {
  return (
    <NumberInputControlPrimitive
      className={cn(
        "h-full w-full min-w-0 flex-1 bg-transparent text-center text-[13px] font-medium text-foreground tabular-nums outline-none placeholder:text-muted-foreground/70",
        "data-disabled:cursor-not-allowed data-disabled:text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}

/* A small key. It goes flat at its bound or when the field is off. */
const stepKey = cn(
  "grid size-7 shrink-0 cursor-pointer place-items-center rounded-[7px] bg-background text-foreground outline-none select-none",
  "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_2px_4px_-2px_rgb(0_0_0/0.1)]",
  "dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
  "hover:bg-muted/60 dark:hover:bg-accent/80",
  "active:translate-y-px active:shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_0_1px_rgb(0_0_0/0.08)] dark:active:shadow-[0_0_0_1px_rgb(255_255_255/0.06),0_0_1px_rgb(0_0_0/0.6)]",
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  "data-disabled:cursor-not-allowed data-disabled:translate-y-0 data-disabled:bg-transparent data-disabled:text-muted-foreground/50 data-disabled:shadow-none dark:data-disabled:bg-transparent dark:data-disabled:shadow-none",
  "[&_svg]:size-3.5 [&_svg]:shrink-0",
)

function StepIcon({ plus }: { plus?: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3.5 8h9" />
      {plus && <path d="M8 3.5v9" />}
    </svg>
  )
}

function NumberInputDecrement({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NumberInputDecrementPrimitive>) {
  return (
    <NumberInputDecrementPrimitive className={cn(stepKey, className)} {...props}>
      {children ?? <StepIcon />}
    </NumberInputDecrementPrimitive>
  )
}

function NumberInputIncrement({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NumberInputIncrementPrimitive>) {
  return (
    <NumberInputIncrementPrimitive className={cn(stepKey, className)} {...props}>
      {children ?? <StepIcon plus />}
    </NumberInputIncrementPrimitive>
  )
}

/* Drag it sideways to change the value. Usually wraps the label. */
function NumberInputScrubArea({
  className,
  ...props
}: React.ComponentProps<typeof NumberInputScrubAreaPart>) {
  return (
    <NumberInputScrubAreaPart
      className={cn(
        "w-fit cursor-ew-resize select-none data-[orientation=vertical]:cursor-ns-resize",
        "data-disabled:cursor-not-allowed data-readonly:cursor-default",
        className,
      )}
      {...props}
    />
  )
}

/* Drawn while the pointer is locked during a drag; the part places it with a translation. */
function NumberInputScrubAreaCursor({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NumberInputScrubAreaCursorPart>) {
  return (
    <NumberInputScrubAreaCursorPart
      className={cn(
        "pointer-events-none -ms-2 -mt-2 size-4 text-foreground drop-shadow-[0_1px_1px_rgb(0_0_0/0.25)] [&_svg]:size-4",
        className,
      )}
      {...props}
    >
      {children ?? (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M2 8h12M4.5 5.5 2 8l2.5 2.5M11.5 5.5 14 8l-2.5 2.5" />
        </svg>
      )}
    </NumberInputScrubAreaCursorPart>
  )
}

export {
  NumberInput,
  NumberInputControl,
  NumberInputDecrement,
  NumberInputGroup,
  NumberInputIncrement,
  NumberInputScrubArea,
  NumberInputScrubAreaCursor,
  createNumberInputController,
}
