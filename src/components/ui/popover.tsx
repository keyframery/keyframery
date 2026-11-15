"use client"

/* Styled popover: the animated primitive plus the Keyframery look. */

import {
  Popover as PopoverRoot,
  PopoverArrow as PopoverArrowPart,
  PopoverClose as PopoverClosePart,
  PopoverContent as PopoverContentPart,
  PopoverDescription as PopoverDescriptionPart,
  PopoverShortcut as PopoverShortcutPart,
  PopoverTitle as PopoverTitlePart,
  PopoverTrigger as PopoverTriggerPart,
} from "@/components/primitives/popover"
import * as React from "react"

import { cn } from "@/lib/utils"

const keyBase = cn(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 leading-none font-medium whitespace-nowrap outline-none select-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
  /* The primitive presses the key; colour and shadow ride the same 200ms pop. */
  "transition-[color,background-color,box-shadow,opacity,scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop",
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  "data-disabled:cursor-not-allowed data-disabled:opacity-50 data-pending:cursor-progress data-pending:opacity-70",
  "motion-reduce:transition-none!",
)

const keySurface = cn(
  "bg-background text-foreground dark:bg-accent",
  "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)]",
  "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
  "not-data-disabled:hover:bg-[color-mix(in_oklab,var(--background),var(--foreground)_3%)]",
  "dark:not-data-disabled:hover:bg-[color-mix(in_oklab,var(--accent),var(--foreground)_7%)]",
  "not-data-disabled:hover:shadow-[0_0_0_1px_rgb(0_0_0/0.1),0_1px_1px_rgb(0_0_0/0.05),0_4px_8px_-2px_rgb(0_0_0/0.12)]",
  "dark:not-data-disabled:hover:shadow-[0_0_0_1px_rgb(255_255_255/0.12),inset_0_1px_0_rgb(255_255_255/0.1),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
  "not-data-disabled:active:shadow-[0_0_0_1px_rgb(0_0_0/0.1),0_1px_1px_rgb(0_0_0/0.04),0_1px_2px_-1px_rgb(0_0_0/0.06)]",
  "dark:not-data-disabled:active:shadow-[0_0_0_1px_rgb(255_255_255/0.09),inset_0_1px_0_rgb(255_255_255/0.04),0_1px_2px_-1px_rgb(0_0_0/0.6)]",
)

/* The sheet. The primitive unfolds it out of its trigger and cascades its rows in. */
const sheet = cn(
  "m-0 max-h-(--available-height) w-72 max-w-[calc(100vw-16px)] overflow-visible border-0 p-4 outline-none",
  "rounded-[14px] bg-popover text-popover-foreground",
  "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_6px_-2px_rgb(0_0_0/0.08),0_12px_32px_-8px_rgb(0_0_0/0.18)]",
  "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_12px_32px_-8px_rgb(0_0_0/0.7)]",
)

function Popover(props: React.ComponentProps<typeof PopoverRoot>) {
  return <PopoverRoot {...props} />
}

/* A key by default; it stays lit while its popover is open. Pass `render` for your own button.
   An svg marked `data-slot="popover-chevron"` inside it turns while open. */
function PopoverTrigger({
  className,
  ...props
}: React.ComponentProps<typeof PopoverTriggerPart>) {
  return (
    <PopoverTriggerPart
      className={cn(
        "group/popover-trigger",
        !props.render && [
          keyBase,
          keySurface,
          "h-8 rounded-[9px] px-3 text-[13px] [&_svg]:size-4",
          "data-open:bg-[color-mix(in_oklab,var(--background),var(--foreground)_3%)] dark:data-open:bg-[color-mix(in_oklab,var(--accent),var(--foreground)_7%)]",
        ],
        props.render && "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "[&_[data-slot=popover-chevron]]:text-muted-foreground [&_[data-slot=popover-chevron]]:transition-transform [&_[data-slot=popover-chevron]]:duration-[calc(380ms*var(--kf-speed,1))] [&_[data-slot=popover-chevron]]:ease-spring",
        "data-open:[&_[data-slot=popover-chevron]]:rotate-180 motion-reduce:[&_[data-slot=popover-chevron]]:transition-none",
        className,
      )}
      {...props}
    />
  )
}

function PopoverContent<Payload = unknown>({
  className,
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof PopoverContentPart<Payload>>) {
  return (
    <PopoverContentPart<Payload>
      sideOffset={sideOffset}
      className={cn(sheet, className)}
      {...props}
    />
  )
}

/* A small point toward the trigger, drawn with the sheet's own fill and hairline. */
function PopoverArrow({
  className,
  ...props
}: React.ComponentProps<typeof PopoverArrowPart>) {
  return (
    <PopoverArrowPart
      className={cn(
        "pointer-events-none h-[7px] w-3.5 text-popover",
        "data-[side=bottom]:bottom-full data-[side=top]:top-full",
        "data-[side=left]:left-full data-[side=left]:h-3.5 data-[side=left]:w-[7px] data-[side=right]:right-full data-[side=right]:h-3.5 data-[side=right]:w-[7px]",
        "[&>svg]:absolute [&>svg]:top-1/2 [&>svg]:left-1/2 [&>svg]:h-[7px] [&>svg]:w-3.5 [&>svg]:-translate-1/2",
        "data-[side=top]:[&>svg]:rotate-180 data-[side=left]:[&>svg]:rotate-90 data-[side=right]:[&>svg]:-rotate-90",
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
    </PopoverArrowPart>
  )
}

function PopoverTitle({
  className,
  ...props
}: React.ComponentProps<typeof PopoverTitlePart>) {
  return (
    <PopoverTitlePart
      className={cn("text-[14px] leading-5 font-semibold tracking-tight", className)}
      {...props}
    />
  )
}

function PopoverDescription({
  className,
  ...props
}: React.ComponentProps<typeof PopoverDescriptionPart>) {
  return (
    <PopoverDescriptionPart
      className={cn("text-[12px] leading-4 text-muted-foreground", className)}
      {...props}
    />
  )
}

/* A key. Pass `render` for a button of your own. */
function PopoverClose({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof PopoverClosePart> & { variant?: "default" | "primary" }) {
  return (
    <PopoverClosePart
      data-variant={variant}
      className={cn(
        !props.render && [
          keyBase,
          "h-8 rounded-[9px] px-3 text-[13px] [&_svg]:size-4",
          variant === "default" && keySurface,
          variant === "primary" && [
            "bg-primary text-primary-foreground",
            "shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.25)]",
            "dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.7),0_1px_2px_rgb(0_0_0/0.5)]",
            "not-data-disabled:hover:bg-[color-mix(in_oklab,var(--primary),var(--background)_14%)]",
            "not-data-disabled:active:shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_0_1px_rgb(0_0_0/0.3)]",
          ],
        ],
        props.render && "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
      {...props}
    />
  )
}

function PopoverShortcut({
  className,
  ...props
}: React.ComponentProps<typeof PopoverShortcutPart>) {
  return (
    <PopoverShortcutPart
      className={cn(
        "ms-1 text-[12px] leading-none tracking-[0.04em] text-muted-foreground tabular-nums",
        className,
      )}
      {...props}
    />
  )
}

export {
  Popover,
  PopoverArrow,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverShortcut,
  PopoverTitle,
  PopoverTrigger,
}
