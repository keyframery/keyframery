"use client"

/* Styled segmented control: the animated primitive plus the Keyframery look. */

import * as React from "react"

import {
  SegmentedControl as SegmentedControlRoot,
  SegmentedControlIndicator as SegmentedControlIndicatorPrimitive,
  SegmentedControlItem as SegmentedControlItemPrimitive,
} from "@/components/primitives/segmented-control"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* One box shared by the real item and its copy inside the key, so both lay out identically. */
const itemBox =
  "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-[9px] px-3 text-[13px] leading-none font-medium whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0"

const rowLayout = "flex items-stretch gap-0.5 p-1 data-[orientation=vertical]:flex-col"

/* The control renders its own key (the indicator), like the tabs list does, so don't add a
   SegmentedControlIndicator inside it. */
function SegmentedControl({
  speed,
  className,
  children,
  orientation,
  ...props
}: Omit<React.ComponentProps<typeof SegmentedControlRoot>, "children"> & {
  children?: React.ReactNode
} & SpeedProps) {
  return (
    <Speed speed={speed}>
      <SegmentedControlRoot
        orientation={orientation}
        className={cn(
          rowLayout,
          "inline-flex w-fit rounded-[12px] bg-muted outline-none",
          "shadow-[inset_0_1px_2px_rgb(0_0_0/0.07),inset_0_0_0_1px_rgb(0_0_0/0.035)]",
          "dark:shadow-[inset_0_1px_2px_rgb(0_0_0/0.5),inset_0_0_0_1px_rgb(255_255_255/0.04)]",
          "data-disabled:opacity-60",
          className as string,
        )}
        {...props}
      >
        {children}
        {/* The key: a raised surface that stretches toward the item you pick. */}
        <SegmentedControlIndicator>
          {/* A copy of the labels in the selected colour, clipped to the key. It is offset by the
              key's own moving edges, so it stays still while the key passes over it. */}
          <span className="absolute inset-0 overflow-hidden rounded-[inherit]">
            <span
              data-orientation={orientation ?? "horizontal"}
              className={cn(
                rowLayout,
                "absolute text-foreground",
                "top-[calc(min(var(--kf-ta),var(--kf-tb))*-1)] left-[calc(min(var(--kf-la),var(--kf-lb))*-1)]",
                "h-[calc(var(--segmented-control-indicator-top,0px)+var(--segmented-control-indicator-height,0px)+var(--segmented-control-indicator-bottom,0px))]",
                "w-[calc(var(--segmented-control-indicator-left,0px)+var(--segmented-control-indicator-width,0px)+var(--segmented-control-indicator-right,0px))]",
              )}
            >
              {React.Children.map(children, (child) =>
                React.isValidElement<{ children?: React.ReactNode }>(child) ? (
                  <span className={itemBox}>{child.props.children}</span>
                ) : null,
              )}
            </span>
          </span>
        </SegmentedControlIndicator>
      </SegmentedControlRoot>
    </Speed>
  )
}

function SegmentedControlIndicator({
  className,
  ...props
}: React.ComponentProps<typeof SegmentedControlIndicatorPrimitive>) {
  return (
    <SegmentedControlIndicatorPrimitive
      aria-hidden
      className={cn(
        "z-10 rounded-[9px] bg-background",
        "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)]",
        "dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
        className as string,
      )}
      {...props}
    />
  )
}

function SegmentedControlItem({
  className,
  ...props
}: React.ComponentProps<typeof SegmentedControlItemPrimitive>) {
  return (
    <SegmentedControlItemPrimitive
      className={cn(
        itemBox,
        "relative cursor-pointer text-muted-foreground outline-none select-none",
        "transition-[color,background-color,scale] motion-reduce:transition-none! hover:bg-foreground/[0.045] hover:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-muted",
        "data-disabled:pointer-events-none data-disabled:opacity-40 data-readonly:cursor-default",
        className as string,
      )}
      {...props}
    />
  )
}

export { SegmentedControl, SegmentedControlIndicator, SegmentedControlItem }
