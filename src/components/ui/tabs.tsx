"use client"

export * from "@/components/primitives/tabs"

/* Styled tabs: the animated primitive plus the Keyframery look. */

/* Theming: inherit these optional variables; unset values retain the original light/dark tokens.
   --tabs-track: Tab list well (default: --muted).
   --tabs-key: Selected tab surface (default: --background; --accent in dark).
   --tabs-ink: Unselected labels (default: --muted-foreground).
   --tabs-selected-ink: Selected labels (default: --foreground).
   --tabs-height: Tab height (default: 2rem).
   --tabs-radius: List corners (default: 12px).
   --tabs-key-radius: Tab key corners (default: 9px).
   --tabs-gap: Space between tabs (default: 0.125rem).
 */

import * as React from "react"

import {
  Tabs as TabsRoot,
  TabsIndicator as TabsIndicatorPrimitive,
  TabsList as TabsListPrimitive,
  TabsPanel as TabsPanelPrimitive,
  TabsPanels as TabsPanelsPrimitive,
  TabsTab as TabsTabPrimitive,
  TabsTabIcon as TabsTabIconPrimitive,
} from "@/components/primitives/tabs"
import { mapChildren, Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* One box shared by the real tab and its copy inside the key, so both lay out identically. */
const tabBox =
  "inline-flex h-[var(--tabs-height,2rem)] shrink-0 items-center justify-center gap-1.5 rounded-[var(--tabs-key-radius,9px)] px-3 text-[13px] leading-none font-medium whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0"

const listLayout =
  "flex items-center gap-[var(--tabs-gap,0.125rem)] p-1 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch"

function Tabs({ speed, className, ...props }: React.ComponentProps<typeof TabsRoot> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <TabsRoot
        className={withClass("flex flex-col data-[orientation=vertical]:flex-row data-[orientation=vertical]:gap-4", className)}
        {...props}
      />
    </Speed>
  )
}

function TabsList({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TabsListPrimitive>) {
  return (
    <TabsListPrimitive
      className={withClass(
        cn(
          listLayout,
          "w-fit rounded-[var(--tabs-radius,12px)] bg-[var(--tabs-track,var(--muted))]",
          "shadow-[inset_0_1px_2px_rgb(0_0_0/0.07),inset_0_0_0_1px_rgb(0_0_0/0.035)]",
          "dark:shadow-[inset_0_1px_2px_rgb(0_0_0/0.5),inset_0_0_0_1px_rgb(255_255_255/0.04)]",
        ),
        className,
      )}
      {...props}
    >
      {mapChildren(children, (content) => (
        <>
          {content}
          {/* The key: a raised surface that stretches toward the tab you pick. */}
          <TabsIndicator>
            {/* A copy of the labels in the selected colour, clipped to the key. It is offset by the
                key's own moving edges, so it stays still while the key passes over it. */}
            <span className="absolute inset-0 overflow-hidden rounded-[inherit]">
              <span
                className={cn(
                  listLayout,
                  "absolute text-[color:var(--tabs-selected-ink,var(--foreground))]",
                  "group-data-[orientation=vertical]/key:flex-col group-data-[orientation=vertical]/key:items-stretch",
                  "top-[calc(min(var(--kf-ta),var(--kf-tb))*-1)] left-[calc(min(var(--kf-la),var(--kf-lb))*-1)]",
                  "h-[calc(var(--active-tab-top,0px)+var(--active-tab-height,0px)+var(--active-tab-bottom,0px))]",
                  "w-[calc(var(--active-tab-left,0px)+var(--active-tab-width,0px)+var(--active-tab-right,0px))]",
                )}
              >
                {React.Children.map(content, (child) =>
                  React.isValidElement<{ children?: React.ReactNode }>(child) ? (
                    <span className={tabBox}>{child.props.children}</span>
                  ) : null,
                )}
              </span>
            </span>
          </TabsIndicator>
        </>
      ))}
    </TabsListPrimitive>
  )
}

/* The key on its own. TabsList already renders one, so add this only to a list you build from the
   primitive parts yourself. */
function TabsIndicator({ className, ...props }: React.ComponentProps<typeof TabsIndicatorPrimitive>) {
  return (
    <TabsIndicatorPrimitive
      aria-hidden
      className={withClass(
        cn(
          "group/key z-10 rounded-[var(--tabs-key-radius,9px)] bg-[var(--tabs-key,var(--background))]",
          "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)]",
          "dark:bg-[var(--tabs-key,var(--accent))] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
        ),
        className,
      )}
      {...props}
    />
  )
}

function TabsTab({ className, ...props }: React.ComponentProps<typeof TabsTabPrimitive>) {
  return (
    <TabsTabPrimitive
      className={withClass(
        cn(
          tabBox,
          "relative cursor-pointer text-[color:var(--tabs-ink,var(--muted-foreground))] outline-none select-none",
          "transition-[color,background-color,scale] motion-reduce:transition-none! hover:bg-[color-mix(in_oklab,var(--tabs-selected-ink,var(--foreground))_4.5%,transparent)] hover:text-[color:var(--tabs-selected-ink,var(--foreground))]",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-muted",
          "data-disabled:pointer-events-none data-disabled:opacity-40",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* An icon inside a tab. A tab with only an icon needs an `aria-label`. */
function TabsTabIcon({ className, ...props }: React.ComponentProps<typeof TabsTabIconPrimitive>) {
  return <TabsTabIconPrimitive className={withClass("inline-flex shrink-0 items-center justify-center [&_svg]:size-3.5", className)} {...props} />
}

function TabsPanels({ className, ...props }: React.ComponentProps<typeof TabsPanelsPrimitive>) {
  return <TabsPanelsPrimitive className={cn("mt-3 flex-1", className)} {...props} />
}

function TabsPanel({ className, ...props }: React.ComponentProps<typeof TabsPanelPrimitive>) {
  return (
    <TabsPanelPrimitive
      className={withClass(
        cn(
          "min-w-0 outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        ),
        className,
      )}
      {...props}
    />
  )
}

export { Tabs, TabsIndicator, TabsList, TabsPanel, TabsPanels, TabsTab, TabsTabIcon }

/* UI SDK's helpers for this component, passed through. */
export { createTabsController } from "@/components/primitives/tabs"
