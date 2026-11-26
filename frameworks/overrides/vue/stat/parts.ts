/* UI SDK parts for stat, made once from the shared core definition (the same file React uses). */
import { createParts } from "@ui-sdk/vue/primitive"

import { statGroup } from "@/components/keyframery/core/stat-core"
import { cn } from "@/lib/utils"

const keyframes = "@keyframes kf-stat-part{from{opacity:0;translate:0 10px;filter:blur(5px)}}"
if (typeof document !== "undefined" && !document.getElementById("kf-stat")) {
  const s = document.createElement("style")
  s.id = "kf-stat"
  s.textContent = keyframes
  document.head.append(s)
}

export const { Root: StatGroupRoot, Grid: StatGroupGrid } = createParts(statGroup, { root: "div", grid: "div" })

/* Each part rises in after the one before it; while loading its ink is hidden (the styled part
   draws the placeholder), and when loading ends the ink comes back in the same order. The arrival
   and the stagger scale with --kf-flourish; the ink's fade back after loading is feedback. */
export const partMotion = cn(
  "animate-[kf-stat-part_calc(560ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_backwards] motion-reduce:animate-none",
  "[animation-delay:calc((calc(40ms*var(--kf-speed,1))+(min(sibling-index(),8)-1)*calc(60ms*var(--kf-speed,1)))*var(--kf-flourish,1))]",
  "transition-[color,background-color,opacity,filter] duration-[calc(420ms*var(--kf-speed,1))] ease-house",
  "[transition-delay:calc((min(sibling-index(),8)-1)*calc(50ms*var(--kf-speed,1))*var(--kf-flourish,1))] data-loading:[transition-delay:0ms]",
  "motion-reduce:transition-none",
)

/* A placeholder at the part's own size while loading: the ink goes, a soft block stays. */
const placeholder =
  "data-loading:rounded-[6px] data-loading:text-transparent! data-loading:bg-[color-mix(in_oklab,var(--foreground)_7%,transparent)]! data-loading:shadow-none! dark:data-loading:bg-[color-mix(in_oklab,var(--foreground)_9%,transparent)]!"

const surface = cn(
  "rounded-[var(--stat-radius,16px)] bg-[var(--stat-surface,var(--background))]",
  "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-14px_rgb(0_0_0/0.14)]",
  "dark:bg-[var(--stat-surface,var(--card))] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]",
)

/* Tone colours, as variables the delta and the chart both read. */
const tones = cn(
  "[--stat-tone:var(--muted-foreground)]",
  "data-[tone=positive]:[--stat-tone:var(--stat-positive,oklch(0.55_0.15_150))] dark:data-[tone=positive]:[--stat-tone:var(--stat-positive,oklch(0.74_0.16_150))]",
  "data-[tone=negative]:[--stat-tone:var(--stat-negative,var(--destructive))]",
)

export const statClass = cn(
  "group/stat relative min-w-0",
  cn(
    "flex flex-wrap content-start items-start gap-x-3 p-[var(--stat-padding,1.25rem)] text-foreground",
    "[&_:is([data-slot=stat-icon],[data-slot=stat-delta])>svg]:size-3.5 [&_:is([data-slot=stat-icon],[data-slot=stat-delta])>svg]:shrink-0 [&_:is([data-slot=stat-icon],[data-slot=stat-delta])>svg]:stroke-[1.75]",
    surface,
    tones,
  ),
)

export const labelClass = cn(
  partMotion,
  cn("min-w-0 flex-1 truncate py-px text-[13px] leading-[1.3] font-medium text-[color:var(--stat-label,var(--muted-foreground))]", placeholder, "data-loading:flex-none"),
)

export const iconClass = cn(
  partMotion,
  cn(
    "ml-auto -mt-1 -mr-1 grid size-7 shrink-0 place-items-center rounded-[8px] bg-muted text-muted-foreground",
    "shadow-[inset_0_1px_2px_rgb(0_0_0/0.06),inset_0_0_0_1px_rgb(0_0_0/0.03)] dark:shadow-[inset_0_1px_2px_rgb(0_0_0/0.45),inset_0_0_0_1px_rgb(255_255_255/0.04)]",
    "data-loading:text-transparent",
  ),
)

export const valueClass = cn(
  partMotion,
  cn(
    "mt-2.5 w-full text-[length:var(--stat-value-size,28px)] leading-[1.1] font-semibold tracking-tight tabular-nums",
    "data-loading:text-transparent data-loading:[&_[data-roll]]:rounded-[6px] data-loading:[&_[data-roll]]:bg-[color-mix(in_oklab,var(--foreground)_7%,transparent)] dark:data-loading:[&_[data-roll]]:bg-[color-mix(in_oklab,var(--foreground)_9%,transparent)]",
    "[&_[data-roll]]:transition-[background-color] [&_[data-roll]]:duration-[calc(420ms*var(--kf-speed,1))] [&_[data-roll]]:ease-house",
  ),
)

/* A tinted pill: the arrow turns to the direction on a spring, the number Rolls, the colour
   crossfades when the news changes. */
export const deltaClass = cn(
  partMotion,
  cn(
    "mt-2.5 inline-flex h-5 shrink-0 items-center gap-0.5 rounded-full pr-1.5 pl-1 text-[12px] leading-none font-medium tabular-nums",
    "bg-[color-mix(in_oklch,var(--stat-tone)_12%,transparent)] text-[color:var(--stat-tone)]",
    "data-[tone=neutral]:bg-[color-mix(in_oklch,var(--foreground)_6%,transparent)]",
    "[transition-property:opacity,filter]",
    "[&>svg]:transition-[rotate] [&>svg]:duration-[calc(560ms*var(--kf-speed,1))] [&>svg]:ease-spring motion-reduce:[&>svg]:transition-none",
    "data-[trend=down]:[&>svg]:rotate-90 data-[trend=flat]:[&>svg]:rotate-45",
    placeholder,
  ),
)

export const comparisonClass = cn(
  partMotion,
  cn("mt-2.5 min-w-0 flex-1 truncate text-[12px] leading-5 text-muted-foreground", placeholder, "data-loading:flex-none"),
)

/* Room for a sparkline under the numbers. A Sparkline inside takes the delta's colour. */
export const chartClass = cn(
  partMotion,
  cn(
    "mt-4 w-full",
    "[&_[data-slot=sparkline]]:[--sparkline-tone:var(--sparkline-color,var(--stat-tone))] [&_[data-slot=sparkline]]:[--sparkline-height:var(--stat-chart-height,2.75rem)]",
    "data-[tone=neutral]:[&_[data-slot=sparkline]]:[--sparkline-tone:var(--sparkline-color,var(--chart-1))]",
    "data-loading:[&>*]:opacity-0",
    placeholder,
  ),
)

/* One surface; the stats inside drop their own and are split by hairlines, which each stat draws on
   its left and top edge and the grid clips at its own edges, so any column count works. */
export const groupClass = cn("relative min-w-0", cn("@container/stats w-full", surface))
export const gridClass = cn(
  "grid",
  cn(
    "overflow-hidden rounded-[inherit] grid-cols-1 @[26rem]/stats:grid-cols-2 @[48rem]/stats:grid-cols-[repeat(var(--stat-group-columns,4),minmax(0,1fr))]",
    "[&>[data-slot=stat]]:rounded-none [&>[data-slot=stat]]:bg-transparent",
    "[&>[data-slot=stat]]:shadow-[-1px_0_0_var(--stat-divider,var(--border)),0_-1px_0_var(--stat-divider,var(--border))]",
  ),
)
