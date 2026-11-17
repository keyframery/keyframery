"use client"

export * from "@/components/primitives/tooltip"

/* Styled tooltip: the animated primitive plus the Keyframery look. */

/* Theming: inherit these optional variables; unset values retain the original light/dark tokens.
   --tooltip-face: Tooltip surface and arrow (default: --foreground).
   --tooltip-ink: Tooltip text and shortcut tint (default: --background; 15% shortcut fill and 70% shortcut ink).
   --tooltip-radius: Tooltip corners (default: 8px).
   --tooltip-font: Tooltip text size (default: 12px).
   --tooltip-width: Tooltip maximum width (default: 16rem).
   --tooltip-gap: Label-to-shortcut gap (default: 0.5rem).
 */

import {
  Tooltip as TooltipRoot,
  TooltipArrow as TooltipArrowPart,
  TooltipContent as TooltipContentPart,
  TooltipShortcut as TooltipShortcutPart,
  TooltipTrigger as TooltipTriggerPart,
} from "@/components/primitives/tooltip"
import * as React from "react"

import { Speed, type SpeedProps, useSpeedStyle } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

function Tooltip({ speed, ...props }: React.ComponentProps<typeof TooltipRoot> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <TooltipRoot {...props} />
    </Speed>
  )
}

/* No look of its own: the trigger is usually your button, passed with `render`, or plain
   content. It only adds the focus ring. */
function TooltipTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TooltipTriggerPart>) {
  return (
    <TooltipTriggerPart
      className={withClass("outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background", className)}
      {...props}
    />
  )
}

/* The one dark sheet. The primitive pops it out of its trigger, and skips that when it opens
   at once because a neighbour was just showing. */
function TooltipContent<Payload = unknown>({
  className,
  sideOffset = 6,
  style,
  ...props
}: React.ComponentProps<typeof TooltipContentPart<Payload>>) {
  return (
    <TooltipContentPart<Payload>
      sideOffset={sideOffset}
      className={withClass(
        cn(
          "m-0 flex max-w-[var(--tooltip-width,16rem)] items-center gap-[var(--tooltip-gap,0.5rem)] border-0 px-2 py-1.5 text-[length:var(--tooltip-font,12px)] leading-4 font-medium text-balance outline-none",
          "rounded-[var(--tooltip-radius,8px)] bg-[var(--tooltip-face,var(--foreground))] text-[color:var(--tooltip-ink,var(--background))]",
          "shadow-[0_1px_2px_rgb(0_0_0/0.12),0_6px_16px_-4px_rgb(0_0_0/0.24)]",
          "dark:shadow-[0_0_0_1px_rgb(0_0_0/0.4),0_6px_16px_-4px_rgb(0_0_0/0.7)]",
        ),
        className,
      )}
      {...props} style={useSpeedStyle(style)}
    />
  )
}

/* A small point toward the trigger, in the tooltip's own colour. */
function TooltipArrow({
  className,
  ...props
}: React.ComponentProps<typeof TooltipArrowPart>) {
  return (
    <TooltipArrowPart
      className={withClass(
        cn(
          "pointer-events-none h-[5px] w-2.5 text-[color:var(--tooltip-face,var(--foreground))]",
          "data-[side=bottom]:bottom-full data-[side=top]:top-full",
          "data-[side=left]:left-full data-[side=left]:h-2.5 data-[side=left]:w-[5px] data-[side=right]:right-full data-[side=right]:h-2.5 data-[side=right]:w-[5px]",
          "[&>svg]:absolute [&>svg]:top-1/2 [&>svg]:left-1/2 [&>svg]:h-[5px] [&>svg]:w-2.5 [&>svg]:-translate-1/2",
          "data-[side=top]:[&>svg]:rotate-180 data-[side=left]:[&>svg]:rotate-90 data-[side=right]:[&>svg]:-rotate-90",
        ),
        className,
      )}
      {...props}
    >
      <svg viewBox="0 0 10 5" aria-hidden className="overflow-visible">
        <path d="M0 5.5 L3.9 1 Q5 -0.1 6.1 1 L10 5.5 Z" fill="currentColor" />
      </svg>
    </TooltipArrowPart>
  )
}

/* The keys, quieter than the label, in a small inset. */
function TooltipShortcut({
  className,
  ...props
}: React.ComponentProps<typeof TooltipShortcutPart>) {
  return (
    <TooltipShortcutPart
      className={withClass("-my-0.5 -me-0.5 rounded-[5px] bg-[color-mix(in_oklab,var(--tooltip-ink,var(--background))_15%,transparent)] px-1 py-0.5 text-[11px] leading-[14px] font-medium tracking-[0.04em] text-[color:color-mix(in_oklab,var(--tooltip-ink,var(--background))_70%,transparent)] tabular-nums", className)}
      {...props}
    />
  )
}

export { Tooltip, TooltipArrow, TooltipContent, TooltipShortcut, TooltipTrigger }

/* UI SDK's helpers for this component, passed through. */
export { createTooltipController } from "@/components/primitives/tooltip"
