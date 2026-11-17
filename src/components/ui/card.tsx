"use client"

export * from "@/components/primitives/card"

/* Theming: set on a part or its ancestor; unset variables preserve the original theme.
   --card-face: Card surface (default: --card).
   --card-ink: Card text (default: --card-foreground).
   --card-muted: Description text (default: --muted-foreground).
   --card-radius: Card corners (default: 16px).
   --card-padding: Card and section padding (default: 1.25rem).
   --card-gap: Section gap (default: 1.25rem).
   --card-light: Pointer spotlight wash (default: currentColor 13%, transparent).
 */

/* Styled card: the animated primitive plus the Keyframery look. Same parts as shadcn/ui's card. */

import * as React from "react"

import {
  Card as CardPrimitive,
  CardAction as CardActionPrimitive,
  CardContent as CardContentPrimitive,
  CardDescription as CardDescriptionPrimitive,
  CardFooter as CardFooterPrimitive,
  CardHeader as CardHeaderPrimitive,
  CardTitle as CardTitlePrimitive,
} from "@/components/primitives/card"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* A class name that may be a function of the part's state, merged after ours. */
function withClass<S>(ours: string, theirs: string | ((state: S) => string | undefined) | undefined) {
  return typeof theirs === "function" ? (state: S) => cn(ours, theirs(state)) : cn(ours, theirs)
}

/* A sheet that sits on the page: hairline, a short contact shadow and a soft one below.
   An interactive card's shadow grows as it lifts and tightens again while pressed. */
const sheet = cn(
  "data-spotlight:before:bg-[radial-gradient(300px_circle_at_var(--kf-x,50%)_var(--kf-y,0%),var(--card-light,var(--kf-spotlight,color-mix(in_oklch,currentColor_13%,transparent))),transparent_70%)]",
  "flex flex-col gap-[var(--card-gap,1.25rem)] rounded-[var(--card-radius,16px)] bg-[var(--card-face,var(--card))] py-[var(--card-padding,1.25rem)] text-[color:var(--card-ink,var(--card-foreground))]",
  "shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_1px_2px_rgb(0_0_0/0.04),0_4px_12px_-6px_rgb(0_0_0/0.08)]",
  "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_1px_2px_rgb(0_0_0/0.4),0_6px_16px_-6px_rgb(0_0_0/0.6)]",
  "data-interactive:cursor-pointer outline-none",
  "[&[data-interactive]:is(:hover,[data-hovered])]:shadow-[0_0_0_1px_rgb(0_0_0/0.09),0_2px_4px_rgb(0_0_0/0.05),0_16px_32px_-12px_rgb(0_0_0/0.24)]",
  "dark:[&[data-interactive]:is(:hover,[data-hovered])]:shadow-[0_0_0_1px_rgb(255_255_255/0.12),0_2px_4px_rgb(0_0_0/0.4),0_18px_36px_-12px_rgb(0_0_0/0.8)]",
  "[&[data-interactive]:is(:hover,[data-hovered]):is(:active,[data-pressed])]:shadow-[0_0_0_1px_rgb(0_0_0/0.1),0_1px_2px_rgb(0_0_0/0.06),0_4px_10px_-6px_rgb(0_0_0/0.14)]",
  "dark:[&[data-interactive]:is(:hover,[data-hovered]):is(:active,[data-pressed])]:shadow-[0_0_0_1px_rgb(255_255_255/0.12),0_1px_2px_rgb(0_0_0/0.5),0_4px_10px_-6px_rgb(0_0_0/0.7)]",
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
)

function Card({ speed, className, ...props }: React.ComponentProps<typeof CardPrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <CardPrimitive className={withClass(sheet, className)} {...props} />
    </Speed>
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<typeof CardHeaderPrimitive>) {
  return (
    <CardHeaderPrimitive
      className={withClass(
        "grid auto-rows-min grid-rows-[auto_auto] items-start gap-1 px-[var(--card-padding,1.25rem)] has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        className,
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<typeof CardTitlePrimitive>) {
  return <CardTitlePrimitive className={withClass("text-[15px] leading-5 font-semibold tracking-tight", className)} {...props} />
}

function CardDescription({ className, ...props }: React.ComponentProps<typeof CardDescriptionPrimitive>) {
  return <CardDescriptionPrimitive className={withClass("text-[13px] leading-5 text-[color:var(--card-muted,var(--muted-foreground))]", className)} {...props} />
}

function CardAction({ className, ...props }: React.ComponentProps<typeof CardActionPrimitive>) {
  return (
    <CardActionPrimitive
      className={withClass("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<typeof CardContentPrimitive>) {
  return <CardContentPrimitive className={withClass("px-[var(--card-padding,1.25rem)] text-[13px]", className)} {...props} />
}

function CardFooter({ className, ...props }: React.ComponentProps<typeof CardFooterPrimitive>) {
  return <CardFooterPrimitive className={withClass("flex items-center gap-2 px-[var(--card-padding,1.25rem)]", className)} {...props} />
}

export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
