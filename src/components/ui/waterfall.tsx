"use client"

/* Styled waterfall: the animated primitive plus the Keyframery look. */

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
import { cn } from "@/lib/utils"

export { createWaterfallController, visibleWaterfallRows, type WaterfallData } from "@/components/primitives/waterfall"

const focusRing = "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"

/* A sheet laid out as a grid; every row is a subgrid, so columns line up. Set the columns with
   a `grid-cols-[…]` class: the default is a name column and a timeline. */
function Waterfall({ className, ...props }: React.ComponentProps<typeof WaterfallRoot>) {
  return (
    <WaterfallRoot
      className={cn(
        "relative grid grid-cols-[minmax(8rem,auto)_minmax(0,1fr)] overflow-hidden rounded-[14px] bg-card py-1 text-[12.5px] text-card-foreground",
        "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_6px_-2px_rgb(0_0_0/0.08),0_12px_32px_-8px_rgb(0_0_0/0.12)]",
        "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_12px_32px_-8px_rgb(0_0_0/0.7)]",
        className as string,
      )}
      {...props}
    />
  )
}

const rowGrid = "col-span-full grid grid-cols-subgrid items-center gap-x-3 px-3"

function WaterfallHeaderRow({ className, ...props }: React.ComponentProps<typeof WaterfallHeaderRowPrimitive>) {
  return (
    <WaterfallHeaderRowPrimitive
      className={cn(rowGrid, "mb-1 h-12 border-b border-border text-[11px] font-medium text-muted-foreground", className as string)}
      {...props}
    />
  )
}

function WaterfallColumnHeader({ className, ...props }: React.ComponentProps<typeof WaterfallColumnHeaderPrimitive>) {
  return <WaterfallColumnHeaderPrimitive className={cn("relative flex h-full items-center", className as string)} {...props} />
}

/* Round times along the top of the timeline. */
function WaterfallAxis({ className, ...props }: React.ComponentProps<typeof WaterfallAxisPrimitive>) {
  return <WaterfallAxisPrimitive className={cn("relative h-full flex-1", className as string)} {...props} />
}

function WaterfallTick({ className, ...props }: React.ComponentProps<typeof WaterfallTickPrimitive>) {
  return (
    <WaterfallTickPrimitive
      className={cn(
        "top-2 -translate-x-1/2 text-[10.5px] leading-none font-normal whitespace-nowrap tabular-nums first:translate-x-0 last:-translate-x-full",
        className as string,
      )}
      {...props}
    />
  )
}

/* A moment across every row: a label in the header and a hairline running down the rows. */
function WaterfallMark({ className, ...props }: React.ComponentProps<typeof WaterfallMarkPrimitive>) {
  return (
    <WaterfallMarkPrimitive
      className={cn(
        "pointer-events-none bottom-1.5 z-10 -translate-x-1/2 rounded-full bg-ring/12 px-1.5 py-[3px] text-[10.5px] leading-none font-medium whitespace-nowrap text-ring",
        "after:absolute after:top-full after:left-1/2 after:h-[999px] after:w-px after:bg-ring/50 after:content-['']",
        className as string,
      )}
      {...props}
    />
  )
}

function WaterfallRow({ className, ...props }: React.ComponentProps<typeof WaterfallRowPrimitive>) {
  return (
    <WaterfallRowPrimitive
      className={cn(
        rowGrid,
        "h-8 cursor-default",
        "hover:bg-foreground/[0.03] data-selected:bg-accent dark:data-selected:bg-accent/70",
        focusRing,
        className as string,
      )}
      {...props}
    />
  )
}

/* The span's name, indented by its depth. Leaves line up with the names of spans beside a chevron. */
function WaterfallRowHeader({ className, ...props }: React.ComponentProps<typeof WaterfallRowHeaderPrimitive>) {
  return (
    <WaterfallRowHeaderPrimitive
      className={cn(
        "flex h-full min-w-0 items-center gap-1 truncate font-medium",
        "ps-[calc((var(--waterfall-level)-1)*14px)] not-data-branch:ps-[calc((var(--waterfall-level)-1)*14px+20px)]",
        "data-[level=2]:font-normal data-[level=2]:text-muted-foreground data-[level=2]:data-selected:text-foreground",
        focusRing,
        className as string,
      )}
      {...props}
    />
  )
}

function WaterfallIndicator({ className, children, ...props }: React.ComponentProps<typeof WaterfallIndicatorPrimitive>) {
  return (
    <WaterfallIndicatorPrimitive
      className={cn(
        "grid size-4 shrink-0 cursor-pointer place-items-center rounded-[5px] text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground",
        className as string,
      )}
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
      className={cn("flex h-full items-center whitespace-nowrap text-muted-foreground tabular-nums", focusRing, className as string)}
      {...props}
    />
  )
}

/* Top-level spans in the primary colour, nested ones quieter; the selected span takes the ring colour. */
function WaterfallBar({ className, ...props }: React.ComponentProps<typeof WaterfallBarPrimitive>) {
  return (
    <WaterfallBarPrimitive
      className={cn(
        "h-full",
        "before:inset-y-[10px] before:rounded-[3px] before:bg-primary/75",
        "data-[level=2]:before:bg-muted-foreground/40 data-[level=3]:before:bg-muted-foreground/30",
        "data-selected:before:bg-ring",
        focusRing,
        className as string,
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
