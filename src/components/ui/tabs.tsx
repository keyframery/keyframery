"use client"

/* Styled tabs: the animated primitive plus the Keyframery look. */

import * as React from "react"

import {
  Tabs as TabsRoot,
  TabsIndicator as TabsIndicatorPrimitive,
  TabsList as TabsListPrimitive,
  TabsPanel as TabsPanelPrimitive,
  TabsPanels as TabsPanelsPrimitive,
  TabsTab as TabsTabPrimitive,
} from "@/components/primitives/tabs"
import { cn } from "@/lib/utils"

/* One box shared by the real tab and its copy inside the key, so both lay out identically. */
const tabBox =
  "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-[9px] px-3 text-[13px] leading-none font-medium whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0"

const listLayout =
  "flex items-center gap-0.5 p-1 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch"

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsRoot>) {
  return (
    <TabsRoot
      className={cn(
        "flex flex-col data-[orientation=vertical]:flex-row data-[orientation=vertical]:gap-4",
        className,
      )}
      {...props}
    />
  )
}

function TabsList({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof TabsListPrimitive>, "children"> & {
  children?: React.ReactNode
}) {
  return (
    <TabsListPrimitive
      className={cn(
        listLayout,
        "w-fit rounded-[12px] bg-muted",
        "shadow-[inset_0_1px_2px_rgb(0_0_0/0.07),inset_0_0_0_1px_rgb(0_0_0/0.035)]",
        "dark:shadow-[inset_0_1px_2px_rgb(0_0_0/0.5),inset_0_0_0_1px_rgb(255_255_255/0.04)]",
        className,
      )}
      {...props}
    >
      {children}
      {/* The key: a raised surface that stretches toward the tab you pick. */}
      <TabsIndicatorPrimitive
        aria-hidden
        className={cn(
          "group/key z-10 rounded-[9px] bg-background",
          "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)]",
          "dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
        )}
      >
        {/* A copy of the labels in the selected colour, clipped to the key. It is offset by the
            key's own moving edges, so it stays still while the key passes over it. */}
        <span className="absolute inset-0 overflow-hidden rounded-[inherit]">
          <span
            className={cn(
              listLayout,
              "absolute text-foreground",
              "group-data-[orientation=vertical]/key:flex-col group-data-[orientation=vertical]/key:items-stretch",
              "top-[calc(min(var(--kf-ta),var(--kf-tb))*-1)] left-[calc(min(var(--kf-la),var(--kf-lb))*-1)]",
              "h-[calc(var(--active-tab-top,0px)+var(--active-tab-height,0px)+var(--active-tab-bottom,0px))]",
              "w-[calc(var(--active-tab-left,0px)+var(--active-tab-width,0px)+var(--active-tab-right,0px))]",
            )}
          >
            {React.Children.map(children, (child) =>
              React.isValidElement<{ children?: React.ReactNode }>(child) ? (
                <span className={tabBox}>{child.props.children}</span>
              ) : null,
            )}
          </span>
        </span>
      </TabsIndicatorPrimitive>
    </TabsListPrimitive>
  )
}

function TabsTab({ className, ...props }: React.ComponentProps<typeof TabsTabPrimitive>) {
  return (
    <TabsTabPrimitive
      className={cn(
        tabBox,
        "relative cursor-pointer text-muted-foreground outline-none select-none",
        "transition-[color,background-color,scale] motion-reduce:transition-none! hover:bg-foreground/[0.045] hover:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-muted",
        "data-disabled:pointer-events-none data-disabled:opacity-40",
        className,
      )}
      {...props}
    />
  )
}

function TabsPanels({ className, ...props }: React.ComponentProps<typeof TabsPanelsPrimitive>) {
  return <TabsPanelsPrimitive className={cn("mt-3 flex-1", className)} {...props} />
}

function TabsPanel({ className, ...props }: React.ComponentProps<typeof TabsPanelPrimitive>) {
  return (
    <TabsPanelPrimitive
      className={cn(
        "min-w-0 outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsPanel, TabsPanels, TabsTab }
