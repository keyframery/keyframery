"use client"

export * from "@/components/primitives/native-select"

/* Theming variables (set on a part or ancestor; absent values preserve the theme):
   --native-select-face: Field surface; default: bg-background.
   --native-select-ink: Selected value; default: text-foreground.
   --native-select-muted: Placeholder and arrow; default: text-muted-foreground.
   --native-select-radius: Field corners; default: rounded-[10px].
   --native-select-font: Value size; default: text-[13px].
   --native-select-height: Field height; default: h-9.
   --native-select-inset-start: Start padding; default: ps-3.
*/

/* Styled native select: the animated primitive plus the Keyframery look. A field like Input's, with
   the browser's own picker behind it and a chevron at the end. */

import * as React from "react"

import {
  NativeSelect as NativeSelectPrimitive,
  NativeSelectOptGroup as NativeSelectOptGroupPrimitive,
  NativeSelectOption as NativeSelectOptionPrimitive,
} from "@/components/primitives/native-select"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* The field look. The hairline's colour is one variable, so hover, focus and invalid each change a
   single value; the focus ring is the outline, which the primitive closes in on a spring. */
const field = cn(
  "h-[var(--native-select-height,2.25rem)] cursor-pointer rounded-[var(--native-select-radius,10px)] bg-[var(--native-select-face,var(--background))] ps-[var(--native-select-inset-start,0.75rem)] pe-9 text-[length:var(--native-select-font,13px)] outline-0 outline-ring",
  "data-[size=sm]:h-8 data-[size=sm]:rounded-[9px] data-[size=sm]:ps-2.5 data-[size=sm]:pe-8 data-[size=sm]:text-[12.5px]",
  "[--field-line:rgb(0_0_0/0.09)] dark:[--field-line:rgb(255_255_255/0.1)]",
  "shadow-[0_0_0_1px_var(--field-line),0_1px_2px_rgb(0_0_0/0.05)] dark:shadow-[0_0_0_1px_var(--field-line)]",
  "hover:[--field-line:rgb(0_0_0/0.16)] dark:hover:[--field-line:rgb(255_255_255/0.18)]",
  "focus-visible:outline-[3px] focus-visible:outline-ring/30 focus-visible:[--field-line:var(--ring)] dark:focus-visible:[--field-line:var(--ring)]",
  "aria-invalid:outline-destructive aria-invalid:focus-visible:outline-destructive/30 aria-invalid:[--field-line:var(--destructive)] dark:aria-invalid:[--field-line:var(--destructive)]",
  "disabled:cursor-not-allowed disabled:bg-muted disabled:[--field-line:rgb(0_0_0/0.06)] dark:disabled:[--field-line:rgb(255_255_255/0.06)]",
)

function NativeSelect({
  speed,
  className,
  wrapperClassName,
  valueClassName,
  iconClassName,
  ...props
}: React.ComponentProps<typeof NativeSelectPrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <NativeSelectPrimitive
        wrapperClassName={cn("w-fit min-w-0 text-[color:var(--native-select-ink,var(--foreground))] data-disabled:opacity-60", wrapperClassName)}
        className={withClass(field, className)}
        valueClassName={cn(
          "ps-[var(--native-select-inset-start,0.75rem)] pe-9 text-[length:var(--native-select-font,13px)] leading-none group-data-[size=sm]/native-select:ps-2.5 group-data-[size=sm]/native-select:pe-8 group-data-[size=sm]/native-select:text-[12.5px]",
          "data-placeholder:text-[color:var(--native-select-muted,var(--muted-foreground))] group-data-disabled/native-select:text-[color:var(--native-select-muted,var(--muted-foreground))]",
          valueClassName,
        )}
        iconClassName={cn(
          "inset-y-0 end-3 text-[color:var(--native-select-muted,var(--muted-foreground))] [&_svg]:size-4 group-data-[size=sm]/native-select:end-2.5 group-data-[size=sm]/native-select:[&_svg]:size-3.5",
          iconClassName,
        )}
        {...props}
      />
    </Speed>
  )
}

function NativeSelectOption(props: React.ComponentProps<typeof NativeSelectOptionPrimitive>) {
  return <NativeSelectOptionPrimitive {...props} />
}

function NativeSelectOptGroup(props: React.ComponentProps<typeof NativeSelectOptGroupPrimitive>) {
  return <NativeSelectOptGroupPrimitive {...props} />
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption }
