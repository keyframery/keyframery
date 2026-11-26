/* UI SDK parts for native-select, made once from the shared core definition (the same file React uses). */
import { createParts } from "@ui-sdk/vue/primitive"

import { nativeSelect } from "@/components/keyframery/core/native-select-core"
import { cn } from "@/lib/utils"

const keyframes =
  "@keyframes kf-native-select-in{from{opacity:0;translate:0 .75em;filter:blur(3px)}}" +
  "@keyframes kf-native-select-out{to{opacity:0;translate:0 -.75em;filter:blur(3px)}}" +
  "@keyframes kf-native-select-dip{40%{translate:0 3px}}"
if (typeof document !== "undefined" && !document.getElementById("kf-native-select")) {
  const s = document.createElement("style")
  s.id = "kf-native-select"
  s.textContent = keyframes
  document.head.append(s)
}

export const {
  Control: NativeSelectControlPart,
  Icon: NativeSelectIconPart,
  Option: NativeSelectOptionPart,
  Optgroup: NativeSelectOptGroupPart,
} = createParts(nativeSelect, {
  root: "div",
  control: "select",
  icon: "span",
  option: "option",
  optgroup: "optgroup",
})

/* The focus ring is the outline: it starts 10px out and closes in on a spring (Keyframery's Input recipe). */
const ringMotion = cn(
  "outline-offset-[calc(10px*var(--kf-flourish,1))] focus-visible:outline-offset-0",
  "[transition:outline-offset_calc(160ms*var(--kf-speed,1))_var(--ease-house),outline-width_calc(160ms*var(--kf-speed,1))_var(--ease-house),outline-color_0s_linear_calc(160ms*var(--kf-speed,1)),box-shadow_calc(150ms*var(--kf-speed,1))_var(--ease-house),background-color_calc(150ms*var(--kf-speed,1))_var(--ease-house)]",
  "focus-visible:[transition:outline-offset_calc((150ms+750ms*var(--kf-flourish,1))*var(--kf-speed,1))_var(--ease-spring),outline-width_calc((150ms+750ms*var(--kf-flourish,1))*var(--kf-speed,1))_var(--ease-spring),outline-color_calc((150ms+550ms*var(--kf-flourish,1))*var(--kf-speed,1))_var(--ease-house),box-shadow_calc(150ms*var(--kf-speed,1))_var(--ease-house),background-color_calc(150ms*var(--kf-speed,1))_var(--ease-house)]",
  "motion-reduce:[transition:none]!",
)

/* The <select> itself. Its own text is transparent: the value part draws the label. */
export const controlMotion = cn("w-full min-w-0 appearance-none text-transparent", ringMotion)

export const valueMotion = "pointer-events-none absolute inset-0 grid items-center overflow-hidden *:[grid-area:1/1] *:truncate"
export const iconMotion = "pointer-events-none absolute grid place-items-center"
export const optionMotion = "bg-[Canvas] text-[CanvasText]"

export const rootMotion = cn(
  "group/native-select relative isolate",
  "[transition:scale_calc(260ms*var(--kf-speed,1))_var(--ease-pop)] not-data-disabled:has-[select:active]:scale-[calc(1-0.015*var(--kf-flourish,1))] not-data-disabled:has-[select:active]:[transition-duration:calc(100ms*var(--kf-speed,1))]",
  "motion-reduce:[transition:none]!",
)

/* The Keyframery look (React: ui/native-select.tsx). */
export const field = cn(
  "h-[var(--native-select-height,2.25rem)] cursor-pointer rounded-[var(--native-select-radius,10px)] bg-[var(--native-select-face,var(--background))] ps-[var(--native-select-inset-start,0.75rem)] pe-9 text-[length:var(--native-select-font,13px)] outline-0 outline-ring",
  "data-[size=sm]:h-8 data-[size=sm]:rounded-[9px] data-[size=sm]:ps-2.5 data-[size=sm]:pe-8 data-[size=sm]:text-[12.5px]",
  "[--field-line:rgb(0_0_0/0.09)] dark:[--field-line:rgb(255_255_255/0.1)]",
  "shadow-[0_0_0_1px_var(--field-line),0_1px_2px_rgb(0_0_0/0.05)] dark:shadow-[0_0_0_1px_var(--field-line)]",
  "hover:[--field-line:rgb(0_0_0/0.16)] dark:hover:[--field-line:rgb(255_255_255/0.18)]",
  "focus-visible:outline-[3px] focus-visible:outline-ring/30 focus-visible:[--field-line:var(--ring)] dark:focus-visible:[--field-line:var(--ring)]",
  "aria-invalid:outline-destructive aria-invalid:focus-visible:outline-destructive/30 aria-invalid:[--field-line:var(--destructive)] dark:aria-invalid:[--field-line:var(--destructive)]",
  "disabled:cursor-not-allowed disabled:bg-muted disabled:[--field-line:rgb(0_0_0/0.06)] dark:disabled:[--field-line:rgb(255_255_255/0.06)]",
)
export const wrapperLook = "w-fit min-w-0 text-[color:var(--native-select-ink,var(--foreground))] data-disabled:opacity-60"
export const valueLook = cn(
  "ps-[var(--native-select-inset-start,0.75rem)] pe-9 text-[length:var(--native-select-font,13px)] leading-none group-data-[size=sm]/native-select:ps-2.5 group-data-[size=sm]/native-select:pe-8 group-data-[size=sm]/native-select:text-[12.5px]",
  "data-placeholder:text-[color:var(--native-select-muted,var(--muted-foreground))] group-data-disabled/native-select:text-[color:var(--native-select-muted,var(--muted-foreground))]",
)
export const iconLook =
  "inset-y-0 end-3 text-[color:var(--native-select-muted,var(--muted-foreground))] [&_svg]:size-4 group-data-[size=sm]/native-select:end-2.5 group-data-[size=sm]/native-select:[&_svg]:size-3.5"
