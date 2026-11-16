"use client"

/* Styled toggle: the animated primitive plus the Keyframery look. */

import * as React from "react"

import {
  Toggle as TogglePrimitive,
  ToggleGroup as ToggleGroupPrimitive,
  ToggleIcon as ToggleIconPrimitive,
} from "@/components/primitives/toggle"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

type ToggleSize = "sm" | "md" | "icon-sm" | "icon"

const sizes: Record<ToggleSize, string> = {
  sm: "h-7 gap-1.5 rounded-[8px] px-2.5 text-[12px] [&_svg]:size-3.5",
  md: "h-8 gap-1.5 rounded-[9px] px-3 text-[13px] [&_svg]:size-4",
  "icon-sm": "size-7 rounded-[8px] [&_svg]:size-3.5",
  icon: "size-8 rounded-[9px] [&_svg]:size-4",
}

/* The pressed surface is the primitive's `before:` layer, which pops in.
   On its own, a toggle sits flat on the page and sinks into a small well while pressed.
   Inside a group (which gives its toggles data-orientation), the group is the well and
   the pressed toggles rise out of it as keys. */
function Toggle({
  speed,
  className,
  size = "md",
  ...props
}: React.ComponentProps<typeof TogglePrimitive> & { size?: ToggleSize } & SpeedProps) {
  return (
    <Speed speed={speed}>
      <TogglePrimitive
        data-size={size}
        className={cn(
          "inline-flex shrink-0 cursor-pointer items-center justify-center leading-none font-medium whitespace-nowrap text-muted-foreground outline-none select-none",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0",
          "transition-[color,background-color,scale] motion-reduce:transition-none!",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "not-data-disabled:hover:text-foreground data-pressed:text-foreground",
          "data-disabled:cursor-not-allowed data-disabled:opacity-45",
          /* Alone: flat, then sunk. */
          "not-data-orientation:not-data-disabled:not-data-pressed:hover:bg-foreground/[0.03] dark:not-data-orientation:not-data-disabled:not-data-pressed:hover:bg-foreground/[0.035]",
          "not-data-orientation:before:bg-muted",
          "not-data-orientation:before:shadow-[inset_0_1px_2px_rgb(0_0_0/0.13),inset_0_0_0_1px_rgb(0_0_0/0.07)]",
          "dark:not-data-orientation:before:shadow-[inset_0_1px_2px_rgb(0_0_0/0.55),inset_0_0_0_1px_rgb(255_255_255/0.05)]",
          /* In a group: keys rising out of the well. The hover highlight glides (group). */
          "data-orientation:focus-visible:ring-offset-muted",
          "data-orientation:before:bg-background",
          "data-orientation:before:shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)]",
          "dark:data-orientation:before:bg-accent dark:data-orientation:before:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
          sizes[size],
          className as string,
        )}
        {...props}
      />
    </Speed>
  )
}

function ToggleIcon({ className, ...props }: React.ComponentProps<typeof ToggleIconPrimitive>) {
  return (
    <ToggleIconPrimitive
      className={cn("inline-grid shrink-0 place-items-center data-mirror:rtl:-scale-x-100", className as string)}
      {...props}
    />
  )
}

/* The well. */
function ToggleGroup({ speed, className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <ToggleGroupPrimitive
        className={cn(
          "inline-flex w-fit items-center gap-0.5 rounded-[12px] bg-muted p-1",
          "shadow-[inset_0_1px_2px_rgb(0_0_0/0.07),inset_0_0_0_1px_rgb(0_0_0/0.035)]",
          "dark:shadow-[inset_0_1px_2px_rgb(0_0_0/0.5),inset_0_0_0_1px_rgb(255_255_255/0.04)]",
          "data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
          "data-disabled:opacity-60",
          className as string,
        )}
        {...props}
      />
    </Speed>
  )
}

export { Toggle, ToggleGroup, ToggleIcon }
