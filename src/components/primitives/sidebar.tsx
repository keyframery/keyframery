"use client"

/* Animated sidebar, on UI SDK's core. UI SDK ships no sidebar, so the behaviour is defined once in
   `@/components/core/sidebar` with `definePrimitive` and rendered here with shadcn's part names
   (SidebarProvider, Sidebar, SidebarTrigger, SidebarHeader, SidebarContent, SidebarGroup,
   SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton,
   SidebarMenuBadge, SidebarFooter, SidebarInset): swap the import and keep your markup.
   This file adds motion only. Colours, radii, shadows and spacing stay yours.
   - Glide: the current page's key slides from the old item to the new one, across groups.
     It is the content's `::before`; give it a surface with `before:` classes.
   - Collapse: the sidebar narrows to a rail. Labels leave first, quickly; on the way back they
     wait for the width to open and then rise in out of a blur.
   - Press: items give under the pointer and spring back with a small pop.
   - Flourish: the presses, the labels' slide and blur, and the badge's pop scale with --kf-flourish;
     the glide, the width and the sheet stay.
   - Sheet: below `mobileBreakpoint` (the provider's own width, 640px by default) the sidebar leaves
     the layout and slides in over the page from the left, over a scrim. The trigger opens it; the
     scrim, Escape or choosing an item closes it. The provider should be the full-height app shell.
   Every part takes `render`, and a `className`, `style` or `children` that is a function of its state. */

import { createParts, type PartProps, usePart, usePrimitive } from "@ui-sdk/react/primitive"
import type { PrimitiveHandle } from "@ui-sdk/react/primitive"
import type { StateOf } from "@ui-sdk/core"
import * as React from "react"

import { sidebar, type SidebarMenuButtonOptions, type SidebarOptions, type SidebarState } from "@/components/core/sidebar"
import { cn } from "@/lib/utils"

const parts = createParts(sidebar, {
  header: "div",
  footer: "div",
  content: "div",
  group: "div",
  "group-label": "div",
  "group-content": "div",
  menu: "ul",
  "menu-item": "li",
  label: "span",
  "menu-badge": "span",
  inset: "main",
})

type ClassName<S> = string | ((state: S) => string | undefined) | undefined

/* Adds this file's motion classes to a `className` that may be a function of the part's state. */
function motion<S>(base: string, className: ClassName<S>): string | ((state: S) => string) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* The instance, for `useSidebar`. It carries no state of its own: the hook reads the primitive's. */
const SidebarHandle = React.createContext<PrimitiveHandle<typeof sidebar> | null>(null)

/** Collapsed state for the sidebar, its trigger and the page beside it. */
function useSidebar() {
  const handle = React.useContext(SidebarHandle)
  if (!handle) throw new Error("useSidebar must be used inside <SidebarProvider>.")
  const { instance, api } = handle
  const read = () => instance.get() as SidebarState
  const state = React.useSyncExternalStore(instance.subscribe, read, read)
  return React.useMemo(
    () => ({
      collapsed: state.collapsed,
      setCollapsed: (next: boolean) => void api.setCollapsed(next),
      /** Collapses to the rail, or on a narrow screen opens and closes the sheet. */
      toggle: () => void api.toggle(),
      /** The provider is narrower than its `mobileBreakpoint`: the sidebar is a sheet over the page. */
      isMobile: state.isMobile,
      openMobile: state.openMobile,
      setOpenMobile: (open: boolean) => void api.setOpenMobile(open),
    }),
    [api, state.collapsed, state.isMobile, state.openMobile],
  )
}

function SidebarProvider({
  collapsed,
  defaultCollapsed,
  onCollapsedChange,
  openMobile,
  defaultOpenMobile,
  onOpenMobileChange,
  mobileBreakpoint = 640,
  className,
  ...props
}: SidebarOptions & Omit<PartProps<"div", StateOf<typeof sidebar, "provider">>, "defaultValue">) {
  const handle = usePrimitive(sidebar, {
    collapsed,
    defaultCollapsed,
    onCollapsedChange,
    openMobile,
    defaultOpenMobile,
    onOpenMobileChange,
    mobileBreakpoint,
  })
  const shell = usePart(handle, "provider", {}, { ...props, className: motion("group/sidebar-provider relative flex", className) }, "div")
  return <SidebarHandle value={handle}>{shell}</SidebarHandle>
}

/* The width eases without overshoot, so nothing beside it bounces. Closing is a little quicker.
   As a sheet it slides rather than narrows, and the scrim behind it fades with it. */
function Sidebar({ className, ...props }: PartProps<"aside", StateOf<typeof sidebar, "root">>) {
  const scrim = usePart(
    sidebar,
    "scrim",
    {},
    {
      className:
        "pointer-events-none absolute inset-0 z-30 bg-black/25 opacity-0 transition-opacity duration-[calc(260ms*var(--kf-speed,1))] ease-house data-open:pointer-events-auto data-open:opacity-100 data-open:duration-[calc(360ms*var(--kf-speed,1))] motion-reduce:transition-none dark:bg-black/50",
    },
    "div",
  )
  const aside = usePart(
    sidebar,
    "root",
    {},
    {
      ...props,
      className: motion(
        cn(
          "group/sidebar flex w-(--sidebar-width,15rem) shrink-0 flex-col overflow-hidden",
          "data-collapsed:w-(--sidebar-width-collapsed,3.5rem)",
          "transition-[width] duration-[calc(420ms*var(--kf-speed,1))] ease-house data-collapsed:duration-[calc(340ms*var(--kf-speed,1))]",
          "data-mobile:absolute data-mobile:inset-y-0 data-mobile:left-0 data-mobile:z-40 data-mobile:w-(--sidebar-width-mobile,17rem) data-mobile:max-w-[85%] data-mobile:-translate-x-[calc(100%+48px)]",
          "data-mobile:transition-[translate] data-mobile:duration-[calc(280ms*var(--kf-speed,1))] data-mobile:data-open:translate-x-0 data-mobile:data-open:duration-[calc(440ms*var(--kf-speed,1))]",
          "motion-reduce:transition-none!",
        ),
        className,
      ),
    },
    "aside",
  )
  return (
    <>
      {scrim}
      {aside}
    </>
  )
}

function SidebarTrigger({ className, ...props }: PartProps<"button", StateOf<typeof sidebar, "trigger">>) {
  return usePart(
    sidebar,
    "trigger",
    {},
    {
      ...props,
      className: motion(
        "transition-[scale] duration-[calc(260ms*var(--kf-speed,1))] ease-pop active:scale-[calc(1-0.1*var(--kf-flourish,1))] active:duration-[calc(100ms*var(--kf-speed,1))] motion-reduce:transition-none!",
        className,
      ),
    },
    "button",
  )
}

const SidebarHeader = parts.Header
const SidebarFooter = parts.Footer
const SidebarGroup = parts.Group
const SidebarGroupContent = parts.GroupContent
const SidebarMenu = parts.Menu
const SidebarMenuItem = parts.MenuItem
/** Wrap the words of a menu button in this so they fold away on the rail. */
const SidebarLabel = parts.Label
/* The page beside the sidebar. */
function SidebarInset({ className, ...props }: React.ComponentProps<typeof parts.Inset>) {
  return <parts.Inset className={motion("min-w-0 flex-1", className)} {...props} />
}

/* Glide: the key is anchored to whichever button has data-active. While that button sits inside a
   closed group there is nothing to hold on to, so the key fades out where it was. It waits for
   `data-ready` so it doesn't slide in from the corner on the first paint. */
function SidebarContent({ className, ...props }: React.ComponentProps<typeof parts.Content>) {
  return (
    <parts.Content
      className={motion(
        cn(
          "relative isolate min-h-0 flex-1 [anchor-scope:--kf-sidebar-key]",
          "[&_[data-slot=sidebar-menu-button][data-active]]:[anchor-name:--kf-sidebar-key]",
          "before:pointer-events-none before:absolute before:-z-10 before:bg-[color-mix(in_oklch,currentColor_9%,transparent)]",
          "before:[position-anchor:--kf-sidebar-key] before:top-[anchor(top)] before:right-[anchor(right)] before:bottom-[anchor(bottom)] before:left-[anchor(left)]",
          "data-ready:before:[transition:top_calc(260ms*var(--kf-speed,1))_var(--ease-spring),right_calc(260ms*var(--kf-speed,1))_var(--ease-spring),bottom_calc(260ms*var(--kf-speed,1))_var(--ease-spring),left_calc(260ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(160ms*var(--kf-speed,1))_var(--ease-house)]",
          "not-has-[[data-slot=sidebar-menu-button][data-active]]:before:opacity-0 has-[[hidden]_[data-active]]:before:opacity-0",
          "motion-reduce:before:[transition:none]!",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* Group labels have nothing to show on the rail: they fold to nothing with the labels. */
function SidebarGroupLabel({ className, ...props }: React.ComponentProps<typeof parts.GroupLabel>) {
  return (
    <parts.GroupLabel
      className={motion(
        cn(
          "transition-[opacity,filter,translate] duration-[calc(300ms*var(--kf-speed,1))] ease-house",
          "group-data-collapsed/sidebar:pointer-events-none group-data-collapsed/sidebar:-translate-x-[calc(0.25rem*var(--kf-flourish,1))] group-data-collapsed/sidebar:opacity-0 group-data-collapsed/sidebar:blur-[calc(3px*var(--kf-flourish,1))] group-data-collapsed/sidebar:duration-[calc(140ms*var(--kf-speed,1))]",
          "motion-reduce:transition-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* Text inside a button collapses with the sidebar. On the way out it leaves at once; on the way
   back in it waits until the width has mostly opened, then rises in out of a blur. */
const label = cn(
  "[&>[data-slot=sidebar-label]]:transition-[opacity,filter,translate] [&>[data-slot=sidebar-label]]:duration-[calc(320ms*var(--kf-speed,1))] [&>[data-slot=sidebar-label]]:ease-spring",
  "[&>[data-slot=sidebar-label]]:delay-[calc(140ms*var(--kf-speed,1))]",
  "group-data-collapsed/sidebar:[&>[data-slot=sidebar-label]]:-translate-x-[calc(0.25rem*var(--kf-flourish,1))] group-data-collapsed/sidebar:[&>[data-slot=sidebar-label]]:opacity-0 group-data-collapsed/sidebar:[&>[data-slot=sidebar-label]]:blur-[calc(3px*var(--kf-flourish,1))]",
  "group-data-collapsed/sidebar:[&>[data-slot=sidebar-label]]:delay-0 group-data-collapsed/sidebar:[&>[data-slot=sidebar-label]]:duration-[calc(120ms*var(--kf-speed,1))] group-data-collapsed/sidebar:[&>[data-slot=sidebar-label]]:ease-house",
  "motion-reduce:[&>[data-slot=sidebar-label]]:transition-none!",
)

type MenuButtonState = StateOf<typeof sidebar, "menu-button">

/* A page in the sidebar: a button, or a link when it has `href`. */
function SidebarMenuButton({
  id,
  isActive,
  tooltip,
  href,
  className,
  ...props
}: SidebarMenuButtonOptions & Omit<PartProps<"button", MenuButtonState>, "id"> & { id?: string }) {
  return usePart(
    sidebar,
    "menu-button",
    { id, isActive, tooltip, href },
    {
      ...props,
      className: motion(
        cn(
          "[transition:color_calc(150ms*var(--kf-speed,1))_var(--ease-house),background-color_calc(150ms*var(--kf-speed,1))_var(--ease-house),scale_calc(260ms*var(--kf-speed,1))_var(--ease-pop)]",
          "active:scale-[calc(1-0.03*var(--kf-flourish,1))] active:[transition-duration:calc(100ms*var(--kf-speed,1))]",
          "motion-reduce:[transition:none]!",
          label,
        ),
        className,
      ),
    } as PartProps<"button", MenuButtonState>,
    (href === undefined ? "button" : "a") as "button",
  )
}

/* A count that pops when its number changes, and steps aside on the rail. */
function SidebarMenuBadge({ className, children, ...props }: React.ComponentProps<typeof parts.MenuBadge>) {
  const pop = (content: React.ReactNode) => (
    <>
      <span
        key={typeof content === "string" || typeof content === "number" ? String(content) : undefined}
        className="inline-block animate-[kf-sidebar-badge_calc(320ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-pop)] motion-reduce:animate-none"
      >
        {content}
      </span>
      <style href="kf-sidebar" precedence="default">
        {"@keyframes kf-sidebar-badge{from{scale:.6;opacity:0}}"}
      </style>
    </>
  )
  return (
    <parts.MenuBadge
      className={motion(
        cn(
          "transition-[opacity,scale] duration-[calc(260ms*var(--kf-speed,1))] ease-pop",
          "group-data-collapsed/sidebar:scale-[calc(0.95-0.45*var(--kf-flourish,1))] group-data-collapsed/sidebar:opacity-0 group-data-collapsed/sidebar:duration-[calc(120ms*var(--kf-speed,1))]",
          "motion-reduce:transition-none!",
        ),
        className,
      )}
      {...props}
    >
      {typeof children === "function" ? (state: {}) => pop(children(state)) : pop(children)}
    </parts.MenuBadge>
  )
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
}
export { sidebar } from "@/components/core/sidebar"
