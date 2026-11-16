"use client"

/* Animated sidebar. UI SDK has no sidebar, so these are plain elements with the shadcn part names
   (SidebarProvider, Sidebar, SidebarTrigger, SidebarHeader, SidebarContent, SidebarGroup,
   SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton,
   SidebarMenuBadge, SidebarFooter, SidebarInset): swap the import and keep your markup.
   This file adds motion only. Colours, radii, shadows and spacing stay yours.
   - Glide: the current page's key slides from the old item to the new one, across groups.
     It is the content's `::before`; give it a surface with `before:` classes.
   - Collapse: the sidebar narrows to a rail. Labels leave first, quickly; on the way back they
     wait for the width to open and then rise in out of a blur.
   - Press: items give under the pointer and spring back with a small pop.
   - Sheet: below `mobileBreakpoint` (the provider's own width, 640px by default) the sidebar leaves
     the layout and slides in over the page from the left, over a scrim. The trigger opens it; the
     scrim, Escape or choosing an item closes it. The provider should be the full-height app shell. */

import * as React from "react"

import { cn } from "@/lib/utils"

type SidebarState = {
  collapsed: boolean
  setCollapsed: (next: boolean) => void
  /** Collapses to the rail, or on a narrow screen opens and closes the sheet. */
  toggle: () => void
  /** The provider is narrower than its `mobileBreakpoint`: the sidebar is a sheet over the page. */
  isMobile: boolean
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
}

const useIsoLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect

const SidebarContext = React.createContext<SidebarState | null>(null)

/** Collapsed state for the sidebar, its trigger and the page beside it. */
function useSidebar() {
  const ctx = React.useContext(SidebarContext)
  if (!ctx) throw new Error("useSidebar must be used inside <SidebarProvider>.")
  return ctx
}

function SidebarProvider({
  defaultCollapsed = false,
  collapsed: collapsedProp,
  onCollapsedChange,
  mobileBreakpoint = 640,
  className,
  ref,
  ...props
}: React.ComponentProps<"div"> & {
  defaultCollapsed?: boolean
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  /** Below this width (of the provider, in px) the sidebar becomes a sheet. */
  mobileBreakpoint?: number
}) {
  const [own, setOwn] = React.useState(defaultCollapsed)
  const collapsed = collapsedProp ?? own
  const setCollapsed = React.useCallback(
    (next: boolean) => {
      if (collapsedProp === undefined) setOwn(next)
      onCollapsedChange?.(next)
    },
    [collapsedProp, onCollapsedChange],
  )
  const [isMobile, setIsMobile] = React.useState(false)
  const [openMobile, setOpenMobile] = React.useState(false)
  const node = React.useRef<HTMLDivElement | null>(null)
  useIsoLayoutEffect(() => {
    const el = node.current
    if (!el) return
    const measure = () => {
      const narrow = el.clientWidth < mobileBreakpoint
      setIsMobile(narrow)
      if (!narrow) setOpenMobile(false)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [mobileBreakpoint])
  React.useEffect(() => {
    if (!openMobile) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenMobile(false)
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [openMobile])
  const value = React.useMemo(
    () => ({
      collapsed,
      setCollapsed,
      toggle: () => (isMobile ? setOpenMobile(!openMobile) : setCollapsed(!collapsed)),
      isMobile,
      openMobile,
      setOpenMobile,
    }),
    [collapsed, setCollapsed, isMobile, openMobile],
  )
  return (
    <SidebarContext.Provider value={value}>
      <div
        ref={(el) => {
          node.current = el
          if (typeof ref === "function") ref(el)
          else if (ref) ref.current = el
        }}
        data-slot="sidebar-provider"
        data-collapsed={(!isMobile && collapsed) || undefined}
        data-mobile={isMobile || undefined}
        data-open={(isMobile && openMobile) || undefined}
        className={cn("group/sidebar-provider relative flex", className)}
        {...props}
      />
    </SidebarContext.Provider>
  )
}

/* The width eases without overshoot, so nothing beside it bounces. Closing is a little quicker.
   As a sheet it slides rather than narrows, and the scrim behind it fades with it. */
function Sidebar({ className, ...props }: React.ComponentProps<"aside">) {
  const { collapsed, isMobile, openMobile, setOpenMobile } = useSidebar()
  const sheetOpen = isMobile && openMobile
  return (
    <>
      {isMobile && (
        <div
          aria-hidden
          data-slot="sidebar-scrim"
          data-open={sheetOpen || undefined}
          onClick={() => setOpenMobile(false)}
          className="pointer-events-none absolute inset-0 z-30 bg-black/25 opacity-0 transition-opacity duration-[calc(260ms*var(--kf-speed,1))] ease-house data-open:pointer-events-auto data-open:opacity-100 data-open:duration-[calc(360ms*var(--kf-speed,1))] motion-reduce:transition-none dark:bg-black/50"
        />
      )}
      <aside
        data-slot="sidebar"
        data-collapsed={(!isMobile && collapsed) || undefined}
        data-mobile={isMobile || undefined}
        data-open={sheetOpen || undefined}
        inert={isMobile && !openMobile ? true : undefined}
        className={cn(
          "group/sidebar flex w-(--sidebar-width,15rem) shrink-0 flex-col overflow-hidden",
          "data-collapsed:w-(--sidebar-width-collapsed,3.5rem)",
          "transition-[width] duration-[calc(420ms*var(--kf-speed,1))] ease-house data-collapsed:duration-[calc(340ms*var(--kf-speed,1))]",
          "data-mobile:absolute data-mobile:inset-y-0 data-mobile:left-0 data-mobile:z-40 data-mobile:w-(--sidebar-width-mobile,17rem) data-mobile:max-w-[85%] data-mobile:-translate-x-[calc(100%+48px)]",
          "data-mobile:transition-[translate] data-mobile:duration-[calc(280ms*var(--kf-speed,1))] data-mobile:data-open:translate-x-0 data-mobile:data-open:duration-[calc(440ms*var(--kf-speed,1))]",
          "motion-reduce:transition-none!",
          className,
        )}
        {...props}
      />
    </>
  )
}

function SidebarTrigger({ className, onClick, ...props }: React.ComponentProps<"button">) {
  const { collapsed, toggle, isMobile, openMobile } = useSidebar()
  const open = isMobile ? openMobile : !collapsed
  return (
    <button
      type="button"
      data-slot="sidebar-trigger"
      aria-expanded={open}
      aria-label={isMobile ? (open ? "Close sidebar" : "Open sidebar") : open ? "Collapse sidebar" : "Expand sidebar"}
      className={cn(
        "transition-[scale] duration-[calc(260ms*var(--kf-speed,1))] ease-pop active:scale-[0.9] active:duration-[calc(100ms*var(--kf-speed,1))] motion-reduce:transition-none!",
        className,
      )}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) toggle()
      }}
      {...props}
    />
  )
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-header" className={cn(className)} {...props} />
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-footer" className={cn(className)} {...props} />
}

/* Glide: the key is anchored to whichever button has data-active. While that button sits inside a
   closed group there is nothing to hold on to, so the key fades out where it was. */
function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  const [ready, setReady] = React.useState(false)
  React.useEffect(() => {
    const id = setTimeout(() => setReady(true), 60)
    return () => clearTimeout(id)
  }, [])
  return (
    <div
      data-slot="sidebar-content"
      data-kf-glide={ready || undefined}
      className={cn(
        "relative isolate min-h-0 flex-1 [anchor-scope:--kf-sidebar-key]",
        "[&_[data-slot=sidebar-menu-button][data-active]]:[anchor-name:--kf-sidebar-key]",
        "before:pointer-events-none before:absolute before:-z-10 before:bg-[color-mix(in_oklch,currentColor_9%,transparent)]",
        "before:[position-anchor:--kf-sidebar-key] before:top-[anchor(top)] before:right-[anchor(right)] before:bottom-[anchor(bottom)] before:left-[anchor(left)]",
        "data-kf-glide:before:[transition:top_calc(460ms*var(--kf-speed,1))_var(--ease-spring),right_calc(460ms*var(--kf-speed,1))_var(--ease-spring),bottom_calc(460ms*var(--kf-speed,1))_var(--ease-spring),left_calc(460ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(160ms*var(--kf-speed,1))_var(--ease-house)]",
        "not-has-[[data-slot=sidebar-menu-button][data-active]]:before:opacity-0 has-[[hidden]_[data-active]]:before:opacity-0",
        "motion-reduce:before:[transition:none]!",
        className,
      )}
      {...props}
    />
  )
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-group" className={cn(className)} {...props} />
}

/* Group labels have nothing to show on the rail: they fold to nothing with the labels. */
function SidebarGroupLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-label"
      className={cn(
        "transition-[opacity,filter,translate] duration-[calc(300ms*var(--kf-speed,1))] ease-house",
        "group-data-collapsed/sidebar:pointer-events-none group-data-collapsed/sidebar:-translate-x-1 group-data-collapsed/sidebar:opacity-0 group-data-collapsed/sidebar:blur-[3px] group-data-collapsed/sidebar:duration-[calc(140ms*var(--kf-speed,1))]",
        "motion-reduce:transition-none!",
        className,
      )}
      {...props}
    />
  )
}

function SidebarGroupContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-group-content" className={cn(className)} {...props} />
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-slot="sidebar-menu" className={cn(className)} {...props} />
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="sidebar-menu-item" className={cn(className)} {...props} />
}

/* Text inside a button collapses with the sidebar. On the way out it leaves at once; on the way
   back in it waits until the width has mostly opened, then rises in out of a blur. */
const label = cn(
  "[&>[data-slot=sidebar-label]]:transition-[opacity,filter,translate] [&>[data-slot=sidebar-label]]:duration-[calc(320ms*var(--kf-speed,1))] [&>[data-slot=sidebar-label]]:ease-spring",
  "[&>[data-slot=sidebar-label]]:delay-[calc(140ms*var(--kf-speed,1))]",
  "group-data-collapsed/sidebar:[&>[data-slot=sidebar-label]]:-translate-x-1 group-data-collapsed/sidebar:[&>[data-slot=sidebar-label]]:opacity-0 group-data-collapsed/sidebar:[&>[data-slot=sidebar-label]]:blur-[3px]",
  "group-data-collapsed/sidebar:[&>[data-slot=sidebar-label]]:delay-0 group-data-collapsed/sidebar:[&>[data-slot=sidebar-label]]:duration-[calc(120ms*var(--kf-speed,1))] group-data-collapsed/sidebar:[&>[data-slot=sidebar-label]]:ease-house",
  "motion-reduce:[&>[data-slot=sidebar-label]]:transition-none!",
)

type MenuButtonProps = {
  /** Marks the current page. The key glides to it. */
  isActive?: boolean
  /** Shown as a native tooltip while the sidebar is a rail. */
  tooltip?: string
}

function SidebarMenuButton({
  className,
  isActive,
  tooltip,
  href,
  onClick,
  ...props
}: MenuButtonProps & React.ComponentProps<"button"> & { href?: string }) {
  const { collapsed, isMobile, setOpenMobile } = useSidebar()
  const shared = {
    "data-slot": "sidebar-menu-button",
    "data-active": isActive || undefined,
    "aria-current": isActive ? ("page" as const) : undefined,
    title: collapsed && !isMobile ? tooltip : undefined,
    /* On a narrow screen, choosing a page closes the sheet over it. */
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      onClick?.(event as React.MouseEvent<HTMLButtonElement>)
      if (isMobile && !event.defaultPrevented) setOpenMobile(false)
    },
    className: cn(
      "[transition:color_calc(150ms*var(--kf-speed,1))_var(--ease-house),background-color_calc(150ms*var(--kf-speed,1))_var(--ease-house),scale_calc(260ms*var(--kf-speed,1))_var(--ease-pop)]",
      "active:scale-[0.97] active:[transition-duration:calc(100ms*var(--kf-speed,1))]",
      "motion-reduce:[transition:none]!",
      label,
      className,
    ),
  }
  if (href !== undefined)
    return <a href={href} {...shared} {...(props as unknown as React.ComponentProps<"a">)} />
  return <button type="button" {...shared} {...props} />
}

/** Wrap the words of a menu button in this so they fold away on the rail. */
function SidebarLabel({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="sidebar-label" className={cn(className)} {...props} />
}

/* A count that pops when its number changes, and steps aside on the rail. */
function SidebarMenuBadge({ className, children, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="sidebar-menu-badge"
      className={cn(
        "transition-[opacity,scale] duration-[calc(260ms*var(--kf-speed,1))] ease-pop",
        "group-data-collapsed/sidebar:scale-50 group-data-collapsed/sidebar:opacity-0 group-data-collapsed/sidebar:duration-[calc(120ms*var(--kf-speed,1))]",
        "motion-reduce:transition-none!",
        className,
      )}
      {...props}
    >
      <span key={String(children)} className="inline-block animate-[kf-sidebar-badge_calc(320ms*var(--kf-speed,1))_var(--ease-pop)] motion-reduce:animate-none">
        {children}
      </span>
      <style href="kf-sidebar" precedence="default">
        {"@keyframes kf-sidebar-badge{from{scale:.6;opacity:0}}"}
      </style>
    </span>
  )
}

/* The page beside the sidebar. */
function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return <main data-slot="sidebar-inset" className={cn("min-w-0 flex-1", className)} {...props} />
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
