"use client"

export * from "@/components/primitives/bubble"

/* Theming variables (set on a part or ancestor; absent values preserve the theme):
   --bubble-face: Incoming surface; default: bg-muted.
   --bubble-ink: Incoming text; default: text-foreground.
   --bubble-radius: Bubble corners; default: rounded-[18px].
   --bubble-font: Message size; default: text-[14px].
   --bubble-inset-x: Side padding; default: px-3.5.
   --bubble-inset-y: Vertical padding; default: py-2.
   --bubble-max-width: Bubble width; default: max-w-[80%].
*/

/* Styled chat bubbles: the animated primitive plus the Keyframery look. A soft 18px bubble whose
   corner toward the sender is tucked to 4px; your own are the primary colour, the other person's a
   quiet well. Reactions sit on the bubble's edge as a small key. */

import * as React from "react"

import {
  Bubble as BubblePrimitive,
  BubbleContent as BubbleContentPrimitive,
  BubbleGroup as BubbleGroupPrimitive,
  BubbleReactions as BubbleReactionsPrimitive,
} from "@/components/primitives/bubble"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* Each variant fills the content part; a bubble that is a button or a link darkens a touch on hover. */
const variants = [
  "data-[variant=default]:*:data-[slot=bubble-content]:bg-primary data-[variant=default]:*:data-[slot=bubble-content]:text-primary-foreground",
  "data-[variant=default]:*:data-[slot=bubble-content]:shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_1px_2px_rgb(0_0_0/0.12)]",
  "data-[variant=default]:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-[color-mix(in_oklab,var(--primary),var(--background)_10%)]",
  "data-[variant=secondary]:*:data-[slot=bubble-content]:bg-[var(--bubble-face,var(--message-face,var(--secondary)))] data-[variant=secondary]:*:data-[slot=bubble-content]:text-secondary-foreground",
  "data-[variant=secondary]:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-[color-mix(in_oklab,var(--secondary),var(--foreground)_5%)]",
  "data-[variant=muted]:*:data-[slot=bubble-content]:bg-[var(--bubble-face,var(--message-face,var(--muted)))] data-[variant=muted]:*:data-[slot=bubble-content]:text-[color:var(--bubble-ink,var(--foreground))]",
  "data-[variant=muted]:*:data-[slot=bubble-content]:shadow-[inset_0_0_0_1px_rgb(0_0_0/0.03)] dark:data-[variant=muted]:*:data-[slot=bubble-content]:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.04)]",
  "data-[variant=muted]:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-[color-mix(in_oklab,var(--muted),var(--foreground)_5%)]",
  "data-[variant=tinted]:*:data-[slot=bubble-content]:bg-[var(--bubble-face,var(--message-face,color-mix(in_oklab,var(--primary)_9%,var(--background))))] data-[variant=tinted]:*:data-[slot=bubble-content]:text-[color:var(--bubble-ink,var(--foreground))]",
  "dark:data-[variant=tinted]:*:data-[slot=bubble-content]:bg-[var(--bubble-face,var(--message-face,color-mix(in_oklab,var(--primary)_16%,var(--background))))]",
  "data-[variant=tinted]:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-[color-mix(in_oklab,var(--primary)_14%,var(--background))]",
  "data-[variant=outline]:*:data-[slot=bubble-content]:bg-[var(--bubble-face,var(--message-face,var(--background)))] data-[variant=outline]:*:data-[slot=bubble-content]:text-[color:var(--bubble-ink,var(--foreground))]",
  "data-[variant=outline]:*:data-[slot=bubble-content]:shadow-[0_0_0_1px_rgb(0_0_0/0.09),0_1px_2px_rgb(0_0_0/0.05)] dark:data-[variant=outline]:*:data-[slot=bubble-content]:shadow-[0_0_0_1px_rgb(255_255_255/0.1)]",
  "data-[variant=outline]:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-[var(--bubble-face,var(--message-face,var(--muted)))]",
  "data-[variant=ghost]:max-w-full data-[variant=ghost]:*:data-[slot=bubble-content]:rounded-none data-[variant=ghost]:*:data-[slot=bubble-content]:bg-transparent data-[variant=ghost]:*:data-[slot=bubble-content]:p-0",
  "data-[variant=destructive]:*:data-[slot=bubble-content]:bg-destructive/10 data-[variant=destructive]:*:data-[slot=bubble-content]:text-destructive dark:data-[variant=destructive]:*:data-[slot=bubble-content]:bg-destructive/20",
  "data-[variant=destructive]:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-destructive/15",
]

function BubbleGroup({ speed, className, ...props }: React.ComponentProps<typeof BubbleGroupPrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <BubbleGroupPrimitive
        className={withClass(
          cn(
            "flex min-w-0 flex-col gap-1",
            /* Bubbles from one sender share a run: the corners between them tuck in too. */
            "*:data-[align=start]:not-first:*:data-[slot=bubble-content]:rounded-ss-[4px] *:data-[align=start]:not-last:*:data-[slot=bubble-content]:rounded-es-[4px]",
            "*:data-[align=end]:not-first:*:data-[slot=bubble-content]:rounded-se-[4px] *:data-[align=end]:not-last:*:data-[slot=bubble-content]:rounded-ee-[4px]",
          ),
          className,
        )}
        {...props}
      />
    </Speed>
  )
}

function Bubble({ speed, className, ...props }: React.ComponentProps<typeof BubblePrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <BubblePrimitive
        className={withClass(
          cn(
            "relative flex w-fit max-w-[var(--bubble-max-width,80%)] min-w-0 flex-col gap-1",
            "data-[align=end]:self-end group-data-[align=end]/message:self-end",
            variants,
          ),
          className,
        )}
        {...props}
      />
    </Speed>
  )
}

function BubbleContent({ className, ...props }: React.ComponentProps<typeof BubbleContentPrimitive>) {
  return (
    <BubbleContentPrimitive
      className={withClass(
        cn(
          "w-fit max-w-full min-w-0 overflow-hidden rounded-[var(--bubble-radius,18px)] px-[var(--bubble-inset-x,0.875rem)] py-[var(--bubble-inset-y,0.5rem)] text-[length:var(--bubble-font,14px)] leading-[1.45] wrap-break-word",
          "group-data-[align=start]/bubble:rounded-es-[4px] group-data-[align=end]/bubble:self-end group-data-[align=end]/bubble:rounded-ee-[4px]",
          "[button&]:cursor-pointer [button&]:text-left [button&,a&]:outline-none",
          "[button&,a&]:focus-visible:ring-2 [button&,a&]:focus-visible:ring-ring [button&,a&]:focus-visible:ring-offset-2 [button&,a&]:focus-visible:ring-offset-background",
          "[button&,a&]:transition-[scale,background-color] [button&,a&]:duration-[calc(150ms*var(--kf-speed,1))]",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* A small key on the bubble's edge, ringed in the page colour so it cuts out of the bubble. On a
   surface that is not `background`, set `--bubble-cutout` to its colour. */
function BubbleReactions({ className, ...props }: React.ComponentProps<typeof BubbleReactionsPrimitive>) {
  return (
    <BubbleReactionsPrimitive
      className={withClass(
        cn(
          "absolute z-10 flex h-6 w-fit shrink-0 items-center justify-center gap-1 rounded-full bg-background px-1.5 text-[12px] leading-none tabular-nums",
          "shadow-[0_0_0_2px_var(--bubble-cutout,var(--background)),0_0_0_3px_rgb(0_0_0/0.06),0_2px_5px_-1px_rgb(0_0_0/0.12)]",
          "dark:bg-accent dark:shadow-[0_0_0_2px_var(--bubble-cutout,var(--background)),0_0_0_3px_rgb(255_255_255/0.07),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
          "data-[side=bottom]:bottom-0 data-[side=bottom]:translate-y-2/3 data-[side=top]:top-0 data-[side=top]:-translate-y-2/3",
          "data-[align=end]:end-2 data-[align=start]:start-2",
          "has-[button]:p-0",
        ),
        className,
      )}
      {...props}
    />
  )
}

export { Bubble, BubbleContent, BubbleGroup, BubbleReactions }
