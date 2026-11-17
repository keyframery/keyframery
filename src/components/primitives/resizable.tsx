"use client"

/* Animated drop-in for `@ui-sdk/react/resizable`: same parts, same props. Swap the import and keep your code.
   This file adds motion only. Colours, radii, shadows and spacing stay yours.
   - Panels glide to a new size on a spring after a key step, a collapse or a change from the
     controller. A drag writes sizes on every frame, so nothing eases then.
   - The handle's `::after` is its active line: it grows out from the middle on hover and drag.
     Give it a colour and thickness with `after:` classes.
   - `ResizableGrip` is extra: a small key for the middle of the handle whose surface (its
     `::before`) stretches along the line while the handle is hovered, and further while dragged. */

import {
  ResizableHandle as ResizableHandlePart,
  ResizablePanel as ResizablePanelPart,
} from "@ui-sdk/react/resizable"
import * as React from "react"

import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export * from "@ui-sdk/react/resizable"

function ResizablePanel({ className, ...props }: React.ComponentProps<typeof ResizablePanelPart>) {
  return (
    <ResizablePanelPart
      className={withClass(
        cn(
          "transition-[flex-basis,flex-grow] duration-[calc(460ms*var(--kf-speed,1))] ease-spring",
          "in-data-dragging:transition-none motion-reduce:transition-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

function ResizableHandle({ className, ...props }: React.ComponentProps<typeof ResizableHandlePart>) {
  return (
    <ResizableHandlePart
      className={withClass(
        cn(
          "group/kf-handle",
          "after:pointer-events-none after:opacity-0 after:[scale:var(--kf-line-x,1)_var(--kf-line-y,1)]",
          "data-[orientation=horizontal]:[--kf-line-y:0] data-[orientation=vertical]:[--kf-line-x:0]",
          "data-hovering:after:opacity-100 data-dragging:after:opacity-100 focus-visible:after:opacity-100",
          "data-[orientation=horizontal]:data-hovering:[--kf-line-y:1] data-[orientation=horizontal]:data-dragging:[--kf-line-y:1] data-[orientation=horizontal]:focus-visible:[--kf-line-y:1]",
          "data-[orientation=vertical]:data-hovering:[--kf-line-x:1] data-[orientation=vertical]:data-dragging:[--kf-line-x:1] data-[orientation=vertical]:focus-visible:[--kf-line-x:1]",
          "after:[transition:scale_calc(520ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(160ms*var(--kf-speed,1))_var(--ease-house)]",
          "not-data-hovering:not-data-dragging:after:[transition:scale_calc(260ms*var(--kf-speed,1))_var(--ease-house),opacity_calc(260ms*var(--kf-speed,1))_var(--ease-house)]",
          "data-disabled:after:hidden motion-reduce:after:[transition:none]!",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* Put it inside a ResizableHandle. Its children (the dots) stay still; the surface behind them stretches. */
function ResizableGrip({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="resizable-grip"
      aria-hidden
      className={cn(
        "relative isolate before:absolute before:inset-0 before:-z-10",
        "before:[transition:top_calc(420ms*var(--kf-speed,1))_var(--ease-spring),bottom_calc(420ms*var(--kf-speed,1))_var(--ease-spring),left_calc(420ms*var(--kf-speed,1))_var(--ease-spring),right_calc(420ms*var(--kf-speed,1))_var(--ease-spring)]",
        "group-data-[orientation=horizontal]/kf-handle:group-data-hovering/kf-handle:group-not-data-dragging/kf-handle:before:-inset-y-1",
        "group-data-[orientation=horizontal]/kf-handle:group-data-dragging/kf-handle:before:-inset-y-3",
        "group-data-[orientation=vertical]/kf-handle:group-data-hovering/kf-handle:group-not-data-dragging/kf-handle:before:-inset-x-1",
        "group-data-[orientation=vertical]/kf-handle:group-data-dragging/kf-handle:before:-inset-x-3",
        "motion-reduce:before:[transition:none]!",
        className,
      )}
      {...props}
    />
  )
}

export { ResizableGrip, ResizableHandle, ResizablePanel }
