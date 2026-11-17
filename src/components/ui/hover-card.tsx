"use client"

export * from "@/components/primitives/hover-card"

/* Theming (inherited; each default preserves the original light/dark appearance):
   --hover-card-surface: Card and arrow surface (default: --popover)
   --hover-card-ink: Card text (default: --popover-foreground)
   --hover-card-link: Trigger text (default: --foreground)
   --hover-card-width: Card width (default: 18rem)
   --hover-card-radius: Card corners (default: 14px)
   --hover-card-padding: Card padding (default: 1rem)
*/

/* Styled hover card: the animated primitive plus the Keyframery look. */

import {
  HoverCard as HoverCardRoot,
  HoverCardArrow as HoverCardArrowPart,
  HoverCardContent as HoverCardContentPart,
  HoverCardTrigger as HoverCardTriggerPart,
} from "@/components/primitives/hover-card"
import * as React from "react"

import { Speed, type SpeedProps, useSpeedStyle } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* Keeps UI SDK's default delays (calc(600ms*var(--kf-speed,1)) to open, 300ms to close), so moving the pointer
   across a page of links never flashes a card at every stop. */
function HoverCard({ speed, ...props }: React.ComponentProps<typeof HoverCardRoot> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <HoverCardRoot {...props} />
    </Speed>
  )
}

/* A link. Its underline firms up on hover and stays firm while its card is showing. */
function HoverCardTrigger({
  className,
  ...props
}: React.ComponentProps<typeof HoverCardTriggerPart>) {
  return (
    <HoverCardTriggerPart
      className={withClass(
        cn(
          "cursor-pointer rounded-[3px] font-medium text-[color:var(--hover-card-link,var(--foreground))] underline decoration-foreground/25 decoration-1 underline-offset-[3px] outline-none",
          "transition-[text-decoration-color,background-color] duration-[calc(150ms*var(--kf-speed,1))] ease-house",
          "hover:decoration-foreground/70 data-open:decoration-foreground/70",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "motion-reduce:transition-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* The card. The primitive unfolds it out of the link and cascades its sections in. */
function HoverCardContent<Payload = unknown>({
  className,
  sideOffset = 8,
  style,
  ...props
}: React.ComponentProps<typeof HoverCardContentPart<Payload>>) {
  return (
    <HoverCardContentPart<Payload>
      sideOffset={sideOffset}
      className={withClass(
        cn(
          "m-0 w-[var(--hover-card-width,18rem)] max-w-[calc(100vw-16px)] border-0 p-[var(--hover-card-padding,1rem)] text-[13px] outline-none",
          "rounded-[var(--hover-card-radius,14px)] bg-[var(--hover-card-surface,var(--popover))] text-[color:var(--hover-card-ink,var(--popover-foreground))]",
          "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_6px_-2px_rgb(0_0_0/0.08),0_12px_32px_-8px_rgb(0_0_0/0.18)]",
          "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_12px_32px_-8px_rgb(0_0_0/0.7)]",
        ),
        className,
      )}
      {...props} style={useSpeedStyle(style)}
    />
  )
}

/* A small point toward the link, drawn with the card's own fill and hairline. */
function HoverCardArrow({
  className,
  ...props
}: React.ComponentProps<typeof HoverCardArrowPart>) {
  return (
    <HoverCardArrowPart
      className={withClass(
        cn(
          "pointer-events-none h-[7px] w-3.5 text-[color:var(--hover-card-surface,var(--popover))]",
          "data-[side=bottom]:bottom-full data-[side=top]:top-full",
          "data-[side=left]:left-full data-[side=left]:h-3.5 data-[side=left]:w-[7px] data-[side=right]:right-full data-[side=right]:h-3.5 data-[side=right]:w-[7px]",
          "[&>svg]:absolute [&>svg]:top-1/2 [&>svg]:left-1/2 [&>svg]:h-[7px] [&>svg]:w-3.5 [&>svg]:-translate-1/2",
          "data-[side=top]:[&>svg]:rotate-180 data-[side=left]:[&>svg]:rotate-90 data-[side=right]:[&>svg]:-rotate-90",
        ),
        className,
      )}
      {...props}
    >
      <svg viewBox="0 0 14 7" aria-hidden className="overflow-visible">
        <path
          d="M0 7.5 L5.6 1.2 Q7 -0.3 8.4 1.2 L14 7.5"
          fill="currentColor"
          className="stroke-black/[0.06] dark:stroke-white/[0.08]"
          strokeWidth="1"
        />
      </svg>
    </HoverCardArrowPart>
  )
}

export { HoverCard, HoverCardArrow, HoverCardContent, HoverCardTrigger }

/* UI SDK's helpers for this component, passed through. */
export { createHoverCardController } from "@/components/primitives/hover-card"
