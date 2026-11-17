"use client"

export * from "@/components/primitives/input"

/* Theming (inherited; each default preserves the original light/dark appearance):
   --input-surface: Field surface (default: --background)
   --input-ink: Input text (default: --foreground)
   --input-hint: Placeholder (default: --muted-foreground at 70%)
   --input-focus: Focus ring and hairline (default: --ring)
   --input-invalid: Invalid ring and hairline (default: --destructive)
   --input-radius: Field corners (default: 10px)
   --input-height: Field height (default: 2.25rem)
*/

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

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* The field look: a hairline and a small drop shadow. The hairline's colour is one
   variable, so hover, focus and invalid each change a single value. The focus ring is the
   outline; the primitive makes it close in on a spring. */
const fieldBox =
  "rounded-[var(--input-radius,10px)] bg-[var(--input-surface,var(--background))] text-[13px] " +
  "outline-0 outline-[color:var(--input-focus,var(--ring))] aria-invalid:outline-[color:var(--input-invalid,var(--destructive))] " +
  "[--field-line:rgb(0_0_0/0.09)] dark:[--field-line:rgb(255_255_255/0.1)] " +
  "shadow-[0_0_0_1px_var(--field-line),0_1px_2px_rgb(0_0_0/0.05)] dark:shadow-[0_0_0_1px_var(--field-line)] " +
  "hover:[--field-line:rgb(0_0_0/0.16)] dark:hover:[--field-line:rgb(255_255_255/0.18)]"

function Input({ speed, className, ...props }: React.ComponentProps<typeof InputPrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <InputPrimitive
        className={withClass(
          cn(
            fieldBox,
            "h-[var(--input-height,2.25rem)] w-full min-w-0 px-3 text-[color:var(--input-ink,var(--foreground))] placeholder:text-[color:var(--input-hint,color-mix(in_oklab,var(--muted-foreground)_70%,transparent))]",
            "focus-visible:outline-[3px] focus-visible:outline-[color:color-mix(in_oklab,var(--input-focus,var(--ring))_30%,transparent)] focus-visible:[--field-line:var(--input-focus,var(--ring))] dark:focus-visible:[--field-line:var(--input-focus,var(--ring))]",
            "aria-invalid:focus-visible:outline-[color:color-mix(in_oklab,var(--input-invalid,var(--destructive))_30%,transparent)] aria-invalid:[--field-line:var(--input-invalid,var(--destructive))] dark:aria-invalid:[--field-line:var(--input-invalid,var(--destructive))]",
            "data-readonly:bg-muted/50",
            "data-disabled:cursor-not-allowed data-disabled:bg-muted data-disabled:text-muted-foreground data-disabled:[--field-line:rgb(0_0_0/0.06)] dark:data-disabled:[--field-line:rgb(255_255_255/0.06)]",
          ),
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
      className={withClass(
        cn(
          fieldBox,
          "flex h-[var(--input-height,2.25rem)] w-full min-w-0 cursor-text items-center gap-2 px-3 text-muted-foreground select-none",
          "[&_svg]:size-4 [&_svg]:shrink-0",
          "has-[input:focus-visible]:outline-[3px] has-[input:focus-visible]:outline-[color:color-mix(in_oklab,var(--input-focus,var(--ring))_30%,transparent)] has-[input:focus-visible]:[--field-line:var(--input-focus,var(--ring))] dark:has-[input:focus-visible]:[--field-line:var(--input-focus,var(--ring))]",
          "has-aria-invalid:outline-[color:var(--input-invalid,var(--destructive))] has-aria-invalid:has-[input:focus-visible]:outline-[color:color-mix(in_oklab,var(--input-invalid,var(--destructive))_30%,transparent)] has-aria-invalid:[--field-line:var(--input-invalid,var(--destructive))] dark:has-aria-invalid:[--field-line:var(--input-invalid,var(--destructive))]",
          "data-readonly:bg-muted/50",
          "data-disabled:cursor-not-allowed data-disabled:bg-muted data-disabled:[--field-line:rgb(0_0_0/0.06)] dark:data-disabled:[--field-line:rgb(255_255_255/0.06)]",
          "*:data-[slot=input]:h-full! *:data-[slot=input]:flex-1 *:data-[slot=input]:rounded-none! *:data-[slot=input]:bg-transparent! *:data-[slot=input]:px-0! *:data-[slot=input]:[box-shadow:none]! *:data-[slot=input]:outline-0! *:data-[slot=input]:select-text",
        ),
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
      className={withClass(
        cn(
          "-mr-1.5 grid size-6 shrink-0 cursor-pointer place-items-center rounded-[7px] text-muted-foreground outline-none",
          "hover:bg-foreground/[0.06] hover:text-foreground",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "[&_svg]:size-3.5",
        ),
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
