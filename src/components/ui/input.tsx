"use client"

/* Styled input: the animated primitive plus the Keyframery look. */

import * as React from "react"

import {
  Input as InputPrimitive,
  InputClear as InputClearPrimitive,
  InputGroup as InputGroupPrimitive,
  createInputController,
} from "@/components/primitives/input"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* The field look: a hairline and a small drop shadow. The hairline's colour is one
   variable, so hover, focus and invalid each change a single value. The focus ring is the
   outline; the primitive makes it close in on a spring. */
const fieldBox =
  "rounded-[10px] bg-background text-[13px] " +
  "outline-0 outline-ring aria-invalid:outline-destructive " +
  "[--field-line:rgb(0_0_0/0.09)] dark:[--field-line:rgb(255_255_255/0.1)] " +
  "shadow-[0_0_0_1px_var(--field-line),0_1px_2px_rgb(0_0_0/0.05)] dark:shadow-[0_0_0_1px_var(--field-line)] " +
  "hover:[--field-line:rgb(0_0_0/0.16)] dark:hover:[--field-line:rgb(255_255_255/0.18)]"

function Input({ speed, className, ...props }: React.ComponentProps<typeof InputPrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <InputPrimitive
        className={cn(
          fieldBox,
          "h-9 w-full min-w-0 px-3 text-foreground placeholder:text-muted-foreground/70",
          "focus-visible:outline-[3px] focus-visible:outline-ring/30 focus-visible:[--field-line:var(--ring)] dark:focus-visible:[--field-line:var(--ring)]",
          "aria-invalid:focus-visible:outline-destructive/30 aria-invalid:[--field-line:var(--destructive)] dark:aria-invalid:[--field-line:var(--destructive)]",
          "data-readonly:bg-muted/50",
          "data-disabled:cursor-not-allowed data-disabled:bg-muted data-disabled:text-muted-foreground data-disabled:[--field-line:rgb(0_0_0/0.06)] dark:data-disabled:[--field-line:rgb(255_255_255/0.06)]",
          className,
        )}
        {...props}
      />
    </Speed>
  )
}

/* The group is the field: text, icons and buttons sit around the input inside one box,
   and the input gives up its own. The ring follows the input's focus, not a button's. */
function InputGroup({ className, ...props }: React.ComponentProps<typeof InputGroupPrimitive>) {
  return (
    <InputGroupPrimitive
      className={cn(
        fieldBox,
        "flex h-9 w-full min-w-0 cursor-text items-center gap-2 px-3 text-muted-foreground select-none",
        "[&_svg]:size-4 [&_svg]:shrink-0",
        "has-[input:focus-visible]:outline-[3px] has-[input:focus-visible]:outline-ring/30 has-[input:focus-visible]:[--field-line:var(--ring)] dark:has-[input:focus-visible]:[--field-line:var(--ring)]",
        "has-aria-invalid:outline-destructive has-aria-invalid:has-[input:focus-visible]:outline-destructive/30 has-aria-invalid:[--field-line:var(--destructive)] dark:has-aria-invalid:[--field-line:var(--destructive)]",
        "data-readonly:bg-muted/50",
        "data-disabled:cursor-not-allowed data-disabled:bg-muted data-disabled:[--field-line:rgb(0_0_0/0.06)] dark:data-disabled:[--field-line:rgb(255_255_255/0.06)]",
        "*:data-[slot=input]:h-full! *:data-[slot=input]:flex-1 *:data-[slot=input]:rounded-none! *:data-[slot=input]:bg-transparent! *:data-[slot=input]:px-0! *:data-[slot=input]:[box-shadow:none]! *:data-[slot=input]:outline-0! *:data-[slot=input]:select-text",
        className,
      )}
      {...props}
    />
  )
}

function InputClear({
  className,
  children,
  ...props
}: React.ComponentProps<typeof InputClearPrimitive>) {
  return (
    <InputClearPrimitive
      className={cn(
        "-mr-1.5 grid size-6 shrink-0 cursor-pointer place-items-center rounded-[7px] text-muted-foreground outline-none",
        "hover:bg-foreground/[0.06] hover:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "[&_svg]:size-3.5",
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
          <path d="m4.5 4.5 7 7m0-7-7 7" />
        </svg>
      )}
    </InputClearPrimitive>
  )
}

export { Input, InputClear, InputGroup, createInputController }
