"use client"

/* Styled switch: the animated primitive plus the Keyframery look. */

import * as React from "react"

import { Switch as SwitchPrimitive, SwitchThumb as SwitchThumbPrimitive } from "@/components/primitives/switch"
import { cn } from "@/lib/utils"

/* Track: 38 x 22 with 2px of room around an 18px thumb. */
function Switch({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive>) {
  return (
    <SwitchPrimitive
      className={cn(
        "inline-flex h-[22px] w-[38px] shrink-0 cursor-pointer rounded-full outline-none select-none [--kf-switch-thumb:18px]",
        /* Off: a pill well. */
        "bg-muted shadow-[inset_0_1px_2px_rgb(0_0_0/0.09),inset_0_0_0_1px_rgb(0_0_0/0.05)]",
        "dark:bg-accent dark:shadow-[inset_0_1px_2px_rgb(0_0_0/0.5),inset_0_0_0_1px_rgb(255_255_255/0.05)]",
        "not-data-disabled:not-data-readonly:hover:bg-[color-mix(in_oklab,var(--muted),var(--foreground)_5%)]",
        "dark:not-data-disabled:not-data-readonly:hover:bg-[color-mix(in_oklab,var(--accent),var(--foreground)_6%)]",
        /* On: the well fills with primary. */
        "data-checked:bg-primary data-checked:shadow-[inset_0_1px_2px_rgb(0_0_0/0.2),inset_0_0_0_1px_rgb(0_0_0/0.05)]",
        "dark:data-checked:bg-primary dark:data-checked:shadow-[inset_0_1px_2px_rgb(0_0_0/0.25)]",
        "not-data-disabled:not-data-readonly:data-checked:hover:bg-[color-mix(in_oklab,var(--primary),var(--background)_10%)]",
        "dark:not-data-disabled:not-data-readonly:data-checked:hover:bg-[color-mix(in_oklab,var(--primary),var(--background)_10%)]",
        "data-invalid:shadow-[inset_0_1px_2px_rgb(0_0_0/0.09),inset_0_0_0_1px_var(--destructive)]",
        "transition-[background-color,box-shadow] duration-[calc(200ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none!",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50 data-readonly:cursor-default",
        className as string,
      )}
      {...props}
    >
      {children ?? <SwitchThumb />}
    </SwitchPrimitive>
  )
}

/* Thumb: a round key. */
function SwitchThumb({ className, ...props }: React.ComponentProps<typeof SwitchThumbPrimitive>) {
  return (
    <SwitchThumbPrimitive
      className={cn(
        "pointer-events-none block rounded-full bg-background",
        "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.06),0_2px_4px_-1px_rgb(0_0_0/0.16)]",
        "dark:bg-[color-mix(in_oklab,var(--foreground),var(--background)_8%)] dark:shadow-[0_0_0_1px_rgb(0_0_0/0.25),0_1px_3px_rgb(0_0_0/0.5)]",
        "dark:data-checked:bg-primary-foreground dark:data-checked:shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_1px_3px_rgb(0_0_0/0.45)]",
        className as string,
      )}
      {...props}
    />
  )
}

export { Switch, SwitchThumb }
