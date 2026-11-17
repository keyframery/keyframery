"use client"

export * from "@/components/primitives/alert"

/* Theming variables (set on a part or ancestor; absent values preserve the theme):
   --alert-face: Alert surface; default: bg-card.
   --alert-ink: Alert text; default: text-card-foreground.
   --alert-muted: Description; default: text-muted-foreground.
   --alert-radius: Corners; default: rounded-[14px].
   --alert-font: Body size; default: text-[13px].
   --alert-gap: Content gap; default: gap-y-1.
   --alert-inset-x: Side padding; default: px-4.
   --alert-inset-y: Vertical padding; default: py-3.5.
*/

/* Styled alert: the animated primitive plus the Keyframery look. A quiet card with a hairline; the
   icon sits in a small tile of its own, tinted by the variant; the close button is a ghost key in
   the top corner. */

import * as React from "react"

import {
  Alert as AlertPrimitive,
  AlertClose as AlertClosePrimitive,
  AlertDescription as AlertDescriptionPrimitive,
  AlertTitle as AlertTitlePrimitive,
} from "@/components/primitives/alert"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* `className` may be a string or a function of the part's state: keep both working. */
function withClass<C>(className: C, ...base: string[]): C {
  return (typeof className === "function"
    ? (state: unknown) => cn(...base, (className as (state: unknown) => string | undefined)(state))
    : cn(...base, className as string | undefined)) as C
}

function Alert({ speed, className, ...props }: React.ComponentProps<typeof AlertPrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <AlertPrimitive
        className={withClass(className, "relative grid w-full grid-cols-[0_1fr] items-start gap-y-[var(--alert-gap,0.25rem)] rounded-[var(--alert-radius,14px)] bg-[var(--alert-face,var(--card))] px-[var(--alert-inset-x,1rem)] py-[var(--alert-inset-y,0.875rem)] text-[length:var(--alert-font,13px)] text-[color:var(--alert-ink,var(--card-foreground))]",
          "has-[>svg]:grid-cols-[28px_1fr] has-[>svg]:gap-x-3 has-[>[data-slot=alert-close]]:pr-12",
          "shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_1px_2px_rgb(0_0_0/0.04),0_4px_12px_-6px_rgb(0_0_0/0.08)]",
          "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_4px_12px_-6px_rgb(0_0_0/0.6)]",
          /* The icon tile: the svg itself, padded, with a tinted face. */
          "[&>svg]:row-span-2 [&>svg]:box-content [&>svg]:size-4 [&>svg]:rounded-[8px] [&>svg]:bg-muted [&>svg]:p-1.5 [&>svg]:text-foreground",
          "data-[variant=destructive]:[&>svg]:bg-destructive/10 data-[variant=destructive]:[&>svg]:text-destructive",
          "dark:data-[variant=destructive]:[&>svg]:bg-destructive/20",
          "data-[variant=destructive]:shadow-[0_0_0_1px_color-mix(in_oklch,var(--destructive)_22%,transparent),0_1px_2px_rgb(0_0_0/0.04),0_4px_12px_-6px_rgb(0_0_0/0.08)]",
          "dark:data-[variant=destructive]:shadow-[0_0_0_1px_color-mix(in_oklch,var(--destructive)_35%,transparent),0_4px_12px_-6px_rgb(0_0_0/0.6)]")}
        {...props}
      />
    </Speed>
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<typeof AlertTitlePrimitive>) {
  return (
    <AlertTitlePrimitive
      className={withClass(className, "col-start-2 pt-[5px] text-[13.5px] leading-[18px] font-semibold tracking-tight",
        "group-data-[variant=destructive]/alert:text-destructive")}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<typeof AlertDescriptionPrimitive>) {
  return (
    <AlertDescriptionPrimitive
      className={withClass(className, "col-start-2 grid justify-items-start gap-1.5 text-[length:var(--alert-font,13px)] leading-[1.5] text-[color:var(--alert-muted,var(--muted-foreground))] [&_p]:leading-[1.5]")}
      {...props}
    />
  )
}

function AlertClose({ className, children, ...props }: React.ComponentProps<typeof AlertClosePrimitive>) {
  return (
    <AlertClosePrimitive
      aria-label="Dismiss"
      className={withClass(className, "absolute top-3 right-3 inline-flex size-7 cursor-pointer items-center justify-center rounded-[8px] text-[color:var(--alert-muted,var(--muted-foreground))] outline-none",
        "hover:bg-foreground/[0.05] hover:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
        "[&_svg]:size-4")}
      {...props}
    >
      {children ?? (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      )}
    </AlertClosePrimitive>
  )
}

export { Alert, AlertClose, AlertDescription, AlertTitle }
