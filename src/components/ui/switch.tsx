"use client"

export * from "@/components/primitives/switch"

/* Styled switch: the animated primitive plus the Keyframery look. */

/* Theming: inherit these optional variables; unset values retain the original light/dark tokens.
   --switch-off: Unchecked track (default: --muted; --accent in dark).
   --switch-on: Checked track (default: --primary).
   --switch-thumb: Thumb surface (default: --background; foreground mixed with 8% background in dark; --primary-foreground when checked in dark).
   --switch-width: Track width (default: 38px).
   --switch-height: Track height (default: 22px).
   --switch-thumb-size: Resting thumb width (default: 18px).
   --switch-radius: Track and thumb corners (default: 9999px).
   --switch-pad: Thumb inset (default: 2px).
 */

import * as React from "react"

import { Switch as SwitchPrimitive, SwitchThumb as SwitchThumbPrimitive } from "@/components/primitives/switch"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* Track: 38 x 22 with 2px of room around an 18px thumb. */
function Switch({
  speed,
  className,
  children,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <SwitchPrimitive
        className={withClass(
          cn(
            "inline-flex h-[var(--switch-height,22px)] w-[var(--switch-width,38px)] shrink-0 cursor-pointer rounded-[var(--switch-radius,9999px)] outline-none select-none [--kf-switch-thumb:var(--switch-thumb-size,18px)] [--kf-switch-pad:var(--switch-pad,2px)]",
            /* Off: a pill well. */
            "bg-[var(--switch-off,var(--muted))] shadow-[inset_0_1px_2px_rgb(0_0_0/0.09),inset_0_0_0_1px_rgb(0_0_0/0.05)]",
            "dark:bg-[var(--switch-off,var(--accent))] dark:shadow-[inset_0_1px_2px_rgb(0_0_0/0.5),inset_0_0_0_1px_rgb(255_255_255/0.05)]",
            "not-data-disabled:not-data-readonly:hover:bg-[color-mix(in_oklab,var(--switch-off,var(--muted)),var(--foreground)_5%)]",
            "dark:not-data-disabled:not-data-readonly:hover:bg-[color-mix(in_oklab,var(--switch-off,var(--accent)),var(--foreground)_6%)]",
            /* On: the well fills with primary. */
            "data-checked:bg-[var(--switch-on,var(--primary))] data-checked:shadow-[inset_0_1px_2px_rgb(0_0_0/0.2),inset_0_0_0_1px_rgb(0_0_0/0.05)]",
            "dark:data-checked:bg-[var(--switch-on,var(--primary))] dark:data-checked:shadow-[inset_0_1px_2px_rgb(0_0_0/0.25)]",
            "not-data-disabled:not-data-readonly:data-checked:hover:bg-[color-mix(in_oklab,var(--switch-on,var(--primary)),var(--background)_10%)]",
            "dark:not-data-disabled:not-data-readonly:data-checked:hover:bg-[color-mix(in_oklab,var(--switch-on,var(--primary)),var(--background)_10%)]",
            "data-invalid:shadow-[inset_0_1px_2px_rgb(0_0_0/0.09),inset_0_0_0_1px_var(--destructive)]",
            "transition-[background-color,box-shadow] duration-[calc(200ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none!",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "data-disabled:cursor-not-allowed data-disabled:opacity-50 data-readonly:cursor-default",
          ),
          className,
        )}
        {...props}
      >
        {children ?? <SwitchThumb />}
      </SwitchPrimitive>
    </Speed>
  )
}

/* Thumb: a round key. */
function SwitchThumb({ className, ...props }: React.ComponentProps<typeof SwitchThumbPrimitive>) {
  return (
    <SwitchThumbPrimitive
      className={withClass(
        cn(
          "pointer-events-none block rounded-[var(--switch-radius,9999px)] bg-[var(--switch-thumb,var(--background))]",
          "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.06),0_2px_4px_-1px_rgb(0_0_0/0.16)]",
          "dark:bg-[var(--switch-thumb,color-mix(in_oklab,var(--foreground),var(--background)_8%))] dark:shadow-[0_0_0_1px_rgb(0_0_0/0.25),0_1px_3px_rgb(0_0_0/0.5)]",
          "dark:data-checked:bg-[var(--switch-thumb,var(--primary-foreground))] dark:data-checked:shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_1px_3px_rgb(0_0_0/0.45)]",
        ),
        className,
      )}
      {...props}
    />
  )
}

export { Switch, SwitchThumb }

/* UI SDK's helpers for this component, passed through. */
export { createSwitchController } from "@/components/primitives/switch"
