"use client"

export * from "@/components/primitives/segmented-control"

/* Styled segmented control: the animated primitive plus the Keyframery look. */

/* Theming: inherit these optional variables; unset values retain the original light/dark tokens.
   --segmented-control-track: The recessed track (default: --muted).
   --segmented-control-key: The selected key (default: --background; --accent in dark).
   --segmented-control-ink: The unselected label (default: --muted-foreground).
   --segmented-control-selected-ink: The selected label (default: --foreground).
   --segmented-control-height: Item height (default: 2rem).
   --segmented-control-radius: Track corners (default: 12px).
   --segmented-control-key-radius: Item and key corners (default: 9px).
   --segmented-control-gap: Space between items (default: 0.125rem).
 */

import * as React from "react"

import {
  SegmentedControl as SegmentedControlRoot,
  SegmentedControlIndicator as SegmentedControlIndicatorPrimitive,
  SegmentedControlItem as SegmentedControlItemPrimitive,
} from "@/components/primitives/segmented-control"
import { mapChildren, Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* One box shared by the real item and its copy inside the key, so both lay out identically. */
const itemBox =
  "inline-flex h-[var(--segmented-control-height,2rem)] shrink-0 items-center justify-center gap-1.5 rounded-[var(--segmented-control-key-radius,9px)] px-3 text-[13px] leading-none font-medium whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0"

const rowLayout = "flex items-stretch gap-[var(--segmented-control-gap,0.125rem)] p-1 data-[orientation=vertical]:flex-col"

/* The control renders its own key (the indicator), like the tabs list does, so don't add a
   SegmentedControlIndicator inside it. */
function SegmentedControl({
  speed,
  className,
  children,
  orientation,
  ...props
}: React.ComponentProps<typeof SegmentedControlRoot> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <SegmentedControlRoot
        orientation={orientation}
        className={withClass(
          cn(
            rowLayout,
            "inline-flex w-fit rounded-[var(--segmented-control-radius,12px)] bg-[var(--segmented-control-track,var(--muted))] outline-none",
            "shadow-[inset_0_1px_2px_rgb(0_0_0/0.07),inset_0_0_0_1px_rgb(0_0_0/0.035)]",
            "dark:shadow-[inset_0_1px_2px_rgb(0_0_0/0.5),inset_0_0_0_1px_rgb(255_255_255/0.04)]",
            "data-disabled:opacity-60",
          ),
          className,
        )}
        {...props}
      >
        {mapChildren(children, (content) => (
          <>
            {content}
            {/* The key: a raised surface that stretches toward the item you pick. */}
            <SegmentedControlIndicator>
              {/* A copy of the labels in the selected colour, clipped to the key. It is offset by the
                  key's own moving edges, so it stays still while the key passes over it. */}
              <span className="absolute inset-0 overflow-hidden rounded-[inherit]">
                <span
                  data-orientation={orientation ?? "horizontal"}
                  className={cn(
                    rowLayout,
                    "absolute text-[color:var(--segmented-control-selected-ink,var(--foreground))]",
                    "top-[calc(min(var(--kf-ta),var(--kf-tb))*-1)] left-[calc(min(var(--kf-la),var(--kf-lb))*-1)]",
                    "h-[calc(var(--segmented-control-indicator-top,0px)+var(--segmented-control-indicator-height,0px)+var(--segmented-control-indicator-bottom,0px))]",
                    "w-[calc(var(--segmented-control-indicator-left,0px)+var(--segmented-control-indicator-width,0px)+var(--segmented-control-indicator-right,0px))]",
                  )}
                >
                  {/* Each copy takes its item's own class names (a string className), so an item stretched
                      with flex-1 has a copy stretched the same way. A rule on the control that sizes its items
                      should also size [data-slot=segmented-control-item-copy]. */}
                  {React.Children.map(content, (child) =>
                    React.isValidElement<{ children?: React.ReactNode; className?: unknown }>(child) ? (
                      <span
                        data-slot="segmented-control-item-copy"
                        className={cn(itemBox, typeof child.props.className === "string" && child.props.className)}
                      >
                        {child.props.children}
                      </span>
                    ) : null,
                  )}
                </span>
              </span>
            </SegmentedControlIndicator>
          </>
        ))}
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
      className={withClass(
        cn(
          "z-10 rounded-[var(--segmented-control-key-radius,9px)] bg-[var(--segmented-control-key,var(--background))]",
          "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)]",
          "dark:bg-[var(--segmented-control-key,var(--accent))] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
        ),
        className,
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
      className={withClass(
        cn(
          itemBox,
          "relative cursor-pointer text-[color:var(--segmented-control-ink,var(--muted-foreground))] outline-none select-none",
          "transition-[color,background-color,scale] motion-reduce:transition-none! hover:bg-[color-mix(in_oklab,var(--segmented-control-selected-ink,var(--foreground))_4.5%,transparent)] hover:text-[color:var(--segmented-control-selected-ink,var(--foreground))]",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-muted",
          "data-disabled:pointer-events-none data-disabled:opacity-40 data-readonly:cursor-default",
        ),
        className,
      )}
      {...props}
    />
  )
}

export { SegmentedControl, SegmentedControlIndicator, SegmentedControlItem }

/* UI SDK's helpers for this component, passed through. */
export { createSegmentedControlController } from "@/components/primitives/segmented-control"
