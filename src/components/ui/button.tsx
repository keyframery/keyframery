"use client"

export * from "@/components/primitives/button"

/* Theming: set on a part or its ancestor; unset variables preserve the original theme.
   --button-face: Variant key surface and hover mix (default: --background (dark --accent), --primary; ghost transparent).
   --button-ink: Variant label and icons (default: --foreground / --primary-foreground / --destructive).
   --button-radius: Corners by size (default: 8px / 9px / 10px).
   --button-height: Height and icon width by size (default: 1.75rem / 2rem / 2.25rem).
   --button-font: Label size by size (default: 12px / 13px / 14px).
 */

/* Styled button: the animated primitive plus the Keyframery look. */

import * as React from "react"

import { ButtonArrow, Button as ButtonPart } from "@/components/primitives/button"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

type ButtonVariant = "default" | "primary" | "ghost" | "destructive"
type ButtonSize = "sm" | "md" | "lg" | "icon" | "icon-sm" | "icon-lg"

/* The white key. Shared by the default and destructive variants. */
const key = [
  "bg-[var(--button-face,var(--background))] dark:bg-[var(--button-face,var(--accent))]",
  "shadow-[inset_0_1px_0_rgb(255_255_255/0.45),inset_0_-1px_0_rgb(0_0_0/0.05),0_0_0_1px_rgb(0_0_0/0.06),0_-1px_2px_rgb(0_0_0/0.025),0_3px_6px_-2px_rgb(0_0_0/0.1)]",
  "dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.08),inset_0_-1px_0_rgb(0_0_0/0.2),0_0_0_1px_rgb(255_255_255/0.07),0_-1px_2px_rgb(0_0_0/0.1),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
  "not-data-disabled:hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.5),inset_0_-1px_0_rgb(0_0_0/0.06),0_0_0_1px_rgb(0_0_0/0.1),0_-1px_2px_rgb(0_0_0/0.03),0_4px_8px_-2px_rgb(0_0_0/0.12)]",
  "dark:not-data-disabled:hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.1),inset_0_-1px_0_rgb(0_0_0/0.2),0_0_0_1px_rgb(255_255_255/0.12),0_-1px_2px_rgb(0_0_0/0.1),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
  "not-data-disabled:not-data-pending:active:shadow-[inset_0_1px_0_rgb(255_255_255/0.2),inset_0_-1px_0_rgb(0_0_0/0.04),0_0_0_1px_rgb(0_0_0/0.1),0_-1px_1px_rgb(0_0_0/0.02),0_1px_2px_-1px_rgb(0_0_0/0.06)]",
  "dark:not-data-disabled:not-data-pending:active:shadow-[inset_0_1px_0_rgb(255_255_255/0.04),inset_0_-1px_0_rgb(0_0_0/0.14),0_0_0_1px_rgb(255_255_255/0.09),0_-1px_1px_rgb(0_0_0/0.08),0_1px_2px_-1px_rgb(0_0_0/0.6)]",
]

const variants: Record<ButtonVariant, (string | string[])[]> = {
  default: [
    key,
    "text-[color:var(--button-ink,var(--foreground))]",
    "not-data-disabled:hover:bg-[color-mix(in_oklab,var(--button-face,var(--background)),var(--foreground)_3%)]",
    "dark:not-data-disabled:hover:bg-[color-mix(in_oklab,var(--button-face,var(--accent)),var(--foreground)_7%)]",
  ],
  primary: [
    "bg-[var(--button-face,var(--primary))] text-[color:var(--button-ink,var(--primary-foreground))]",
    "shadow-[inset_0_1px_0_rgb(255_255_255/0.14),inset_0_-1px_0_rgb(0_0_0/0.12),0_-1px_2px_rgb(0_0_0/0.04),0_1px_2px_rgb(0_0_0/0.25)]",
    "dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.18),inset_0_-1px_0_rgb(0_0_0/0.1),0_-1px_2px_rgb(0_0_0/0.12),0_1px_2px_rgb(0_0_0/0.5)]",
    "not-data-disabled:hover:bg-[color-mix(in_oklab,var(--button-face,var(--primary)),var(--background)_10%)]",
    "not-data-disabled:hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.18),inset_0_-1px_0_rgb(0_0_0/0.12),0_-1px_2px_rgb(0_0_0/0.05),0_2px_5px_rgb(0_0_0/0.25)]",
    "dark:not-data-disabled:hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.22),inset_0_-1px_0_rgb(0_0_0/0.1),0_-1px_2px_rgb(0_0_0/0.12),0_2px_5px_rgb(0_0_0/0.5)]",
    "not-data-disabled:not-data-pending:active:shadow-[inset_0_1px_0_rgb(255_255_255/0.08),inset_0_-1px_0_rgb(0_0_0/0.08),0_-1px_1px_rgb(0_0_0/0.03),0_0_1px_rgb(0_0_0/0.3)]",
    "dark:not-data-disabled:not-data-pending:active:shadow-[inset_0_1px_0_rgb(255_255_255/0.1),inset_0_-1px_0_rgb(0_0_0/0.08),0_-1px_1px_rgb(0_0_0/0.08),0_0_1px_rgb(0_0_0/0.5)]",
  ],
  ghost: [
    "bg-[var(--button-face,transparent)] text-[color:var(--button-ink,var(--foreground))]",
    "shadow-[inset_0_1px_0_rgb(255_255_255/0.3),inset_0_-1px_0_rgb(0_0_0/0.04),0_-1px_2px_rgb(0_0_0/0.015),0_1px_2px_rgb(0_0_0/0.04)]",
    "dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.04),inset_0_-1px_0_rgb(0_0_0/0.1),0_-1px_2px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.12)]",
    "not-data-disabled:hover:bg-[var(--button-face,var(--accent))]",
    "not-data-disabled:not-data-pending:active:bg-[color-mix(in_oklab,var(--button-face,var(--accent)),var(--foreground)_6%)]",
  ],
  destructive: [
    key,
    "text-[color:var(--button-ink,var(--destructive))]",
    "not-data-disabled:hover:bg-[color-mix(in_oklab,var(--button-face,var(--background)),var(--destructive)_7%)]",
    "dark:not-data-disabled:hover:bg-[color-mix(in_oklab,var(--button-face,var(--accent)),var(--destructive)_14%)]",
  ],
}

const sizes: Record<ButtonSize, string> = {
  sm: "h-[var(--button-height,1.75rem)] gap-1.5 rounded-[var(--button-radius,8px)] px-2.5 text-[length:var(--button-font,12px)] [&_svg]:size-3.5",
  md: "h-[var(--button-height,2rem)] gap-1.5 rounded-[var(--button-radius,9px)] px-3 text-[length:var(--button-font,13px)] [&_svg]:size-4",
  lg: "h-[var(--button-height,2.25rem)] gap-2 rounded-[var(--button-radius,10px)] px-4 text-[length:var(--button-font,14px)] [&_svg]:size-4",
  "icon-sm": "size-[var(--button-height,1.75rem)] rounded-[var(--button-radius,8px)] [&_svg]:size-3.5",
  icon: "size-[var(--button-height,2rem)] rounded-[var(--button-radius,9px)] [&_svg]:size-4",
  "icon-lg": "size-[var(--button-height,2.25rem)] rounded-[var(--button-radius,10px)] [&_svg]:size-4",
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
        className={withClass(
          cn(
            "group/button relative inline-flex shrink-0 cursor-pointer items-center justify-center leading-none font-medium whitespace-nowrap outline-none select-none",
            "[&_svg]:pointer-events-none [&_svg]:shrink-0",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "data-disabled:cursor-not-allowed data-disabled:opacity-50 data-pending:cursor-progress",
            /* An image overlay leaves variant and consumer background colours independent. */
            "bg-[image:linear-gradient(to_bottom,rgb(255_255_255/0.12),rgb(0_0_0/0.045))] dark:bg-[image:linear-gradient(to_bottom,rgb(255_255_255/0.07),rgb(0_0_0/0.1))]",
            /* UI SDK's convention for content that belongs to one state only. */
            "[&:not([data-pending])_[data-show=pending]]:hidden [&[data-pending]_[data-show=idle]]:hidden",
            variants[variant],
            sizes[size],
          ),
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
