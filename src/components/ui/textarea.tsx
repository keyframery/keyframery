"use client"

export * from "@/components/primitives/textarea"

/* Styled textarea: the animated primitive plus the Keyframery look. */

/* Theming: inherit these optional variables; unset values retain the original light/dark tokens.
   --textarea-face: Field surface (default: --background; --muted at 50% when read-only; --muted when disabled).
   --textarea-ink: Field text and placeholder (default: --foreground; --muted-foreground at 70% for placeholder).
   --textarea-ring: Focus ring and focused hairline (default: --ring).
   --textarea-radius: Field corners (default: 10px).
   --textarea-min-height: Minimum field height (default: 76px).
   --textarea-max-height: Maximum field height (default: 220px).
 */

import * as React from "react"

import { Textarea as TextareaPrimitive, createInputController } from "@/components/primitives/textarea"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* The field look, with room for a few lines. It grows with its text between
   min-height and max-height, then scrolls. Pass autoResize={false} for a fixed box. */
function Textarea({
  speed,
  className,
  autoResize = true,
  ...props
}: React.ComponentProps<typeof TextareaPrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <TextareaPrimitive
        autoResize={autoResize}
        className={withClass(
          cn(
            "block max-h-[var(--textarea-max-height,220px)] min-h-[var(--textarea-min-height,76px)] w-full min-w-0 resize-none rounded-[var(--textarea-radius,10px)] bg-[var(--textarea-face,var(--background))] px-3 py-2 text-[13px] leading-5 text-[color:var(--textarea-ink,var(--foreground))] placeholder:text-[color:var(--textarea-ink,color-mix(in_oklab,var(--muted-foreground)_70%,transparent))]",
            "outline-0 outline-[color:var(--textarea-ring,var(--ring))] aria-invalid:outline-destructive focus-visible:outline-[3px] focus-visible:outline-[color:color-mix(in_oklab,var(--textarea-ring,var(--ring))_30%,transparent)] aria-invalid:focus-visible:outline-destructive/30",
            "[--field-line:rgb(0_0_0/0.09)] dark:[--field-line:rgb(255_255_255/0.1)]",
            "shadow-[0_0_0_1px_var(--field-line),0_1px_2px_rgb(0_0_0/0.05)] dark:shadow-[0_0_0_1px_var(--field-line)]",
            "hover:[--field-line:rgb(0_0_0/0.16)] dark:hover:[--field-line:rgb(255_255_255/0.18)]",
            "focus-visible:[--field-line:var(--textarea-ring,var(--ring))] dark:focus-visible:[--field-line:var(--textarea-ring,var(--ring))]",
            "aria-invalid:[--field-line:var(--destructive)] dark:aria-invalid:[--field-line:var(--destructive)]",
            "data-readonly:bg-[var(--textarea-face,color-mix(in_oklab,var(--muted)_50%,transparent))]",
            "data-disabled:cursor-not-allowed data-disabled:bg-[var(--textarea-face,var(--muted))] data-disabled:text-[color:var(--textarea-ink,var(--muted-foreground))] data-disabled:[--field-line:rgb(0_0_0/0.06)] dark:data-disabled:[--field-line:rgb(255_255_255/0.06)]",
          ),
          className,
        )}
        {...props}
      />
    </Speed>
  )
}

export { Textarea, createInputController }
