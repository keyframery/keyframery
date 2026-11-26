/* Classes for the sparkline's parts: the React primitive's layout and motion, then the ui layer's look.
   Every moving value is a CSS variable from the core (`--sparkline-x`, `--sparkline-y`,
   `--sparkline-w`, `--sparkline-h` in percent, `--sparkline-path`). */
import { cn } from "@/lib/utils"

/* The line draws itself from the left; it tweens to new values on a spring. The draw scales with
   --kf-flourish; the tween stays. */
export const lineMotion = cn(
  "fill-none [d:var(--sparkline-path)] [vector-effect:non-scaling-stroke]",
  "[clip-path:inset(-50%_-6%_-50%_-6%)] starting:[clip-path:inset(-50%_106%_-50%_-6%)]",
  `[transition:d_calc(720ms*var(--kf-speed,1))_var(--ease-spring),clip-path_calc(900ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-house)]`,
  "motion-reduce:transition-none",
)
export const areaMotion = lineMotion.replace("fill-none ", "")

/* Bars grow from the baseline one after another; the cascade takes about 520ms whatever the count.
   The growth on mount and the stagger scale with --kf-flourish; a new value still tweens. */
export const barMotion = cn(
  "absolute left-[calc(var(--sparkline-x)*1%)] w-[calc(var(--sparkline-w)*1%)] bottom-[calc(var(--sparkline-y)*1%)] h-[calc(var(--sparkline-h)*1%)] starting:h-[calc(var(--sparkline-h)*1%*(1-var(--kf-flourish,1)))]",
  "data-negative:bottom-auto data-negative:top-[calc((100-var(--sparkline-y)-var(--sparkline-h))*1%)]",
  "data-dim:opacity-45",
  `transition-[left,width,bottom,top,height,opacity] duration-[calc(640ms*var(--kf-speed,1))] ease-spring`,
  `[transition-delay:calc(var(--sparkline-i,0)*calc(520ms*var(--kf-speed,1)*var(--kf-flourish,1))/var(--sparkline-n,1)),calc(var(--sparkline-i,0)*calc(520ms*var(--kf-speed,1)*var(--kf-flourish,1))/var(--sparkline-n,1)),calc(var(--sparkline-i,0)*calc(520ms*var(--kf-speed,1)*var(--kf-flourish,1))/var(--sparkline-n,1)),calc(var(--sparkline-i,0)*calc(520ms*var(--kf-speed,1)*var(--kf-flourish,1))/var(--sparkline-n,1)),calc(var(--sparkline-i,0)*calc(520ms*var(--kf-speed,1)*var(--kf-flourish,1))/var(--sparkline-n,1)),0ms]`,
  "motion-reduce:transition-none",
)

const pointBox = "absolute left-[calc(var(--sparkline-x)*1%)] top-[calc(var(--sparkline-y)*1%)] -translate-1/2"
const follow = `[transition:left_calc(720ms*var(--kf-speed,1))_var(--ease-spring),top_calc(720ms*var(--kf-speed,1))_var(--ease-spring),scale_calc(360ms*var(--kf-speed,1))_var(--ease-pop),opacity_calc(200ms*var(--kf-speed,1))_var(--ease-house)]`
const glide = `[transition:left_calc(320ms*var(--kf-speed,1))_var(--ease-spring),top_calc(320ms*var(--kf-speed,1))_var(--ease-spring),translate_calc(320ms*var(--kf-speed,1))_var(--ease-spring),scale_calc(300ms*var(--kf-speed,1))_var(--ease-pop),opacity_calc(160ms*var(--kf-speed,1))_var(--ease-house)]`

export const referenceClass = cn(
  "pointer-events-none absolute inset-x-0 top-[calc(var(--sparkline-y)*1%)] h-0 starting:opacity-[calc(1-var(--kf-flourish,1))]",
  `[transition:top_calc(720ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(400ms*var(--kf-speed,1))_var(--ease-house)] motion-reduce:transition-none`,
)
export const extremeClass = cn(
  pointBox,
  "pointer-events-none size-[var(--sparkline-dot,6px)] starting:scale-[calc(1-var(--kf-flourish,1))] starting:opacity-[calc(1-var(--kf-flourish,1))]",
  follow,
  `[transition-delay:0ms,0ms,calc(760ms*var(--kf-speed,1)*var(--kf-flourish,1)),calc(760ms*var(--kf-speed,1)*var(--kf-flourish,1))] motion-reduce:transition-none`,
)
export const endClass = cn(
  pointBox,
  "pointer-events-none size-[var(--sparkline-dot,6px)] starting:scale-[calc(1-var(--kf-flourish,1))] starting:opacity-[calc(1-var(--kf-flourish,1))] data-[type=bar]:hidden",
  "group-data-active/sparkline:scale-75 group-data-active/sparkline:opacity-50",
  follow,
  `[transition-delay:0ms,0ms,calc(820ms*var(--kf-speed,1)*var(--kf-flourish,1)),calc(820ms*var(--kf-speed,1)*var(--kf-flourish,1))] motion-reduce:transition-none`,
)
export const cursorClass = cn("pointer-events-none absolute inset-y-0 left-[calc(var(--sparkline-x)*1%)] w-px -translate-x-1/2 opacity-0 data-open:opacity-100", glide, "motion-reduce:transition-none")
export const markerClass = cn(pointBox, "pointer-events-none size-[calc(var(--sparkline-dot,6px)+2px)] scale-[calc(0.95-0.55*var(--kf-flourish,1))] opacity-0 data-open:scale-100 data-open:opacity-100", glide, "motion-reduce:transition-none")
export const readoutClass = cn(
  "pointer-events-none absolute bottom-[calc(100%+var(--sparkline-inset,4px)+6px)] left-[calc(var(--sparkline-x)*1%)] z-10 w-max",
  "[translate:-50%_0] data-[side=left]:[translate:calc(-100%+10px)_0] data-[side=right]:[translate:-10px_0]",
  "origin-bottom scale-[calc(0.95-0.25*var(--kf-flourish,1))] opacity-0 data-open:scale-100 data-open:opacity-100",
  glide,
  "motion-reduce:transition-none",
)
export const pointsClass = "absolute inset-0 outline-none"
export const pointClass = "absolute inset-y-0 left-[calc(var(--sparkline-x)*1%)] w-[calc(var(--sparkline-w)*1%)] outline-none"
export const svgClass = "pointer-events-none absolute inset-0 size-full overflow-visible"

/* The ui look: on the root. */
export const sparklineClass = cn(
  "group/sparkline relative isolate block min-w-0",
  cn(
    "h-[var(--sparkline-height,2.5rem)] w-full text-[12px]",
    "[--sparkline-tone:var(--sparkline-color,var(--chart-1))]",
    "data-trend-color:data-[tone=positive]:[--sparkline-tone:var(--sparkline-positive,oklch(0.62_0.16_150))] dark:data-trend-color:data-[tone=positive]:[--sparkline-tone:var(--sparkline-positive,oklch(0.72_0.16_150))]",
    "data-trend-color:data-[tone=negative]:[--sparkline-tone:var(--sparkline-negative,var(--destructive))]",
    "data-trend-color:data-[tone=neutral]:[--sparkline-tone:var(--sparkline-color,var(--muted-foreground))]",
    "[--sparkline-ring:var(--sparkline-surface,var(--background))] dark:[--sparkline-ring:var(--sparkline-surface,var(--card))]",
  ),
)

/* The ui look: on the plot. */
export const plotClass = cn(
  "absolute inset-[var(--sparkline-inset,4px)] touch-pan-y",
  cn(
    "[&_[data-slot=sparkline-line]]:[stroke:var(--sparkline-tone)] [&_[data-slot=sparkline-line]]:[stroke-width:var(--sparkline-stroke,1.75px)] [&_[data-slot=sparkline-line]]:[stroke-linecap:round] [&_[data-slot=sparkline-line]]:[stroke-linejoin:round]",
    "[&_[data-slot=sparkline-bar]]:rounded-t-[2px] [&_[data-slot=sparkline-bar][data-negative]]:rounded-t-none [&_[data-slot=sparkline-bar][data-negative]]:rounded-b-[2px]",
    "[&_[data-slot=sparkline-bar]]:bg-[color-mix(in_oklch,var(--sparkline-tone)_42%,transparent)] [&_[data-slot=sparkline-bar]:is([data-last],[data-active])]:bg-[var(--sparkline-tone)]",
    "[&>[data-slot=sparkline-end]]:rounded-full [&>[data-slot=sparkline-end]]:bg-[var(--sparkline-tone)] [&>[data-slot=sparkline-end]]:shadow-[0_0_0_2px_var(--sparkline-ring)]",
    "[&>[data-slot=sparkline-extreme]]:rounded-full [&>[data-slot=sparkline-extreme]]:bg-[var(--sparkline-ring)] [&>[data-slot=sparkline-extreme]]:shadow-[inset_0_0_0_1.5px_var(--sparkline-tone)]",
    "[&>[data-slot=sparkline-reference]]:border-t [&>[data-slot=sparkline-reference]]:border-dashed [&>[data-slot=sparkline-reference]]:border-[color:color-mix(in_oklch,var(--sparkline-reference,var(--muted-foreground))_60%,transparent)]",
    "[&>[data-slot=sparkline-cursor]]:bg-[color-mix(in_oklch,var(--foreground)_22%,transparent)]",
    "[&>[data-slot=sparkline-marker]]:rounded-full [&>[data-slot=sparkline-marker]]:bg-[var(--sparkline-tone)] [&>[data-slot=sparkline-marker]]:shadow-[0_0_0_2px_var(--sparkline-ring),0_1px_3px_rgb(0_0_0/0.25)] dark:[&>[data-slot=sparkline-marker]]:shadow-[0_0_0_2px_var(--sparkline-ring),0_1px_3px_rgb(0_0_0/0.6)]",
    "[&>[data-slot=sparkline-readout]]:flex [&>[data-slot=sparkline-readout]]:items-center [&>[data-slot=sparkline-readout]]:gap-1.5 [&>[data-slot=sparkline-readout]]:rounded-[8px] [&>[data-slot=sparkline-readout]]:bg-foreground [&>[data-slot=sparkline-readout]]:px-2 [&>[data-slot=sparkline-readout]]:py-1 [&>[data-slot=sparkline-readout]]:text-[12px] [&>[data-slot=sparkline-readout]]:leading-[1.3] [&>[data-slot=sparkline-readout]]:font-medium [&>[data-slot=sparkline-readout]]:text-background",
    "[&>[data-slot=sparkline-readout]>[data-readout-label]]:font-normal [&>[data-slot=sparkline-readout]>[data-readout-label]]:opacity-65",
    "[&_[data-slot=sparkline-point]]:rounded-[3px] [&_[data-slot=sparkline-point]]:focus-visible:bg-[color-mix(in_oklch,var(--ring)_14%,transparent)]",
  ),
)
