"use client"

export * from "@/components/primitives/badge"

/* Theming: set on a part or its ancestor; unset variables preserve the original theme.
   --badge-face: Variant surface (default: --primary / --secondary; destructive 12% (dark 18%); success green 14% (dark 18%)).
   --badge-ink: Variant label (default: --primary-foreground / --secondary-foreground / --foreground / --destructive; success green mix 82% (dark green)).
   --badge-border: Outline hairline (default: --input).
   --badge-height: Badge height (default: 1.25rem).
   --badge-gap: Icon and label gap (default: 0.375rem).
   --badge-radius: Corners (default: calc(infinity * 1px)).
   --badge-padding: Horizontal padding (default: 0.5rem).
   --badge-font: Label size (default: 11px).
 */

/* Styled badge: the animated primitive plus the Keyframery look. Same variants as shadcn/ui's badge,
   plus `success`. */

import * as React from "react"

import { Badge as BadgePrimitive } from "@/components/primitives/badge"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

const variants = {
  default: "bg-[var(--badge-face,var(--primary))] text-[color:var(--badge-ink,var(--primary-foreground))] shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.18)]",
  secondary:
    "bg-[var(--badge-face,var(--secondary))] text-[color:var(--badge-ink,var(--secondary-foreground))] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.04)] dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.05)]",
  outline: "bg-[var(--badge-face,transparent)] text-[color:var(--badge-ink,var(--foreground))] shadow-[inset_0_0_0_1px_var(--badge-border,var(--input))]",
  destructive: "bg-[var(--badge-face,color-mix(in_oklab,var(--destructive)_12%,transparent))] text-[color:var(--badge-ink,var(--destructive))] dark:bg-[var(--badge-face,color-mix(in_oklab,var(--destructive)_18%,transparent))]",
  success:
    "bg-[var(--badge-face,color-mix(in_oklch,oklch(0.62_0.16_150)_14%,transparent))] text-[color:var(--badge-ink,color-mix(in_oklch,oklch(0.62_0.16_150)_82%,var(--foreground)))] dark:text-[color:var(--badge-ink,oklch(0.62_0.16_150))] dark:bg-[var(--badge-face,color-mix(in_oklch,oklch(0.62_0.16_150)_18%,transparent))]",
} as const

type BadgeProps = React.ComponentProps<typeof BadgePrimitive>

function Badge({
  speed,
  className,
  variant = "default",
  ...props
}: BadgeProps & { variant?: keyof typeof variants } & SpeedProps) {
  const look = cn(
    "inline-flex h-[var(--badge-height,1.25rem)] w-fit shrink-0 items-center justify-center gap-[var(--badge-gap,0.375rem)] rounded-[var(--badge-radius,calc(infinity*1px))] px-[var(--badge-padding,0.5rem)] text-[length:var(--badge-font,11px)] leading-none font-medium whitespace-nowrap tabular-nums",
    "transition-[background-color,color,box-shadow] duration-[calc(200ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none!",
    "[&>svg]:size-3 [&>svg]:shrink-0 [&_[data-slot=roll]]:leading-[15px] has-data-[slot=roll]:min-w-5 has-data-[slot=roll]:px-1.5",
    variants[variant],
  )
  return (
    <Speed speed={speed}>
      <BadgePrimitive
        data-variant={variant}
        className={typeof className === "function" ? (state) => cn(look, className(state)) : cn(look, className)}
        {...props}
      />
    </Speed>
  )
}

export { Badge }
