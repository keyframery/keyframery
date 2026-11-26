/* UI SDK parts for spinner, made once from the shared core definition (the same file React uses). */
import { createParts } from "@ui-sdk/vue/primitive"

import { spinner } from "@/components/keyframery/core/spinner-core"
import { cn } from "@/lib/utils"

export const { Root: SpinnerRoot } = createParts(spinner, { root: "span" })

const keyframes =
  "@keyframes kf-spinner-in{from{opacity:0;scale:0.4;filter:blur(2px)}}" +
  "@keyframes kf-spinner-turn{to{rotate:360deg}}" +
  "@keyframes kf-spinner-arc{0%{stroke-dasharray:6 100;stroke-dashoffset:0}50%{stroke-dasharray:62 100;stroke-dashoffset:-14}100%{stroke-dasharray:6 100;stroke-dashoffset:-94}}" +
  "@keyframes kf-spinner-spoke{from{opacity:1}to{opacity:0.16}}" +
  "@media (prefers-reduced-motion:reduce){@keyframes kf-spinner-in{from{opacity:0}}}"

if (typeof document !== "undefined" && !document.getElementById("kf-spinner")) {
  const style = document.createElement("style")
  style.id = "kf-spinner"
  style.textContent = keyframes
  document.head.append(style)
}

export type SpinnerSize = "sm" | "md" | "lg"

/* The pop-in scales with --kf-flourish; the turning is a loading loop and always runs. */
export const spinnerMotion =
  "inline-flex shrink-0 animate-[kf-spinner-in_calc(420ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-pop)_backwards] motion-reduce:animate-none"

export const spinnerSizes: Record<SpinnerSize, string> = {
  sm: "size-[var(--spinner-diameter,0.875rem)]",
  md: "size-[var(--spinner-diameter,1rem)]",
  lg: "size-[var(--spinner-diameter,1.5rem)]",
}

/* Theming: --spinner-ink, --spinner-track, --spinner-ring-stroke, --spinner-spoke-stroke,
   --spinner-diameter, --spinner-opacity, --spinner-track-opacity, --spinner-cap. */
export const spinnerLook = cn(
  "text-[color:var(--spinner-ink,currentColor)] opacity-[var(--spinner-opacity,1)]",
  "[&_circle]:[stroke-width:var(--spinner-ring-stroke,2.5)] [&_line]:[stroke-width:var(--spinner-spoke-stroke,2.25)]",
  "[&_circle:first-child]:[stroke:var(--spinner-track,currentColor)] [&_circle:first-child]:opacity-[var(--spinner-track-opacity,0.16)]",
  "[&_circle+circle]:[stroke-linecap:var(--spinner-cap,round)] [&_line]:[stroke-linecap:var(--spinner-cap,round)]",
)
