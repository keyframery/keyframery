"use client"

export * from "@/components/primitives/sparkline"

/* Styled sparkline: the animated primitive plus the Keyframery look. A 1.75px line over a faint
   wash, the last point ringed in the surface colour, bars that go quiet except the last one, a
   dashed reference line, and the tooltip's dark pill for the readout.

   It draws in the first chart colour. With `trendColor` it draws in the colour of its news instead:
   green when the trend is good, the destructive colour when it is bad, muted when flat (a fall is
   good news with `downIsGood`).

   Theming: set these CSS variables on the sparkline or anything around it. Each falls back to the
   theme's own token, so it looks the same until you set one.
     --sparkline-color       the marks, without trendColor      (default: --chart-1)
     --sparkline-positive    good news, with trendColor         (default: green oklch(0.62 0.16 150))
     --sparkline-negative    bad news, with trendColor          (default: --destructive)
     --sparkline-height      the height                         (default: 2.5rem)
     --sparkline-stroke      the line's width                   (default: 1.75px)
     --sparkline-dot         the dots' size                     (default: 6px)
     --sparkline-surface     the ring round the dots: the surface it sits on (default: --background, --card in dark)
     --sparkline-reference   the dashed reference line          (default: --muted-foreground) */

import * as React from "react"

import { Sparkline as SparklinePrimitive, SparklinePlot as SparklinePlotPrimitive } from "@/components/primitives/sparkline"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK parts take a class name or a function of the part's state. Keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

const look = cn(
  "h-[var(--sparkline-height,2.5rem)] w-full text-[12px]",
  "[--sparkline-tone:var(--sparkline-color,var(--chart-1))]",
  "data-trend-color:data-[tone=positive]:[--sparkline-tone:var(--sparkline-positive,oklch(0.62_0.16_150))] dark:data-trend-color:data-[tone=positive]:[--sparkline-tone:var(--sparkline-positive,oklch(0.72_0.16_150))]",
  "data-trend-color:data-[tone=negative]:[--sparkline-tone:var(--sparkline-negative,var(--destructive))]",
  "data-trend-color:data-[tone=neutral]:[--sparkline-tone:var(--sparkline-color,var(--muted-foreground))]",
  "[--sparkline-ring:var(--sparkline-surface,var(--background))] dark:[--sparkline-ring:var(--sparkline-surface,var(--card))]",
)

const plot = cn(
  /* Line and area. */
  "[&_[data-slot=sparkline-line]]:[stroke:var(--sparkline-tone)] [&_[data-slot=sparkline-line]]:[stroke-width:var(--sparkline-stroke,1.75px)] [&_[data-slot=sparkline-line]]:[stroke-linecap:round] [&_[data-slot=sparkline-line]]:[stroke-linejoin:round]",
  /* Bars: quiet, the last one and the one being read in full. */
  "[&_[data-slot=sparkline-bar]]:rounded-t-[2px] [&_[data-slot=sparkline-bar][data-negative]]:rounded-t-none [&_[data-slot=sparkline-bar][data-negative]]:rounded-b-[2px]",
  "[&_[data-slot=sparkline-bar]]:bg-[color-mix(in_oklch,var(--sparkline-tone)_42%,transparent)] [&_[data-slot=sparkline-bar]:is([data-last],[data-active])]:bg-[var(--sparkline-tone)]",
  /* The last point: solid, ringed in the surface colour so it sits cleanly on the line. */
  "[&>[data-slot=sparkline-end]]:rounded-full [&>[data-slot=sparkline-end]]:bg-[var(--sparkline-tone)] [&>[data-slot=sparkline-end]]:shadow-[0_0_0_2px_var(--sparkline-ring)]",
  /* Highest and lowest: hollow. */
  "[&>[data-slot=sparkline-extreme]]:rounded-full [&>[data-slot=sparkline-extreme]]:bg-[var(--sparkline-ring)] [&>[data-slot=sparkline-extreme]]:shadow-[inset_0_0_0_1.5px_var(--sparkline-tone)]",
  "[&>[data-slot=sparkline-reference]]:border-t [&>[data-slot=sparkline-reference]]:border-dashed [&>[data-slot=sparkline-reference]]:border-[color:color-mix(in_oklch,var(--sparkline-reference,var(--muted-foreground))_60%,transparent)]",
  "[&>[data-slot=sparkline-cursor]]:bg-[color-mix(in_oklch,var(--foreground)_22%,transparent)]",
  "[&>[data-slot=sparkline-marker]]:rounded-full [&>[data-slot=sparkline-marker]]:bg-[var(--sparkline-tone)] [&>[data-slot=sparkline-marker]]:shadow-[0_0_0_2px_var(--sparkline-ring),0_1px_3px_rgb(0_0_0/0.25)] dark:[&>[data-slot=sparkline-marker]]:shadow-[0_0_0_2px_var(--sparkline-ring),0_1px_3px_rgb(0_0_0/0.6)]",
  /* The readout: the tooltip's dark pill. */
  "[&>[data-slot=sparkline-readout]]:flex [&>[data-slot=sparkline-readout]]:items-center [&>[data-slot=sparkline-readout]]:gap-1.5 [&>[data-slot=sparkline-readout]]:rounded-[8px] [&>[data-slot=sparkline-readout]]:bg-foreground [&>[data-slot=sparkline-readout]]:px-2 [&>[data-slot=sparkline-readout]]:py-1 [&>[data-slot=sparkline-readout]]:text-[12px] [&>[data-slot=sparkline-readout]]:leading-[1.3] [&>[data-slot=sparkline-readout]]:font-medium [&>[data-slot=sparkline-readout]]:text-background",
  "[&>[data-slot=sparkline-readout]>[data-readout-label]]:font-normal [&>[data-slot=sparkline-readout]>[data-readout-label]]:opacity-65",
  /* The keyboard's point: a soft band. */
  "[&_[data-slot=sparkline-point]]:rounded-[3px] [&_[data-slot=sparkline-point]]:focus-visible:bg-[color-mix(in_oklch,var(--ring)_14%,transparent)]",
)

type SparklineProps = React.ComponentProps<typeof SparklinePrimitive> &
  SpeedProps & {
    /** Draws in the colour of its news: green when good, red when bad, muted when flat. */
    trendColor?: boolean
  }

function Sparkline({ speed, trendColor = false, className, children, ...props }: SparklineProps) {
  return (
    <Speed speed={speed}>
      <SparklinePrimitive
        {...(trendColor ? { "data-trend-color": "" } : null)}
        className={withClass(look, className)}
        {...props}
      >
        {children ?? <SparklinePlot />}
      </SparklinePrimitive>
    </Speed>
  )
}

function SparklinePlot({ className, ...props }: React.ComponentProps<typeof SparklinePlotPrimitive>) {
  return <SparklinePlotPrimitive className={withClass(plot, className)} {...props} />
}

export { Sparkline, SparklinePlot }
