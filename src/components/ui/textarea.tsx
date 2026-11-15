"use client"

/* Styled textarea: the animated primitive plus the Keyframery look. */

import * as React from "react"

import { Textarea as TextareaPrimitive, createInputController } from "@/components/primitives/textarea"
import { cn } from "@/lib/utils"

/* The field look, with room for a few lines. It grows with its text between
   min-height and max-height, then scrolls. Pass autoResize={false} for a fixed box. */
function Textarea({
  className,
  autoResize = true,
  ...props
}: React.ComponentProps<typeof TextareaPrimitive>) {
  return (
    <TextareaPrimitive
      autoResize={autoResize}
      className={cn(
        "block max-h-[220px] min-h-[76px] w-full min-w-0 resize-none rounded-[10px] bg-background px-3 py-2 text-[13px] leading-5 text-foreground placeholder:text-muted-foreground/70",
        "outline-0 outline-ring aria-invalid:outline-destructive focus-visible:outline-[3px] focus-visible:outline-ring/30 aria-invalid:focus-visible:outline-destructive/30",
        "[--field-line:rgb(0_0_0/0.09)] dark:[--field-line:rgb(255_255_255/0.1)]",
        "shadow-[0_0_0_1px_var(--field-line),0_1px_2px_rgb(0_0_0/0.05)] dark:shadow-[0_0_0_1px_var(--field-line)]",
        "hover:[--field-line:rgb(0_0_0/0.16)] dark:hover:[--field-line:rgb(255_255_255/0.18)]",
        "focus-visible:[--field-line:var(--ring)] dark:focus-visible:[--field-line:var(--ring)]",
        "aria-invalid:[--field-line:var(--destructive)] dark:aria-invalid:[--field-line:var(--destructive)]",
        "data-readonly:bg-muted/50",
        "data-disabled:cursor-not-allowed data-disabled:bg-muted data-disabled:text-muted-foreground data-disabled:[--field-line:rgb(0_0_0/0.06)] dark:data-disabled:[--field-line:rgb(255_255_255/0.06)]",
        className,
      )}
      {...props}
    />
  )
}

export { Textarea, createInputController }
