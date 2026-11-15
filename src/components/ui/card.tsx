"use client"

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
import { cn } from "@/lib/utils"

/* A sheet that sits on the page: hairline, a short contact shadow and a soft one below.
   An interactive card's shadow grows as it lifts and tightens again while pressed. */
function Card({ className, ...props }: React.ComponentProps<typeof CardPrimitive>) {
  return (
    <CardPrimitive
      className={cn(
        "flex flex-col gap-5 rounded-[16px] bg-card py-5 text-card-foreground",
        "shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_1px_2px_rgb(0_0_0/0.04),0_4px_12px_-6px_rgb(0_0_0/0.08)]",
        "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_1px_2px_rgb(0_0_0/0.4),0_6px_16px_-6px_rgb(0_0_0/0.6)]",
        "data-interactive:cursor-pointer outline-none",
        "[&[data-interactive]:is(:hover,[data-hovered])]:shadow-[0_0_0_1px_rgb(0_0_0/0.09),0_2px_4px_rgb(0_0_0/0.05),0_16px_32px_-12px_rgb(0_0_0/0.24)]",
        "dark:[&[data-interactive]:is(:hover,[data-hovered])]:shadow-[0_0_0_1px_rgb(255_255_255/0.12),0_2px_4px_rgb(0_0_0/0.4),0_18px_36px_-12px_rgb(0_0_0/0.8)]",
        "[&[data-interactive]:is(:hover,[data-hovered]):is(:active,[data-pressed])]:shadow-[0_0_0_1px_rgb(0_0_0/0.1),0_1px_2px_rgb(0_0_0/0.06),0_4px_10px_-6px_rgb(0_0_0/0.14)]",
        "dark:[&[data-interactive]:is(:hover,[data-hovered]):is(:active,[data-pressed])]:shadow-[0_0_0_1px_rgb(255_255_255/0.12),0_1px_2px_rgb(0_0_0/0.5),0_4px_10px_-6px_rgb(0_0_0/0.7)]",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<typeof CardHeaderPrimitive>) {
  return (
    <CardHeaderPrimitive
      className={cn(
        "grid auto-rows-min grid-rows-[auto_auto] items-start gap-1 px-5",
        "has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        className,
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<typeof CardTitlePrimitive>) {
  return (
    <CardTitlePrimitive
      className={cn("text-[15px] leading-5 font-semibold tracking-tight", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<typeof CardDescriptionPrimitive>) {
  return (
    <CardDescriptionPrimitive
      className={cn("text-[13px] leading-5 text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<typeof CardActionPrimitive>) {
  return (
    <CardActionPrimitive
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<typeof CardContentPrimitive>) {
  return <CardContentPrimitive className={cn("px-5 text-[13px]", className)} {...props} />
}

function CardFooter({ className, ...props }: React.ComponentProps<typeof CardFooterPrimitive>) {
  return <CardFooterPrimitive className={cn("flex items-center gap-2 px-5", className)} {...props} />
}

export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
