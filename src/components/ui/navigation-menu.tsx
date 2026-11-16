"use client"

/* Styled navigation menu: the animated primitive plus the Keyframery look. */

import {
  createNavigationMenuController,
  NavigationMenu as NavigationMenuRoot,
  NavigationMenuContent as NavigationMenuContentPart,
  NavigationMenuIndicator as NavigationMenuIndicatorPart,
  NavigationMenuItem as NavigationMenuItemPart,
  NavigationMenuLink as NavigationMenuLinkPart,
  NavigationMenuLinkIcon as NavigationMenuLinkIconPart,
  NavigationMenuList as NavigationMenuListPart,
  type NavigationMenuProps,
  NavigationMenuTrigger as NavigationMenuTriggerPart,
  NavigationMenuViewport as NavigationMenuViewportPart,
} from "@/components/primitives/navigation-menu"
import * as React from "react"

import { mapChildren, Speed, type SpeedProps, useSpeedStyle } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* The label look shared by triggers and top-level links. */
const topLevel =
  "relative inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-[9px] px-3 text-[13px] leading-none font-medium whitespace-nowrap text-muted-foreground outline-none select-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

/* The root is the positioned ancestor the indicator measures from. */
function NavigationMenu<T extends string = string>({
  speed,
  className,
  ...props
}: NavigationMenuProps<T> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <NavigationMenuRoot<T>
        className={cn(
          "group/nav relative flex items-center data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
          className,
        )}
        {...props}
      />
    </Speed>
  )
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuListPart>) {
  return (
    <NavigationMenuListPart
      className={cn(
        "relative z-[1] m-0 flex list-none items-center gap-0.5 p-0 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
        className,
      )}
      {...props}
    />
  )
}

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuItemPart>) {
  return <NavigationMenuItemPart className={cn("relative", className)} {...props} />
}

/* A flat label with a chevron that turns while its panel is open. */
function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuTriggerPart>) {
  return (
    <NavigationMenuTriggerPart
      className={cn(
        topLevel,
        "data-open:text-foreground",
        "data-disabled:pointer-events-none data-disabled:opacity-40",
        className,
      )}
      {...props}
    >
      {mapChildren(children, (content) => (
        <>
          {content}
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="-me-1 size-3.5 shrink-0 opacity-60 in-data-open:opacity-100"
          >
            <path d="m4.5 6.5 3.5 3.5 3.5-3.5" />
          </svg>
        </>
      ))}
    </NavigationMenuTriggerPart>
  )
}

/* A panel. Inside the viewport it sits at the corner with its own width, so the viewport
   takes its size. The primitive slides it in from the side it was reached from. */
function NavigationMenuContent({
  className,
  style,
  ...props
}: React.ComponentProps<typeof NavigationMenuContentPart>) {
  return (
    <NavigationMenuContentPart
      className={cn(
        "p-1.5 outline-none",
        "[[data-slot=navigation-menu-viewport]>&]:absolute [[data-slot=navigation-menu-viewport]>&]:start-0 [[data-slot=navigation-menu-viewport]>&]:top-0 [[data-slot=navigation-menu-viewport]>&]:w-max",
        "[[data-slot=navigation-menu-viewport]>&]:max-h-(--panel-height) [[data-slot=navigation-menu-viewport]>&]:overflow-y-auto",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        className,
      )}
      {...props} style={useSpeedStyle(style)}
    />
  )
}

/* The sheet that holds the open panel. The primitive unfolds it and springs it between panels. */
function NavigationMenuViewport({
  className,
  sideOffset = 8,
  style,
  ...props
}: React.ComponentProps<typeof NavigationMenuViewportPart>) {
  return (
    <NavigationMenuViewportPart
      sideOffset={sideOffset}
      className={cn(
        "m-0 overflow-hidden border-0 p-0",
        "h-(--viewport-height) w-(--viewport-width) [--panel-height:var(--available-height)]",
        "rounded-[14px] bg-popover text-popover-foreground",
        "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_6px_-2px_rgb(0_0_0/0.08),0_12px_32px_-8px_rgb(0_0_0/0.18)]",
        "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_12px_32px_-8px_rgb(0_0_0/0.7)]",
        className,
      )}
      {...props} style={useSpeedStyle(style)}
    />
  )
}

/* A soft pill under the open trigger (or the current page's link). The primitive stretches it. */
function NavigationMenuIndicator({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuIndicatorPart>) {
  return (
    <NavigationMenuIndicatorPart
      className={cn("z-0 rounded-[9px] bg-accent", className)}
      {...props}
    />
  )
}

/* A link. At the top level it reads like a trigger; inside a panel it is a roomy row with
   an optional icon tile, a title and a hint. */
function NavigationMenuLink({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuLinkPart>) {
  return (
    <NavigationMenuLinkPart
      className={cn(
        "group/link flex cursor-pointer items-start gap-3 rounded-[10px] px-3 py-2.5 text-[13px] leading-5 text-foreground no-underline outline-none",
        "transition-[background-color] duration-[calc(150ms*var(--kf-speed,1))] hover:bg-accent hover:duration-0 data-current:bg-accent/60",
        "focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
        "motion-reduce:transition-none!",
        /* Directly in the bar, it is a label like the triggers. */
        "[[data-slot=navigation-menu-list]>li>&]:items-center [[data-slot=navigation-menu-list]>li>&]:h-8 [[data-slot=navigation-menu-list]>li>&]:gap-1 [[data-slot=navigation-menu-list]>li>&]:rounded-[9px] [[data-slot=navigation-menu-list]>li>&]:px-3 [[data-slot=navigation-menu-list]>li>&]:py-0 [[data-slot=navigation-menu-list]>li>&]:leading-none [[data-slot=navigation-menu-list]>li>&]:font-medium",
        "[[data-slot=navigation-menu-list]>li>&]:text-muted-foreground [[data-slot=navigation-menu-list]>li>&]:hover:bg-transparent [[data-slot=navigation-menu-list]>li>&]:hover:text-foreground [[data-slot=navigation-menu-list]>li>&]:data-current:bg-transparent [[data-slot=navigation-menu-list]>li>&]:data-current:text-foreground",
        "[[data-slot=navigation-menu-list]>li>&]:focus-visible:bg-transparent [[data-slot=navigation-menu-list]>li>&]:focus-visible:ring-offset-2 [[data-slot=navigation-menu-list]>li>&]:focus-visible:ring-offset-background",
        className,
      )}
      {...props}
    />
  )
}

/* The icon tile of a panel link. */
function NavigationMenuLinkIcon({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuLinkIconPart>) {
  return (
    <NavigationMenuLinkIconPart
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-[8px] bg-muted text-muted-foreground [&>svg]:size-4",
        "shadow-[inset_0_0_0_1px_rgb(0_0_0/0.04)] dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.05)]",
        "transition-[background-color,color,box-shadow] duration-[calc(150ms*var(--kf-speed,1))] group-hover/link:bg-background group-hover/link:text-foreground group-hover/link:shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.06)]",
        "dark:group-hover/link:bg-popover dark:group-hover/link:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]",
        "rtl:data-mirror:-scale-x-100 motion-reduce:transition-none!",
        className,
      )}
      {...props}
    />
  )
}

export {
  createNavigationMenuController,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuLinkIcon,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
}
