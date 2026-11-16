"use client"

/* Styled tooltip: the animated primitive plus the Keyframery look. */

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
      className={cn(
        "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
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
      className={cn(
        "m-0 flex max-w-64 items-center gap-2 border-0 px-2 py-1.5 text-[12px] leading-4 font-medium text-balance outline-none",
        "rounded-[8px] bg-foreground text-background",
        "shadow-[0_1px_2px_rgb(0_0_0/0.12),0_6px_16px_-4px_rgb(0_0_0/0.24)]",
        "dark:shadow-[0_0_0_1px_rgb(0_0_0/0.4),0_6px_16px_-4px_rgb(0_0_0/0.7)]",
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
      className={cn(
        "pointer-events-none h-[5px] w-2.5 text-foreground",
        "data-[side=bottom]:bottom-full data-[side=top]:top-full",
        "data-[side=left]:left-full data-[side=left]:h-2.5 data-[side=left]:w-[5px] data-[side=right]:right-full data-[side=right]:h-2.5 data-[side=right]:w-[5px]",
        "[&>svg]:absolute [&>svg]:top-1/2 [&>svg]:left-1/2 [&>svg]:h-[5px] [&>svg]:w-2.5 [&>svg]:-translate-1/2",
        "data-[side=top]:[&>svg]:rotate-180 data-[side=left]:[&>svg]:rotate-90 data-[side=right]:[&>svg]:-rotate-90",
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
      className={cn(
        "-my-0.5 -me-0.5 rounded-[5px] bg-background/15 px-1 py-0.5 text-[11px] leading-[14px] font-medium tracking-[0.04em] text-background/70 tabular-nums",
        className,
      )}
      {...props}
    />
  )
}

export { Tooltip, TooltipArrow, TooltipContent, TooltipShortcut, TooltipTrigger }
