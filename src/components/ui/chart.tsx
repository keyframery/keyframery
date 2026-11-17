"use client"

export * from "@/components/primitives/chart"

/* Styled chart: the animated primitive plus the Keyframery look. Quiet hairline rules, small muted
   labels, bars with soft corners, 2px lines over a fading wash, a light sheet for the tooltip and
   a row of toggles for the legend.

   Series colours come from the theme's chart tokens, `--chart-1` … `--chart-5` (shadcn's names), in
   config order, unless the config gives a colour. Each series' colour is also set as
   `--color-<key>` on the chart, as shadcn does.

   Theming: set these CSS variables on the chart or anything around it. Each falls back to the
   theme's own token, so the chart looks the same until you set one.
     --chart-height     the chart's height, legend and axes included   (default: 16rem)
     --chart-grid       the grid rules                     (default: --border)
     --chart-axis       the axis labels                    (default: --muted-foreground)
     --chart-cursor     the band or hairline on the active point (default: --foreground, faint)
     --chart-tooltip    the tooltip's surface              (default: --popover)
     --chart-radius     the bars' corners                  (default: --radius less 6px)
     --chart-stroke     the lines' width                   (default: 2px)
     --chart-dot        the dots' size                     (default: 8px)
     --chart-bar-gap    the space between bars in a group  (default: 4px) */

import * as React from "react"

import {
  Chart as ChartPrimitive,
  ChartCenter as ChartCenterPrimitive,
  ChartCursor as ChartCursorPrimitive,
  ChartGrid as ChartGridPrimitive,
  ChartLegend as ChartLegendPrimitive,
  ChartMarks as ChartMarksPrimitive,
  ChartPlot as ChartPlotPrimitive,
  ChartTooltip as ChartTooltipPrimitive,
  ChartXAxis as ChartXAxisPrimitive,
  ChartYAxis as ChartYAxisPrimitive,
} from "@/components/primitives/chart"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK parts take a class name or a function of the part's state. Keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

function Chart({ speed, className, children, ...props }: React.ComponentProps<typeof ChartPrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <ChartPrimitive
        className={withClass("h-[var(--chart-height,16rem)] w-full text-[12px] text-foreground", className)}
        {...props}
      >
        {children ??
          ((state) => (
            <>
              {state.radial || state.series.length > 1 ? <ChartLegend /> : null}
              <ChartYAxis />
              <ChartPlot />
              <ChartXAxis />
            </>
          ))}
      </ChartPrimitive>
    </Speed>
  )
}

/* The points are the keyboard's targets: a ring shows on the one focused. */
function ChartPlot({ className, children, ...props }: React.ComponentProps<typeof ChartPlotPrimitive>) {
  return (
    <ChartPlotPrimitive
      className={withClass(
        cn(
          "[&_[data-slot=chart-point]]:rounded-[10px] [&_[data-slot=chart-point]]:focus-visible:shadow-[inset_0_0_0_2px_var(--ring)]",
          "group-data-[type=pie]/chart:[&_[data-slot=chart-point]]:rounded-full group-data-[type=donut]/chart:[&_[data-slot=chart-point]]:rounded-full",
          "group-data-[type=pie]/chart:[&_[data-slot=chart-point]]:focus-visible:shadow-[0_0_0_2px_var(--ring),0_0_0_4px_var(--background)]",
          "group-data-[type=donut]/chart:[&_[data-slot=chart-point]]:focus-visible:shadow-[0_0_0_2px_var(--ring),0_0_0_4px_var(--background)]",
        ),
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          <ChartGrid />
          <ChartCursor />
          <ChartMarks />
          <ChartCenter />
          <ChartTooltip />
        </>
      )}
    </ChartPlotPrimitive>
  )
}

/* Hairline rules; the zero line a step stronger. */
function ChartGrid({ className, ...props }: React.ComponentProps<typeof ChartGridPrimitive>) {
  return (
    <ChartGridPrimitive
      className={withClass(
        cn(
          "[&>[data-slot=chart-grid-line]]:border-t [&>[data-slot=chart-grid-line]]:border-[color:color-mix(in_oklch,var(--chart-grid,var(--border))_75%,transparent)]",
          "[&>[data-slot=chart-grid-line][data-zero]]:border-[color:var(--chart-grid,var(--border))]",
          "group-data-[orientation=horizontal]/chart:group-data-[type=bar]/chart:[&>[data-slot=chart-grid-line]]:border-t-0 group-data-[orientation=horizontal]/chart:group-data-[type=bar]/chart:[&>[data-slot=chart-grid-line]]:border-l",
        ),
        className,
      )}
      {...props}
    />
  )
}

function ChartXAxis({ className, ...props }: React.ComponentProps<typeof ChartXAxisPrimitive>) {
  return <ChartXAxisPrimitive className={withClass(cn("pt-2.5", "[&>[data-slot=chart-tick]]:text-[11px] [&>[data-slot=chart-tick]]:leading-[1.3] [&>[data-slot=chart-tick]]:text-[color:var(--chart-axis,var(--muted-foreground))] [&>[data-slot=chart-tick]]:tabular-nums"), className)} {...props} />
}

function ChartYAxis({ className, ...props }: React.ComponentProps<typeof ChartYAxisPrimitive>) {
  return <ChartYAxisPrimitive className={withClass(cn("pr-3 text-right", "[&>[data-slot=chart-tick]]:text-[11px] [&>[data-slot=chart-tick]]:leading-[1.3] [&>[data-slot=chart-tick]]:text-[color:var(--chart-axis,var(--muted-foreground))] [&>[data-slot=chart-tick]]:tabular-nums [&>[data-slot=chart-tick]]:justify-self-end"), className)} {...props} />
}

/* A faint band behind a bar group; a hairline on a line. */
function ChartCursor({ className, ...props }: React.ComponentProps<typeof ChartCursorPrimitive>) {
  return (
    <ChartCursorPrimitive
      className={withClass(
        cn(
          "rounded-[calc(var(--chart-radius,max(0px,calc(var(--radius,0.625rem)-6px)))+3px)] bg-[color-mix(in_oklch,var(--chart-cursor,var(--foreground))_5%,transparent)]",
          "group-data-[type=line]/chart:rounded-none group-data-[type=line]/chart:bg-[color-mix(in_oklch,var(--chart-cursor,var(--foreground))_22%,transparent)]",
          "group-data-[type=area]/chart:rounded-none group-data-[type=area]/chart:bg-[color-mix(in_oklch,var(--chart-cursor,var(--foreground))_22%,transparent)]",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* Bars in the series colour: rounded at their open ends (both ends when they stand alone).
   Lines 2px with round joins; dots ringed in the card colour (charts sit on cards) so they sit on
   the line cleanly. */
function ChartMarks({ className, ...props }: React.ComponentProps<typeof ChartMarksPrimitive>) {
  return (
    <ChartMarksPrimitive
      className={withClass(
        cn(
          "[&>[data-slot=chart-bar]]:bg-[var(--chart-color)]",
          `[&>[data-slot=chart-bar][data-end]]:rounded-t-[var(--chart-radius,max(0px,calc(var(--radius,0.625rem)-6px)))] [&>[data-slot=chart-bar][data-start]]:rounded-b-[var(--chart-radius,max(0px,calc(var(--radius,0.625rem)-6px)))]`,
          `group-data-[orientation=horizontal]/chart:[&>[data-slot=chart-bar]]:rounded-none group-data-[orientation=horizontal]/chart:[&>[data-slot=chart-bar][data-end]]:rounded-r-[var(--chart-radius,max(0px,calc(var(--radius,0.625rem)-6px)))] group-data-[orientation=horizontal]/chart:[&>[data-slot=chart-bar][data-start]]:rounded-l-[var(--chart-radius,max(0px,calc(var(--radius,0.625rem)-6px)))]`,
          "[&_[data-slot=chart-line]]:[stroke:var(--chart-color)] [&_[data-slot=chart-line]]:[stroke-width:var(--chart-stroke,2px)] [&_[data-slot=chart-line]]:[stroke-linecap:round] [&_[data-slot=chart-line]]:[stroke-linejoin:round]",
          "[&>[data-slot=chart-dot]]:rounded-full [&>[data-slot=chart-dot]]:bg-[var(--chart-color)] [&>[data-slot=chart-dot]]:shadow-[0_0_0_2px_var(--card)]",
          "[&>[data-slot=chart-marker]]:rounded-full [&>[data-slot=chart-marker]]:bg-[var(--chart-color)] [&>[data-slot=chart-marker]]:shadow-[0_0_0_2.5px_var(--card),0_1px_4px_rgb(0_0_0/0.22)] dark:[&>[data-slot=chart-marker]]:shadow-[0_0_0_2.5px_var(--card),0_1px_4px_rgb(0_0_0/0.6)]",
          "[&_[data-slot=chart-slice]]:[stroke:var(--chart-color)]",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* The donut's hole: one big number over a small label. */
function ChartCenter({ className, ...props }: React.ComponentProps<typeof ChartCenterPrimitive>) {
  return (
    <ChartCenterPrimitive
      className={withClass(
        "gap-0.5 [&>[data-roll]]:text-[clamp(16px,9cqmin,26px)] [&>[data-roll]]:font-semibold [&>[data-roll]]:tracking-tight [&>span:last-child]:text-[11px] [&>span:last-child]:text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}

/* A light sheet: the category, then a row per series with its swatch, name and value. */
function ChartTooltip({ className, ...props }: React.ComponentProps<typeof ChartTooltipPrimitive>) {
  return (
    <ChartTooltipPrimitive
      className={withClass(
        cn(
          "min-w-[8.5rem] rounded-[10px] bg-[var(--chart-tooltip,var(--popover))] px-2.5 py-2 text-[12px] text-popover-foreground",
          "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_6px_-2px_rgb(0_0_0/0.08),0_12px_32px_-8px_rgb(0_0_0/0.18)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_12px_32px_-8px_rgb(0_0_0/0.7)]",
          "[&>[data-slot=chart-tooltip-label]]:mb-1.5 [&>[data-slot=chart-tooltip-label]]:font-medium [&>[data-slot=chart-tooltip-label]]:leading-none",
          "[&>[data-slot=chart-tooltip-item]]:grid [&>[data-slot=chart-tooltip-item]]:grid-cols-[auto_1fr_auto] [&>[data-slot=chart-tooltip-item]]:items-center [&>[data-slot=chart-tooltip-item]]:gap-x-2 [&>[data-slot=chart-tooltip-item]]:py-[3px] [&>[data-slot=chart-tooltip-item]]:leading-[1.3]",
          "[&>[data-slot=chart-tooltip-item]>span:nth-child(2)]:text-muted-foreground [&>[data-slot=chart-tooltip-item]>[data-roll]]:pl-3 [&>[data-slot=chart-tooltip-item]>[data-roll]]:font-medium",
          "[&_[data-indicator]]:size-2 [&_[data-indicator]]:rounded-[2.5px] [&_[data-indicator]]:bg-[var(--chart-color)]",
          "data-[indicator=line]:[&_[data-indicator]]:h-3 data-[indicator=line]:[&_[data-indicator]]:w-1 data-[indicator=line]:[&_[data-indicator]]:rounded-full",
          "data-[indicator=dashed]:[&_[data-indicator]]:h-3 data-[indicator=dashed]:[&_[data-indicator]]:w-0 data-[indicator=dashed]:[&_[data-indicator]]:rounded-none data-[indicator=dashed]:[&_[data-indicator]]:border-l-[1.5px] data-[indicator=dashed]:[&_[data-indicator]]:border-dashed data-[indicator=dashed]:[&_[data-indicator]]:border-[color:var(--chart-color)] data-[indicator=dashed]:[&_[data-indicator]]:bg-transparent",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* Toggles in a row: a swatch and a label. A hidden series keeps an outline of its swatch. */
function ChartLegend({ className, ...props }: React.ComponentProps<typeof ChartLegendPrimitive>) {
  return (
    <ChartLegendPrimitive
      className={withClass(
        cn(
          "justify-center gap-x-1 gap-y-1 pt-3 data-[side=top]:pt-0 data-[side=top]:pb-3",
          "[&>[data-slot=chart-legend-item]]:h-7 [&>[data-slot=chart-legend-item]]:cursor-pointer [&>[data-slot=chart-legend-item]]:gap-2 [&>[data-slot=chart-legend-item]]:rounded-[8px] [&>[data-slot=chart-legend-item]]:px-2 [&>[data-slot=chart-legend-item]]:text-[12px] [&>[data-slot=chart-legend-item]]:font-medium [&>[data-slot=chart-legend-item]]:leading-none [&>[data-slot=chart-legend-item]]:text-foreground [&>[data-slot=chart-legend-item]]:outline-none",
          "[&>[data-slot=chart-legend-item]]:hover:bg-foreground/[0.04] [&>[data-slot=chart-legend-item]]:focus-visible:ring-2 [&>[data-slot=chart-legend-item]]:focus-visible:ring-ring",
          "[&>[data-slot=chart-legend-item][data-hidden]]:text-muted-foreground",
          "[&_[data-indicator]]:size-2.5 [&_[data-indicator]]:rounded-[3px] [&_[data-indicator]]:bg-[var(--chart-color)]",
          "[&>[data-hidden]>[data-indicator]]:bg-transparent [&>[data-hidden]>[data-indicator]]:shadow-[inset_0_0_0_1.5px_var(--chart-color)]",
        ),
        className,
      )}
      {...props}
    />
  )
}

export { Chart, ChartCenter, ChartCursor, ChartGrid, ChartLegend, ChartMarks, ChartPlot, ChartTooltip, ChartXAxis, ChartYAxis, Chart as ChartContainer }
