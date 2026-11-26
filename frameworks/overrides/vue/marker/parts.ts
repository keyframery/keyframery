/* UI SDK parts for marker, made once from the shared core definition (the same file React uses). */
import { createParts } from "@ui-sdk/vue/primitive"

import { marker } from "@/components/keyframery/core/marker-core"
import { cn } from "@/lib/utils"

export const { Root: MarkerRoot, Icon: MarkerIconPart, Content: MarkerContentPart } = createParts(marker, {
  root: "div",
  icon: "span",
  content: "span",
})

const keyframes =
  "@keyframes kf-marker-in{from{opacity:0;translate:0 6px;filter:blur(4px)}}" +
  "@keyframes kf-marker-pop{from{opacity:0;scale:0.5}}" +
  "@keyframes kf-marker-line{from{scale:0 1}}" +
  "@keyframes kf-marker-sweep{from{background-position:100% 0}to{background-position:0 0}}"
if (typeof document !== "undefined" && !document.getElementById("kf-marker")) {
  const style = document.createElement("style")
  style.id = "kf-marker"
  style.textContent = keyframes
  document.head.append(style)
}

/* Motion: separator rules draw outward from the words, the border rule from the line start. */
export const markerMotion = cn(
  "data-[variant=separator]:before:origin-right data-[variant=separator]:after:origin-left",
  "rtl:data-[variant=separator]:before:origin-left rtl:data-[variant=separator]:after:origin-right",
  "data-[variant=separator]:before:animate-[kf-marker-line_calc(700ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_backwards]",
  "data-[variant=separator]:after:animate-[kf-marker-line_calc(700ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_backwards]",
  "data-[variant=border]:after:origin-left rtl:data-[variant=border]:after:origin-right",
  "data-[variant=border]:after:animate-[kf-marker-line_calc(820ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-house)_backwards]",
  "motion-reduce:before:animate-none! motion-reduce:after:animate-none!",
)

export const markerLook = cn(
  "group/marker relative flex min-h-[var(--marker-height,1rem)] w-full items-center gap-[var(--marker-gap,0.5rem)] text-left text-[length:var(--marker-font,12px)] leading-4 text-[color:var(--marker-ink,var(--muted-foreground))]",
  "[&_svg]:size-[var(--marker-icon-size,0.875rem)] [&_svg]:shrink-0",
  "[&_a]:text-[color:var(--marker-link,var(--foreground))] [&_a]:underline [&_a]:decoration-foreground/25 [&_a]:underline-offset-3 [&_a:hover]:decoration-foreground",
  "data-[variant=separator]:before:h-[var(--marker-line-width,1px)] data-[variant=separator]:before:min-w-0 data-[variant=separator]:before:flex-1 data-[variant=separator]:before:bg-[var(--marker-line,var(--border))] data-[variant=separator]:before:me-1",
  "data-[variant=separator]:after:h-[var(--marker-line-width,1px)] data-[variant=separator]:after:min-w-0 data-[variant=separator]:after:flex-1 data-[variant=separator]:after:bg-[var(--marker-line,var(--border))] data-[variant=separator]:after:ms-1",
  "data-[variant=border]:pb-2.5 data-[variant=border]:after:absolute data-[variant=border]:after:inset-x-0 data-[variant=border]:after:bottom-0 data-[variant=border]:after:h-[var(--marker-line-width,1px)] data-[variant=border]:after:bg-[var(--marker-line,var(--border))]",
)

/* Pops in once the work it marks is done. */
export const iconMotion = cn(
  "inline-flex",
  "not-data-pending:animate-[kf-marker-pop_calc(460ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-pop)_calc(60ms*var(--kf-speed,1)*var(--kf-flourish,1))_backwards]",
  "motion-reduce:animate-none!",
)
export const iconLook = "size-[var(--marker-icon-size,0.875rem)] shrink-0 items-center justify-center [&_svg]:size-[var(--marker-icon-size,0.875rem)]"

/* The pending sweep is a gradient of the text's own colour, clipped to the letters. */
export const contentMotion = cn(
  "not-data-pending:animate-[kf-marker-in_calc(480ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_backwards]",
  "data-pending:bg-[linear-gradient(90deg,currentColor_0_32%,color-mix(in_oklch,currentColor_15%,transparent)_50%,currentColor_68%_100%)]",
  "data-pending:bg-size-[300%_100%] data-pending:bg-clip-text data-pending:[-webkit-text-fill-color:transparent]",
  "data-pending:animate-[kf-marker-sweep_calc(1800ms*var(--kf-speed,1))_var(--ease-house)_infinite]",
  "rtl:data-pending:[animation-direction:reverse]",
  "motion-reduce:animate-none! motion-reduce:data-pending:bg-none! motion-reduce:data-pending:[-webkit-text-fill-color:currentColor]!",
)
export const contentLook = cn(
  "min-w-0 font-medium wrap-break-word",
  "group-data-[variant=separator]/marker:flex-none group-data-[variant=separator]/marker:text-center",
)
