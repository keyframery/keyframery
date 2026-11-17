"use client"

export * from "@/components/primitives/trace"

/* Theming variables (set on a part or ancestor; absent values preserve the theme):
   --trace-ink: Step text; default: text-muted-foreground.
   --trace-error: Failed step; default: text-destructive.
   --trace-font: Step size; default: text-[13px].
   --trace-detail-font: Detail size; default: text-[12.5px].
   --trace-gap: Step spacing; default: gap-2.5.
   --trace-icon-size: Status icon size; default: size-4.
   --trace-indent: Detail indent; default: ps-4.
*/

/* Styled trace: the animated primitive plus the Keyframery look. Quiet muted lines that wake on
   hover; a running title shimmers, a failed one turns destructive, a pending one waits at half ink.
   Rows that expand are Keyframery's collapsible: their detail hangs off a hairline under the icon. */

import * as React from "react"

import {
  Trace as TraceRoot,
  TraceCollapsibleTrigger as TraceCollapsibleTriggerPrimitive,
  TraceDescription as TraceDescriptionPrimitive,
  TraceIcon as TraceIconPrimitive,
  TraceLine as TraceLinePrimitive,
  TraceTitle as TraceTitlePrimitive,
} from "@/components/primitives/trace"
import { Collapsible, CollapsiblePanel } from "@/components/ui/collapsible"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* Also styles any link or button that wraps a line directly, as the trigger is styled. */
function Trace({ speed, className, ...props }: React.ComponentProps<typeof TraceRoot> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <TraceRoot
        className={withClass(
          cn(
            "flex w-full min-w-0 flex-col gap-[var(--trace-gap,0.625rem)] text-[length:var(--trace-font,13px)]",
            "*:has-[>[data-slot=trace-line]]:w-fit *:has-[>[data-slot=trace-line]]:max-w-full *:has-[>[data-slot=trace-line]]:rounded-[6px] *:has-[>[data-slot=trace-line]]:outline-none",
            "*:has-[>[data-slot=trace-line]]:focus-visible:ring-2 *:has-[>[data-slot=trace-line]]:focus-visible:ring-ring *:has-[>[data-slot=trace-line]]:focus-visible:ring-offset-2 *:has-[>[data-slot=trace-line]]:focus-visible:ring-offset-background",
          ),
          className,
        )}
        {...props}
      />
    </Speed>
  )
}

function TraceLine({ className, ...props }: React.ComponentProps<typeof TraceLinePrimitive>) {
  return (
    <TraceLinePrimitive
      className={withClass(
        cn(
          "flex w-fit max-w-full min-w-0 items-center gap-2 leading-[1.35] text-[color:var(--trace-ink,var(--muted-foreground))]",
          "transition-[color,opacity] duration-[calc(150ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none",
          "in-[a:hover,button:hover]:text-foreground in-[a,button]:cursor-pointer",
          "data-[status=running]:text-foreground",
          "data-[status=error]:text-[color:var(--trace-error,var(--destructive))] in-[a:hover,button:hover]:data-[status=error]:text-[color:var(--trace-error,var(--destructive))]",
          "data-[status=pending]:opacity-55",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* 16px. Before the title it names the action; with no children it shows the line's status. Done
   steps take the payoff green. */
function TraceIcon({ className, ...props }: React.ComponentProps<typeof TraceIconPrimitive>) {
  return (
    <TraceIconPrimitive
      className={withClass(
        cn(
          "grid size-[var(--trace-icon-size,1rem)] shrink-0 place-items-center [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-[var(--trace-icon-size,1rem)]",
          "[&_[data-mark=done]]:text-[oklch(0.62_0.16_150)]",
        ),
        className,
      )}
      {...props}
    />
  )
}

function TraceTitle({ className, ...props }: React.ComponentProps<typeof TraceTitlePrimitive>) {
  return <TraceTitlePrimitive className={withClass("min-w-0 truncate", className)} {...props} />
}

/* A count or a duration after the title. It never truncates. */
function TraceDescription({ className, ...props }: React.ComponentProps<typeof TraceDescriptionPrimitive>) {
  return (
    <TraceDescriptionPrimitive
      className={withClass("shrink-0 text-[12px] text-muted-foreground/70 tabular-nums", className)}
      {...props}
    />
  )
}

/* A row that expands. It takes the props of Collapsible. */
function TraceCollapsible({ className, ...props }: React.ComponentProps<typeof Collapsible>) {
  return <Collapsible data-trace="" className={withClass("w-full min-w-0", className)} {...props} />
}

function TraceCollapsibleTrigger({ className, ...props }: React.ComponentProps<typeof TraceCollapsibleTriggerPrimitive>) {
  return (
    <TraceCollapsibleTriggerPrimitive
      className={withClass(
        cn(
          "flex w-fit max-w-full min-w-0 cursor-pointer items-center gap-1.5 rounded-[6px] text-start text-[color:var(--trace-ink,var(--muted-foreground))] outline-none",
          "hover:text-foreground data-open:text-foreground",
          "has-[[data-status=error]]:text-[color:var(--trace-error,var(--destructive))]",
          "*:data-[slot=trace-chevron]:text-muted-foreground/70 data-disabled:cursor-default data-disabled:*:data-[slot=trace-chevron]:opacity-0",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* The detail hangs off a hairline under the line's icon. Its children rise in one after another, so
   pass rows or blocks straight inside. */
function TraceCollapsibleContent({ className, ...props }: React.ComponentProps<typeof CollapsiblePanel>) {
  return (
    <CollapsiblePanel
      className={withClass(
        cn(
          "ms-[7.5px] min-w-0 border-s border-border ps-[var(--trace-indent,1rem)] text-[length:var(--trace-detail-font,12.5px)] leading-relaxed text-[color:var(--trace-ink,var(--muted-foreground))]",
          "flex flex-col gap-2 *:first:mt-2.5 *:last:mb-1",
        ),
        className,
      )}
      {...props}
    />
  )
}

export {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
}
export type { TraceStatus } from "@/components/primitives/trace"
