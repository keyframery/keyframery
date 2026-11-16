"use client"

/* Styled button: the animated primitive plus the Keyframery look. */

import * as React from "react"

import { ButtonArrow, Button as ButtonPart } from "@/components/primitives/button"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

type ButtonVariant = "default" | "primary" | "ghost" | "destructive"
type ButtonSize = "sm" | "md" | "lg" | "icon" | "icon-sm" | "icon-lg"

/* The white key. Shared by the default and destructive variants. */
const key = [
  "bg-background dark:bg-accent",
  "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)]",
  "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
  "not-data-disabled:hover:shadow-[0_0_0_1px_rgb(0_0_0/0.1),0_1px_1px_rgb(0_0_0/0.05),0_4px_8px_-2px_rgb(0_0_0/0.12)]",
  "dark:not-data-disabled:hover:shadow-[0_0_0_1px_rgb(255_255_255/0.12),inset_0_1px_0_rgb(255_255_255/0.1),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
  "not-data-disabled:not-data-pending:active:shadow-[0_0_0_1px_rgb(0_0_0/0.1),0_1px_1px_rgb(0_0_0/0.04),0_1px_2px_-1px_rgb(0_0_0/0.06)]",
  "dark:not-data-disabled:not-data-pending:active:shadow-[0_0_0_1px_rgb(255_255_255/0.09),inset_0_1px_0_rgb(255_255_255/0.04),0_1px_2px_-1px_rgb(0_0_0/0.6)]",
]

const variants: Record<ButtonVariant, (string | string[])[]> = {
  default: [
    key,
    "text-foreground",
    "not-data-disabled:hover:bg-[color-mix(in_oklab,var(--background),var(--foreground)_3%)]",
    "dark:not-data-disabled:hover:bg-[color-mix(in_oklab,var(--accent),var(--foreground)_7%)]",
  ],
  primary: [
    "bg-primary text-primary-foreground",
    "shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.25)]",
    "dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.7),0_1px_2px_rgb(0_0_0/0.5)]",
    "not-data-disabled:hover:bg-[color-mix(in_oklab,var(--primary),var(--background)_10%)]",
    "not-data-disabled:hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_2px_5px_rgb(0_0_0/0.25)]",
    "dark:not-data-disabled:hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.7),0_2px_5px_rgb(0_0_0/0.5)]",
    "not-data-disabled:not-data-pending:active:shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_0_1px_rgb(0_0_0/0.3)]",
    "dark:not-data-disabled:not-data-pending:active:shadow-[inset_0_1px_0_rgb(255_255_255/0.4),0_0_1px_rgb(0_0_0/0.5)]",
  ],
  ghost: [
    "text-foreground",
    "not-data-disabled:hover:bg-accent",
    "not-data-disabled:not-data-pending:active:bg-[color-mix(in_oklab,var(--accent),var(--foreground)_6%)]",
  ],
  destructive: [
    key,
    "text-destructive",
    "not-data-disabled:hover:bg-[color-mix(in_oklab,var(--background),var(--destructive)_7%)]",
    "dark:not-data-disabled:hover:bg-[color-mix(in_oklab,var(--accent),var(--destructive)_14%)]",
  ],
}

const sizes: Record<ButtonSize, string> = {
  sm: "h-7 gap-1.5 rounded-[8px] px-2.5 text-[12px] [&_svg]:size-3.5",
  md: "h-8 gap-1.5 rounded-[9px] px-3 text-[13px] [&_svg]:size-4",
  lg: "h-9 gap-2 rounded-[10px] px-4 text-[14px] [&_svg]:size-4",
  "icon-sm": "size-7 rounded-[8px] [&_svg]:size-3.5",
  icon: "size-8 rounded-[9px] [&_svg]:size-4",
  "icon-lg": "size-9 rounded-[10px] [&_svg]:size-4",
}

function Button({
  speed,
  className,
  variant = "default",
  size = "md",
  ...props
}: React.ComponentProps<typeof ButtonPart> & {
  variant?: ButtonVariant
  size?: ButtonSize
} & SpeedProps) {
  return (
    <Speed speed={speed}>
      <ButtonPart
        data-variant={variant}
        data-size={size}
        className={cn(
          "group/button relative inline-flex shrink-0 cursor-pointer items-center justify-center leading-none font-medium whitespace-nowrap outline-none select-none",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "data-disabled:cursor-not-allowed data-disabled:opacity-50 data-pending:cursor-progress",
          /* UI SDK's convention for content that belongs to one state only. */
          "[&:not([data-pending])_[data-show=pending]]:hidden [&[data-pending]_[data-show=idle]]:hidden",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    </Speed>
  )
}

/* Holds a leading icon. While the button is pending it rises out with the label,
   and the primitive's spinner takes the middle. */
function ButtonIcon({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="button-icon"
      aria-hidden
      className={cn("inline-grid shrink-0 place-items-center", className)}
      {...props}
    />
  )
}

export { Button, ButtonArrow, ButtonIcon }
