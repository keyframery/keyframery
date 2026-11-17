"use client"

export * from "@/components/primitives/resizable"

/* Theming (inherited; each default preserves the original light/dark appearance):
   --resizable-line: Resting divider (default: --border)
   --resizable-active: Hovered, focused or dragged divider (default: --ring)
   --resizable-key: Grip surface (default: --background, --accent in dark)
   --resizable-ink: Grip dots (default: --muted-foreground; --foreground while active)
   --resizable-radius: Grip corners (default: 5px)
   --resizable-grip-width: Grip short axis (default: 0.75rem)
   --resizable-grip-length: Grip long axis (default: 1.5rem)
   --resizable-thickness: Divider thickness (default: 1px)
*/

/* Styled resizable: the animated primitive plus the Keyframery look. */

import * as React from "react"

import {
  Resizable as ResizableRoot,
  ResizableGrip,
  ResizableHandle as ResizableHandlePart,
  ResizablePanel as ResizablePanelPart,
} from "@/components/primitives/resizable"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

function Resizable({
  speed,
  className,
  ...props
}: React.ComponentProps<typeof ResizableRoot> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <ResizableRoot className={withClass("size-full", className)} {...props} />
    </Speed>
  )
}

function ResizablePanel({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePanelPart>) {
  return (
    <ResizablePanelPart
      className={withClass("overflow-hidden", className)}
      {...props}
    />
  )
}

/* A hairline between two panels. Under the pointer, while dragged or focused a line in the
   ring colour grows out of its middle. The grip is a small key that stretches along the line
   while you drag; pass `children` to replace it, or `null` to leave the line bare. */
function ResizableHandle({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ResizableHandlePart>) {
  return (
    <ResizableHandlePart
      className={withClass(
        cn(
          "group/handle relative z-10 flex items-center justify-center bg-[var(--resizable-line,var(--border))] outline-none",
          "data-[orientation=horizontal]:w-[var(--resizable-thickness,1px)] data-[orientation=vertical]:h-[var(--resizable-thickness,1px)]",
          /* The active line, in the ring colour. The primitive grows it from the middle. */
          "after:absolute after:rounded-full after:bg-[var(--resizable-active,var(--ring))]",
          "data-[orientation=horizontal]:after:inset-y-0 data-[orientation=horizontal]:after:left-1/2 data-[orientation=horizontal]:after:w-[3px] data-[orientation=horizontal]:after:-translate-x-1/2",
          "data-[orientation=vertical]:after:inset-x-0 data-[orientation=vertical]:after:top-1/2 data-[orientation=vertical]:after:h-[3px] data-[orientation=vertical]:after:-translate-y-1/2",
        ),
        className,
      )}
      {...props}
    >
      {children === undefined ? (
        <ResizableGrip
          className={cn(
            "z-10 grid shrink-0 place-items-center text-[color:var(--resizable-ink,var(--muted-foreground))]",
            "group-data-[orientation=horizontal]/handle:h-[var(--resizable-grip-length,1.5rem)] group-data-[orientation=horizontal]/handle:w-[var(--resizable-grip-width,0.75rem)]",
            "group-data-[orientation=vertical]/handle:h-[var(--resizable-grip-width,0.75rem)] group-data-[orientation=vertical]/handle:w-[var(--resizable-grip-length,1.5rem)]",
            "transition-[color] duration-[calc(150ms*var(--kf-speed,1))] motion-reduce:transition-none!",
            "group-data-dragging/handle:text-[color:var(--resizable-ink,var(--foreground))] group-data-hovering/handle:text-[color:var(--resizable-ink,var(--foreground))]",
            /* The key's surface: the primitive stretches it along the line. */
            "before:rounded-[var(--resizable-radius,5px)] before:bg-[var(--resizable-key,var(--background))]",
            "before:shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)]",
            "dark:before:bg-[var(--resizable-key,var(--accent))] dark:before:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
            "group-data-dragging/handle:before:shadow-[0_0_0_1px_var(--resizable-active,var(--ring)),0_1px_1px_rgb(0_0_0/0.04),0_2px_4px_-1px_rgb(0_0_0/0.1)]",
            "dark:group-data-dragging/handle:before:shadow-[0_0_0_1px_var(--resizable-active,var(--ring)),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
            "group-focus-visible/handle:ring-2 group-focus-visible/handle:ring-ring group-focus-visible/handle:ring-offset-2 group-focus-visible/handle:ring-offset-background",
            "group-data-disabled/handle:hidden",
          )}
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="size-3 group-data-[orientation=vertical]/handle:rotate-90"
          >
            <path d="M6 4h.01M6 8h.01M6 12h.01M10 4h.01M10 8h.01M10 12h.01" />
          </svg>
        </ResizableGrip>
      ) : (
        children
      )}
    </ResizableHandlePart>
  )
}

export { createResizableController } from "@/components/primitives/resizable"
export { Resizable, ResizableHandle, ResizablePanel }

/* UI SDK's helpers for this component, passed through. */
export { resizableStorageKey } from "@/components/primitives/resizable"
