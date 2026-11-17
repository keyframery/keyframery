"use client"

export * from "@/components/primitives/navigation-menu"

/* Theming (inherited; each default preserves the original light/dark appearance):
   --navigation-menu-surface: Viewport surface (default: --popover)
   --navigation-menu-ink: Panel link text (default: --foreground; --popover-foreground for viewport)
   --navigation-menu-muted: Trigger and icon text (default: --muted-foreground)
   --navigation-menu-highlight: Indicator and highlighted links (default: --accent)
   --navigation-menu-radius: Viewport corners (default: 14px)
   --navigation-menu-item-radius: Trigger and indicator corners (default: 9px)
   --navigation-menu-height: Top-level item height (default: 2rem)
   --navigation-menu-gap: Top-level item gap (default: 0.125rem)
*/

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

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* The label look shared by triggers and top-level links. */
const topLevel =
  "relative inline-flex h-[var(--navigation-menu-height,2rem)] shrink-0 cursor-pointer items-center justify-center gap-1 rounded-[var(--navigation-menu-item-radius,9px)] px-3 text-[13px] leading-none font-medium whitespace-nowrap text-[color:var(--navigation-menu-muted,var(--muted-foreground))] outline-none select-none hover:text-[color:var(--navigation-menu-ink,var(--foreground))] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

/* The root is the positioned ancestor the indicator measures from. */
function NavigationMenu<T extends string = string>({
  speed,
  className,
  ...props
}: NavigationMenuProps<T> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <NavigationMenuRoot<T>
        className={withClass("group/nav relative flex items-center data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch", className)}
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
      className={withClass("relative z-[1] m-0 flex list-none items-center gap-[var(--navigation-menu-gap,0.125rem)] p-0 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch", className)}
      {...props}
    />
  )
}

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuItemPart>) {
  return <NavigationMenuItemPart className={withClass("relative", className)} {...props} />
}

/* A flat label with a chevron that turns while its panel is open. */
function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuTriggerPart>) {
  return (
    <NavigationMenuTriggerPart
      className={withClass(
        cn(
          topLevel,
          "data-open:text-[color:var(--navigation-menu-ink,var(--foreground))]",
          "data-disabled:pointer-events-none data-disabled:opacity-40",
        ),
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
      className={withClass(
        cn(
          "p-1.5 outline-none",
          "[[data-slot=navigation-menu-viewport]>&]:absolute [[data-slot=navigation-menu-viewport]>&]:start-0 [[data-slot=navigation-menu-viewport]>&]:top-0 [[data-slot=navigation-menu-viewport]>&]:w-max",
          "[[data-slot=navigation-menu-viewport]>&]:max-h-(--panel-height) [[data-slot=navigation-menu-viewport]>&]:overflow-y-auto",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        ),
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
      className={withClass(
        cn(
          "m-0 overflow-hidden border-0 p-0",
          "h-(--viewport-height) w-(--viewport-width) [--panel-height:var(--available-height)]",
          "rounded-[var(--navigation-menu-radius,14px)] bg-[var(--navigation-menu-surface,var(--popover))] text-[color:var(--navigation-menu-ink,var(--popover-foreground))]",
          "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_6px_-2px_rgb(0_0_0/0.08),0_12px_32px_-8px_rgb(0_0_0/0.18)]",
          "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_12px_32px_-8px_rgb(0_0_0/0.7)]",
        ),
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
      className={withClass("z-0 rounded-[var(--navigation-menu-item-radius,9px)] bg-[var(--navigation-menu-highlight,var(--accent))]", className)}
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
      className={withClass(
        cn(
          "group/link flex cursor-pointer items-start gap-3 rounded-[10px] px-3 py-2.5 text-[13px] leading-5 text-[color:var(--navigation-menu-ink,var(--foreground))] no-underline outline-none",
          "transition-[background-color] duration-[calc(150ms*var(--kf-speed,1))] hover:bg-[var(--navigation-menu-highlight,var(--accent))] hover:duration-0 data-current:bg-[color-mix(in_oklab,var(--navigation-menu-highlight,var(--accent))_60%,transparent)]",
          "focus-visible:bg-[var(--navigation-menu-highlight,var(--accent))] focus-visible:ring-2 focus-visible:ring-ring",
          "motion-reduce:transition-none!",
          /* Directly in the bar, it is a label like the triggers. */
          "[[data-slot=navigation-menu-list]>li>&]:items-center [[data-slot=navigation-menu-list]>li>&]:h-[var(--navigation-menu-height,2rem)] [[data-slot=navigation-menu-list]>li>&]:gap-1 [[data-slot=navigation-menu-list]>li>&]:rounded-[var(--navigation-menu-item-radius,9px)] [[data-slot=navigation-menu-list]>li>&]:px-3 [[data-slot=navigation-menu-list]>li>&]:py-0 [[data-slot=navigation-menu-list]>li>&]:leading-none [[data-slot=navigation-menu-list]>li>&]:font-medium",
          "[[data-slot=navigation-menu-list]>li>&]:text-[color:var(--navigation-menu-muted,var(--muted-foreground))] [[data-slot=navigation-menu-list]>li>&]:hover:bg-transparent [[data-slot=navigation-menu-list]>li>&]:hover:text-[color:var(--navigation-menu-ink,var(--foreground))] [[data-slot=navigation-menu-list]>li>&]:data-current:bg-transparent [[data-slot=navigation-menu-list]>li>&]:data-current:text-[color:var(--navigation-menu-ink,var(--foreground))]",
          "[[data-slot=navigation-menu-list]>li>&]:focus-visible:bg-transparent [[data-slot=navigation-menu-list]>li>&]:focus-visible:ring-offset-2 [[data-slot=navigation-menu-list]>li>&]:focus-visible:ring-offset-background",
        ),
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
      className={withClass(
        cn(
          "grid size-8 shrink-0 place-items-center rounded-[8px] bg-muted text-[color:var(--navigation-menu-muted,var(--muted-foreground))] [&>svg]:size-4",
          "shadow-[inset_0_0_0_1px_rgb(0_0_0/0.04)] dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.05)]",
          "transition-[background-color,color,box-shadow] duration-[calc(150ms*var(--kf-speed,1))] group-hover/link:bg-background group-hover/link:text-[color:var(--navigation-menu-ink,var(--foreground))] group-hover/link:shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.06)]",
          "dark:group-hover/link:bg-popover dark:group-hover/link:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]",
          "rtl:data-mirror:-scale-x-100 motion-reduce:transition-none!",
        ),
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
