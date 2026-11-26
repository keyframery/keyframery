/* UI SDK parts for trace, made once from the shared core definition (the same file React uses), and
   the classes the React primitive and ui layers put on them. */
import { createParts } from "@ui-sdk/vue/primitive"

import { trace } from "@/components/keyframery/core/trace-core"
import { cn } from "@/lib/utils"

export const {
  Root: TraceRoot,
  Line: TraceLinePart,
  Icon: TraceIconPart,
  Title: TraceTitlePart,
  Description: TraceDescriptionPart,
} = createParts(trace, { root: "div", line: "span", icon: "span", title: "span", description: "span" })

const keyframes = [
  "@keyframes kf-trace-row{from{opacity:0;translate:0 8px;filter:blur(4px)}}",
  "@keyframes kf-trace-shimmer{from{background-position:100% 0}to{background-position:0% 0}}",
  "@keyframes kf-trace-tick{from{stroke-dashoffset:1}}",
  "@keyframes kf-trace-pop{from{scale:0.4;opacity:0}}",
].join("")
if (typeof document !== "undefined" && !document.getElementById("kf-trace")) {
  const style = document.createElement("style")
  style.id = "kf-trace"
  style.textContent = keyframes
  document.head.append(style)
}

/* Primitive: each direct child (a line, a link, a row that expands) rises in a beat after the one
   above it. Ui: the column, and any link or button that wraps a line directly is styled like the trigger. */
export const traceClass = cn(
  cn(
    "*:animate-[kf-trace-row_calc(460ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_backwards]",
    "*:[animation-delay:calc((min(sibling-index(),10)-1)*calc(55ms*var(--kf-speed,1))*var(--kf-flourish,1))]",
    "motion-reduce:*:animate-none!",
  ),
  cn(
    "flex w-full min-w-0 flex-col gap-[var(--trace-gap,0.625rem)] text-[length:var(--trace-font,13px)]",
    "*:has-[>[data-slot=trace-line]]:w-fit *:has-[>[data-slot=trace-line]]:max-w-full *:has-[>[data-slot=trace-line]]:rounded-[6px] *:has-[>[data-slot=trace-line]]:outline-none",
    "*:has-[>[data-slot=trace-line]]:focus-visible:ring-2 *:has-[>[data-slot=trace-line]]:focus-visible:ring-ring *:has-[>[data-slot=trace-line]]:focus-visible:ring-offset-2 *:has-[>[data-slot=trace-line]]:focus-visible:ring-offset-background",
  ),
)

export const traceLineClass = cn(
  "group/trace-line",
  cn(
    "flex w-fit max-w-full min-w-0 items-center gap-2 leading-[1.35] text-[color:var(--trace-ink,var(--muted-foreground))]",
    "transition-[color,opacity] duration-[calc(150ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none",
    "in-[a:hover,button:hover]:text-foreground in-[a,button]:cursor-pointer",
    "data-[status=running]:text-foreground",
    "data-[status=error]:text-[color:var(--trace-error,var(--destructive))] in-[a:hover,button:hover]:data-[status=error]:text-[color:var(--trace-error,var(--destructive))]",
    "data-[status=pending]:opacity-55",
  ),
)

/* The light runs across the text of a running title. Its colour is the text's own. */
export const traceTitleClass = cn(
  cn(
    "group-data-[status=running]/trace-line:bg-[linear-gradient(90deg,currentColor_0%,currentColor_38%,color-mix(in_oklch,currentColor_25%,transparent)_50%,currentColor_62%,currentColor_100%)]",
    "group-data-[status=running]/trace-line:bg-[length:250%_100%] group-data-[status=running]/trace-line:bg-clip-text group-data-[status=running]/trace-line:[-webkit-text-fill-color:transparent]",
    "group-data-[status=running]/trace-line:animate-[kf-trace-shimmer_calc(1800ms*var(--kf-speed,1))_var(--ease-house)_infinite]",
    "motion-reduce:animate-none! motion-reduce:bg-none! motion-reduce:[-webkit-text-fill-color:currentColor]!",
  ),
  "min-w-0 truncate",
)

export const traceDescriptionClass = "shrink-0 text-[12px] text-muted-foreground/70 tabular-nums"

/* 16px. Done steps take the payoff green. */
export const traceIconClass = cn(
  "grid size-[var(--trace-icon-size,1rem)] shrink-0 place-items-center [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-[var(--trace-icon-size,1rem)]",
  "[&_[data-mark=done]]:text-[oklch(0.62_0.16_150)]",
)

export const traceMarkPop = "animate-[kf-trace-pop_calc(380ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-pop)_backwards] motion-reduce:animate-none"

export const traceTriggerClass = cn(
  "group/trace-trigger transition-[scale] duration-[calc(220ms*var(--kf-speed,1))] ease-pop active:scale-[calc(1-0.02*var(--kf-flourish,1))] motion-reduce:transition-none!",
  cn(
    "flex w-fit max-w-full min-w-0 cursor-pointer items-center gap-1.5 rounded-[6px] text-start text-[color:var(--trace-ink,var(--muted-foreground))] outline-none",
    "hover:text-foreground data-open:text-foreground",
    "has-[[data-status=error]]:text-[color:var(--trace-error,var(--destructive))]",
    "*:data-[slot=trace-chevron]:text-muted-foreground/70 data-disabled:cursor-default data-disabled:*:data-[slot=trace-chevron]:opacity-0",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  ),
)

export const traceContentClass = cn(
  "ms-[7.5px] min-w-0 border-s border-border ps-[var(--trace-indent,1rem)] text-[length:var(--trace-detail-font,12.5px)] leading-relaxed text-[color:var(--trace-ink,var(--muted-foreground))]",
  "flex flex-col gap-2 *:first:mt-2.5 *:last:mb-1",
)
