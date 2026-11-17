"use client"

export * from "@/components/primitives/waterfall"

/* Styled waterfall: the animated primitive plus the Keyframery look. */

/* Theming: inherit these optional variables; unset values retain the original light/dark tokens.
   --waterfall-face: Grid sheet (default: --card).
   --waterfall-ink: Grid text (default: --card-foreground; --foreground for selected nested labels).
   --waterfall-bar: Top-level request bars (default: --primary at 75%).
   --waterfall-muted: Headers, nested labels and nested bars (default: --muted-foreground; 40% level-two bars, 30% level-three bars).
   --waterfall-marker-color: Marker and selected bar (default: --ring; marker background 12% and line 50%).
   --waterfall-radius: Grid corners (default: 14px).
   --waterfall-height: Request row height (default: 2rem).
   --waterfall-gap: Gap between grid columns (default: 0.75rem).
 */

import * as React from "react"

import {
  Waterfall as WaterfallRoot,
  WaterfallAxis as WaterfallAxisPrimitive,
  WaterfallBar as WaterfallBarPrimitive,
  WaterfallCell as WaterfallCellPrimitive,
  WaterfallColumnHeader as WaterfallColumnHeaderPrimitive,
  WaterfallHeaderRow as WaterfallHeaderRowPrimitive,
  WaterfallIndicator as WaterfallIndicatorPrimitive,
  WaterfallMark as WaterfallMarkPrimitive,
  WaterfallRow as WaterfallRowPrimitive,
  WaterfallRowHeader as WaterfallRowHeaderPrimitive,
  WaterfallTick as WaterfallTickPrimitive,
} from "@/components/primitives/waterfall"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export { createWaterfallController, visibleWaterfallRows, type WaterfallData } from "@/components/primitives/waterfall"

const focusRing = "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"

/* A sheet laid out as a grid; every row is a subgrid, so columns line up. Set the columns with
   a `grid-cols-[…]` class: the default is a name column and a timeline. */
function Waterfall({ speed, className, ...props }: React.ComponentProps<typeof WaterfallRoot> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <WaterfallRoot
        className={withClass(
          cn(
            "relative grid grid-cols-[minmax(8rem,auto)_minmax(0,1fr)] overflow-hidden rounded-[var(--waterfall-radius,14px)] bg-[var(--waterfall-face,var(--card))] py-1 text-[12.5px] text-[color:var(--waterfall-ink,var(--card-foreground))]",
            "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_6px_-2px_rgb(0_0_0/0.08),0_12px_32px_-8px_rgb(0_0_0/0.12)]",
            "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_12px_32px_-8px_rgb(0_0_0/0.7)]",
          ),
          className,
        )}
        {...props}
      />
    </Speed>
  )
}

const rowGrid = "col-span-full grid grid-cols-subgrid items-center gap-x-[var(--waterfall-gap,0.75rem)] px-3"

function WaterfallHeaderRow({ className, ...props }: React.ComponentProps<typeof WaterfallHeaderRowPrimitive>) {
  return (
    <WaterfallHeaderRowPrimitive
      className={withClass(
        cn(
          rowGrid, "mb-1 h-12 border-b border-border text-[11px] font-medium text-[color:var(--waterfall-muted,var(--muted-foreground))]",
        ),
        className,
      )}
      {...props}
    />
  )
}

function WaterfallColumnHeader({ className, ...props }: React.ComponentProps<typeof WaterfallColumnHeaderPrimitive>) {
  return <WaterfallColumnHeaderPrimitive className={withClass("relative flex h-full items-center", className)} {...props} />
}

/* Round times along the top of the timeline. */
function WaterfallAxis({ className, ...props }: React.ComponentProps<typeof WaterfallAxisPrimitive>) {
  return <WaterfallAxisPrimitive className={withClass("relative h-full flex-1", className)} {...props} />
}

function WaterfallTick({ className, ...props }: React.ComponentProps<typeof WaterfallTickPrimitive>) {
  return (
    <WaterfallTickPrimitive
      className={withClass("top-2 -translate-x-1/2 text-[10.5px] leading-none font-normal whitespace-nowrap tabular-nums first:translate-x-0 last:-translate-x-full", className)}
      {...props}
    />
  )
}

/* A moment across every row: a label in the header and a hairline running down the rows. */
function WaterfallMark({ className, ...props }: React.ComponentProps<typeof WaterfallMarkPrimitive>) {
  return (
    <WaterfallMarkPrimitive
      className={withClass(
        cn(
          "pointer-events-none bottom-1.5 z-10 -translate-x-1/2 rounded-full bg-[color-mix(in_oklab,var(--waterfall-marker-color,var(--ring))_12%,transparent)] px-1.5 py-[3px] text-[10.5px] leading-none font-medium whitespace-nowrap text-[color:var(--waterfall-marker-color,var(--ring))]",
          "after:absolute after:top-full after:left-1/2 after:h-[999px] after:w-px after:bg-[color-mix(in_oklab,var(--waterfall-marker-color,var(--ring))_50%,transparent)] after:content-['']",
        ),
        className,
      )}
      {...props}
    />
  )
}

function WaterfallRow({ className, ...props }: React.ComponentProps<typeof WaterfallRowPrimitive>) {
  return (
    <WaterfallRowPrimitive
      className={withClass(
        cn(
          rowGrid,
          "h-[var(--waterfall-height,2rem)] cursor-default",
          "hover:bg-foreground/[0.03] data-selected:bg-accent dark:data-selected:bg-accent/70",
          focusRing,
        ),
        className,
      )}
      {...props}
    />
  )
}

/* The span's name, indented by its depth. Leaves line up with the names of spans beside a chevron. */
function WaterfallRowHeader({ className, ...props }: React.ComponentProps<typeof WaterfallRowHeaderPrimitive>) {
  return (
    <WaterfallRowHeaderPrimitive
      className={withClass(
        cn(
          "flex h-full min-w-0 items-center gap-1 truncate font-medium",
          "ps-[calc((var(--waterfall-level)-1)*14px)] not-data-branch:ps-[calc((var(--waterfall-level)-1)*14px+20px)]",
          "data-[level=2]:font-normal data-[level=2]:text-[color:var(--waterfall-muted,var(--muted-foreground))] data-[level=2]:data-selected:text-[color:var(--waterfall-ink,var(--foreground))]",
          focusRing,
        ),
        className,
      )}
      {...props}
    />
  )
}

function WaterfallIndicator({ className, children, ...props }: React.ComponentProps<typeof WaterfallIndicatorPrimitive>) {
  return (
    <WaterfallIndicatorPrimitive
      className={withClass("grid size-4 shrink-0 cursor-pointer place-items-center rounded-[5px] text-[color:var(--waterfall-muted,var(--muted-foreground))] hover:bg-foreground/[0.06] hover:text-[color:var(--waterfall-ink,var(--foreground))]", className)}
      {...props}
    >
      {children ?? (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="size-3.5">
          <path d="m6 4 4 4-4 4" />
        </svg>
      )}
    </WaterfallIndicatorPrimitive>
  )
}

function WaterfallCell({ className, ...props }: React.ComponentProps<typeof WaterfallCellPrimitive>) {
  return (
    <WaterfallCellPrimitive
      className={withClass(
        cn(
          "flex h-full items-center whitespace-nowrap text-[color:var(--waterfall-muted,var(--muted-foreground))] tabular-nums", focusRing,
        ),
        className,
      )}
      {...props}
    />
  )
}

/* Top-level spans in the primary colour, nested ones quieter; the selected span takes the ring colour. */
function WaterfallBar({ className, ...props }: React.ComponentProps<typeof WaterfallBarPrimitive>) {
  return (
    <WaterfallBarPrimitive
      className={withClass(
        cn(
          "h-full",
          "before:inset-y-[10px] before:rounded-[3px] before:bg-[color-mix(in_oklab,var(--waterfall-bar,var(--primary))_75%,transparent)]",
          "data-[level=2]:before:bg-[color-mix(in_oklab,var(--waterfall-muted,var(--muted-foreground))_40%,transparent)] data-[level=3]:before:bg-[color-mix(in_oklab,var(--waterfall-muted,var(--muted-foreground))_30%,transparent)]",
          "data-selected:before:bg-[var(--waterfall-marker-color,var(--ring))]",
          focusRing,
        ),
        className,
      )}
      {...props}
    />
  )
}

export {
  Waterfall,
  WaterfallAxis,
  WaterfallBar,
  WaterfallCell,
  WaterfallColumnHeader,
  WaterfallHeaderRow,
  WaterfallIndicator,
  WaterfallMark,
  WaterfallRow,
  WaterfallRowHeader,
  WaterfallTick,
}
