"use client"

/* Styled badge: the animated primitive plus the Keyframery look. Same variants as shadcn/ui's badge,
   plus `success`. */

import * as React from "react"

import { Badge as BadgePrimitive } from "@/components/primitives/badge"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

const variants = {
  default: "bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.18)]",
  secondary:
    "bg-secondary text-secondary-foreground shadow-[inset_0_0_0_1px_rgb(0_0_0/0.04)] dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.05)]",
  outline: "text-foreground shadow-[inset_0_0_0_1px_var(--input)]",
  destructive: "bg-destructive/12 text-destructive dark:bg-destructive/18",
  success:
    "bg-[color-mix(in_oklch,oklch(0.62_0.16_150)_14%,transparent)] text-[color-mix(in_oklch,oklch(0.62_0.16_150)_82%,var(--foreground))] dark:text-[oklch(0.62_0.16_150)] dark:bg-[color-mix(in_oklch,oklch(0.62_0.16_150)_18%,transparent)]",
} as const

function Badge({
  speed,
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof BadgePrimitive> & { variant?: keyof typeof variants } & SpeedProps) {
  return (
    <Speed speed={speed}>
      <BadgePrimitive
        data-variant={variant}
        className={cn(
          "inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1.5 rounded-full px-2 text-[11px] leading-none font-medium whitespace-nowrap tabular-nums",
          "transition-[background-color,color,box-shadow] duration-[calc(200ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none!",
          "[&>svg]:size-3 [&>svg]:shrink-0 [&_[data-slot=roll]]:leading-[15px] has-data-[slot=roll]:min-w-5 has-data-[slot=roll]:px-1.5",
          variants[variant],
          className,
        )}
        {...props}
      />
    </Speed>
  )
}

export { Badge }
