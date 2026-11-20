"use client"

/* The frame every signed-in page sits in: the sidebar (a column, an icon rail, or a sheet on a
   phone), the sticky header, the skip link, the progress line on navigation, and the panels the
   header opens. Pages render inside <main>.

   Sidebar styles: "inset" sets the page on a raised sheet beside the sidebar, "floating" lifts the
   sidebar off the page, "plain" is a column with a hairline. Density "compact" tightens the page
   and the sidebar through CSS variables (--br-*), so pages that use them follow. */

import { CollapsibleTrigger as CollapsibleTriggerPart } from "@ui-sdk/react/collapsible"
import { useShortcut } from "@ui-sdk/react/shortcuts"
import { ChevronRight, Monitor, Moon, Search, SlidersHorizontal, Sun } from "lucide-react"
import * as React from "react"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsiblePanel } from "@/components/ui/collapsible"
import { Direction } from "@/components/ui/direction"
import { KbdCombo } from "@/components/ui/kbd"
import { Menu, MenuContent, MenuGroup, MenuGroupLabel, MenuItem, MenuRadioGroup, MenuRadioItem, MenuTrigger } from "@/components/ui/menu"
import { Separator } from "@/components/ui/separator"
import {
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
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import { AgentConfirm, HeaderAccount, ShortcutsDialog, SidebarAccount, SignOutDialog, WorkspaceSwitcher } from "./account"
import { AppearanceDrawer } from "./appearance"
import { CommandMenu } from "./command-menu"
import { Notifications } from "./notifications"
import { nav, type NavItem } from "./routes"
import { type Crumb, linkProps, useRouter } from "./router"
import { ShellStateProvider, useShellState } from "./shell-state"
import { type Appearance, useStore } from "./store"

const icon = { size: 16, strokeWidth: 1.75, "aria-hidden": true } as const

/* ------------------------------------------------------------------ the frame */

export function Shell({ crumbs, children }: { crumbs: Crumb[]; children: React.ReactNode }) {
  const { state, actions } = useStore()
  const a = state.appearance
  /* A rail by default between tablet and laptop widths; a column above. Nothing is remembered. */
  const [collapsed, setCollapsed] = React.useState(false)
  React.useEffect(() => {
    const query = window.matchMedia("(min-width: 768px) and (max-width: 1099px)")
    const follow = () => setCollapsed(query.matches)
    follow()
    query.addEventListener("change", follow)
    return () => query.removeEventListener("change", follow)
  }, [])

  return (
    <ShellStateProvider>
      <Direction dir={a.dir} onDirChange={(dir) => actions.setAppearance({ dir })} className="min-h-svh">
        <SidebarProvider
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
          mobileBreakpoint={768}
          data-sidebar-style={a.sidebar}
          data-density={a.density}
          style={densityVars(a)}
          className={cn(
            "group/shell min-h-svh w-full text-foreground",
            /* Inset: the sidebar sits on the shell's tone and the page is a raised sheet. */
            "bg-background data-[sidebar-style=inset]:not-data-mobile:bg-[color-mix(in_oklab,var(--muted)_55%,var(--background))] dark:data-[sidebar-style=inset]:not-data-mobile:bg-card",
          )}
        >
          <SkipLink />
          <AppSidebar />
          <SidebarInset
            render={<div />}
            className={cn(
              "flex min-h-svh flex-col",
              "group-data-[sidebar-style=inset]/shell:group-not-data-mobile/shell:my-2 group-data-[sidebar-style=inset]/shell:group-not-data-mobile/shell:me-2 group-data-[sidebar-style=inset]/shell:group-not-data-mobile/shell:min-h-[calc(100svh-1rem)]",
              "group-data-[sidebar-style=inset]/shell:group-not-data-mobile/shell:rounded-[14px] group-data-[sidebar-style=inset]/shell:group-not-data-mobile/shell:shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04)] dark:group-data-[sidebar-style=inset]/shell:group-not-data-mobile/shell:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]",
            )}
          >
            <Header crumbs={crumbs} />
            <main id="content" tabIndex={-1} className="mx-auto w-full max-w-[1280px] flex-1 px-[var(--br-page-x)] pt-[var(--br-page-top)] pb-16 outline-none">
              <Replay>{children}</Replay>
            </main>
          </SidebarInset>
          <ShellPanels />
        </SidebarProvider>
      </Direction>
      <ProgressLine />
    </ShellStateProvider>
  )
}

/* The page, mounted afresh when the motion style or speed changed, so its numbers count up and its charts
   grow again in the new style. Page state that matters (filters, tabs, the period) lives in the address
   or the store, so nothing is lost. */
function Replay({ children }: { children: React.ReactNode }) {
  const { replay } = useShellState()
  return <React.Fragment key={replay}>{children}</React.Fragment>
}

/* Spacing that density changes. Pages read these too. */
function densityVars(a: Appearance) {
  const compact = a.density === "compact"
  return {
    "--br-page-x": compact ? "1rem" : "clamp(1rem, 3vw, 2rem)",
    "--br-page-top": compact ? "1rem" : "1.75rem",
    "--br-gap": compact ? "0.75rem" : "1rem",
    "--br-section": compact ? "1.25rem" : "1.75rem",
    "--sidebar-height": compact ? "1.75rem" : "2rem",
    "--sidebar-width": "16rem",
    "--sidebar-width-collapsed": "3.5rem",
    "--sidebar-width-mobile": "18rem",
    "--stat-padding": compact ? "1rem" : "1.25rem",
    "--stat-value-size": compact ? "24px" : "28px",
    "--card-padding": compact ? "1rem" : "1.25rem",
  } as React.CSSProperties
}

function SkipLink() {
  return (
    <Button
      size="sm"
      render={<a href="#content" />}
      className="pointer-events-none fixed top-2 start-2 z-[60] opacity-0 focus-visible:pointer-events-auto focus-visible:opacity-100"
    >
      Skip to content
    </Button>
  )
}

/** A thin line across the top that runs on every navigation. */
function ProgressLine() {
  const { visits } = useRouter()
  if (!visits) return null
  return (
    <>
      <style href="br-progress" precedence="default">
        {"@keyframes br-progress{0%{scale:0 1;opacity:1}70%{scale:.92 1;opacity:1}100%{scale:1 1;opacity:0}}"}
      </style>
      <div
        key={visits}
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-0.5 origin-left bg-[var(--chart-1)] opacity-0 animate-[br-progress_calc(620ms*var(--kf-speed,1))_var(--ease-house)_forwards] rtl:origin-right motion-reduce:hidden"
      />
    </>
  )
}

/** The drawer and dialogs the header, menus and keyboard open. */
function ShellPanels() {
  const { open, setOpen } = useShellState()
  const { toggle } = useSidebar()
  useShortcut("mod+b", () => toggle())
  useShortcut("mod+k", () => setOpen("command", !open.command))
  return (
    <>
      <CommandMenu onToggleSidebar={toggle} />
      <AppearanceDrawer open={open.appearance} onOpenChange={(next) => setOpen("appearance", next)} />
      <ShortcutsDialog />
      <SignOutDialog />
      <AgentConfirm />
    </>
  )
}

/* ------------------------------------------------------------------ the sidebar */

function AppSidebar() {
  const { state } = useStore()
  const router = useRouter()
  const groups = nav.map((g) => ({ ...g, items: g.items.filter((item) => router.exists(item.to)) })).filter((g) => g.items.length)
  return (
    <Sidebar
      aria-label="Main navigation"
      className={cn(
        "sticky top-0 h-svh data-mobile:fixed data-mobile:h-svh",
        /* Right to left: the sheet comes in from the right. */
        "rtl:data-mobile:right-0 rtl:data-mobile:left-auto rtl:data-mobile:translate-x-[calc(100%+48px)] rtl:data-mobile:data-open:translate-x-0",
        "rtl:not-data-mobile:shadow-[inset_1px_0_0_rgb(0_0_0/0.07)] dark:rtl:not-data-mobile:shadow-[inset_1px_0_0_rgb(255_255_255/0.07)]",
        "group-data-[sidebar-style=inset]/shell:not-data-mobile:bg-transparent group-data-[sidebar-style=inset]/shell:not-data-mobile:shadow-none",
        "group-data-[sidebar-style=floating]/shell:not-data-mobile:m-2 group-data-[sidebar-style=floating]/shell:not-data-mobile:h-[calc(100svh-1rem)] group-data-[sidebar-style=floating]/shell:not-data-mobile:top-2 group-data-[sidebar-style=floating]/shell:not-data-mobile:rounded-[14px]",
        "group-data-[sidebar-style=floating]/shell:not-data-mobile:bg-background group-data-[sidebar-style=floating]/shell:not-data-mobile:shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_6px_-2px_rgb(0_0_0/0.08),0_12px_32px_-12px_rgb(0_0_0/0.16)]",
        "dark:group-data-[sidebar-style=floating]/shell:not-data-mobile:bg-card dark:group-data-[sidebar-style=floating]/shell:not-data-mobile:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_12px_32px_-12px_rgb(0_0_0/0.7)]",
      )}
    >
      <SidebarHeader className="h-auto px-2 pt-2 pb-1">
        <WorkspaceSwitcher />
      </SidebarHeader>
      <SidebarContent className="pt-2">
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <NavEntry key={item.to} item={item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarAccount />
      </SidebarFooter>
    </Sidebar>
  )
}

const isActive = (path: string, to: string) => path === to || (to !== "/" && path.startsWith(`${to}/`))

/** One page in the sidebar, with its sub-pages: a fold-out list when the sidebar is open, a flyout menu on the rail. */
function NavEntry({ item }: { item: NavItem }) {
  const { state } = useStore()
  const router = useRouter()
  const sidebar = useSidebar()
  const rail = sidebar.collapsed && !sidebar.isMobile
  const children = (item.children ?? []).filter((child) => router.exists(child.to))
  const Glyph = item.icon
  const count = item.badge?.(state) ?? 0
  const activeChild = children.find((child) => (child.to === item.to ? router.path === child.to : isActive(router.path, child.to)))
  const [open, setOpen] = React.useState(!!activeChild)
  React.useEffect(() => {
    if (activeChild) setOpen(true)
  }, [activeChild])

  const face = (
    <>
      {Glyph && <Glyph {...icon} className="rtl:[&.lucide-chevron-right]:-scale-x-100" />}
      <SidebarLabel>{item.label}</SidebarLabel>
      {count > 0 && <SidebarMenuBadge aria-label={`${count} to do`}>{count}</SidebarMenuBadge>}
    </>
  )

  /* A page with no sub-pages: a link. On the rail it names itself in a tooltip. */
  if (!children.length) {
    const button = <SidebarMenuButton isActive={isActive(router.path, item.to)} {...linkProps(router, item.to)} href={router.href(item.to)} aria-label={rail ? item.label : undefined} />
    return (
      <SidebarMenuItem>
        {rail ? (
          <Tooltip>
            <TooltipTrigger render={button}>{face}</TooltipTrigger>
            <TooltipContent side="right">{count > 0 ? `${item.label} · ${count}` : item.label}</TooltipContent>
          </Tooltip>
        ) : (
          React.cloneElement(button, {}, face)
        )}
      </SidebarMenuItem>
    )
  }

  /* On the rail: the parent opens a flyout of its sub-pages. */
  if (rail)
    return (
      <SidebarMenuItem>
        <Menu>
          <MenuTrigger aria-label={item.label} render={<SidebarMenuButton isActive={!!activeChild} />}>
            {face}
          </MenuTrigger>
          <MenuContent side="right" align="start" className="w-56">
            <MenuGroup>
              <MenuGroupLabel>{item.label}</MenuGroupLabel>
              {children.map((child) => (
                <MenuItem key={child.to} render={<a {...linkProps(router, child.to)} aria-current={child === activeChild ? "page" : undefined} />}>
                  {child.label}
                </MenuItem>
              ))}
            </MenuGroup>
          </MenuContent>
        </Menu>
      </SidebarMenuItem>
    )

  /* Open: the parent folds its sub-pages out under it. */
  return (
    <SidebarMenuItem>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTriggerPart render={<SidebarMenuButton className="group/nav-parent" />}>
          {face}
          <ChevronRight {...icon} className="ms-auto size-3.5 text-muted-foreground transition-[rotate] duration-[calc(380ms*var(--kf-speed,1))] ease-spring group-data-[panel-open]/nav-parent:rotate-90 rtl:-scale-x-100 motion-reduce:transition-none" />
        </CollapsibleTriggerPart>
        <CollapsiblePanel>
          <SidebarMenu className="relative ms-[1.375rem] mt-px border-s border-border ps-2">
            {children.map((child) => (
              <SidebarMenuItem key={child.to}>
                <SidebarMenuButton isActive={child === activeChild} {...linkProps(router, child.to)} href={router.href(child.to)} className="h-7 text-[12.5px]">
                  <SidebarLabel>{child.label}</SidebarLabel>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </CollapsiblePanel>
      </Collapsible>
    </SidebarMenuItem>
  )
}

/* ------------------------------------------------------------------ the header */

function Header({ crumbs }: { crumbs: Crumb[] }) {
  const { state } = useStore()
  const router = useRouter()
  const { setOpen } = useShellState()
  const [scrolled, setScrolled] = React.useState(false)
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      data-scrolled={scrolled ? "" : undefined}
      className={cn(
        "sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 px-[calc(var(--br-page-x)-0.375rem)]",
        "transition-[background-color,box-shadow,backdrop-filter] duration-[calc(200ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none",
        "group-data-[sidebar-style=inset]/shell:group-not-data-mobile/shell:rounded-t-[14px]",
        "data-scrolled:bg-[color-mix(in_oklab,var(--background)_82%,transparent)] data-scrolled:shadow-[0_1px_0_var(--border)] data-scrolled:backdrop-blur-md",
      )}
    >
      <SidebarTrigger className="rtl:[&_svg]:-scale-x-100" />
      <Separator orientation="vertical" className="mx-1 h-4 self-center" />
      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList className="flex-nowrap">
          <BreadcrumbItem className="hidden min-w-0 sm:inline-flex">
            <BreadcrumbLink {...linkProps(router, "/")} className="truncate">
              {state.settings.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
          {crumbs.map((crumb, i) => (
            <React.Fragment key={`${crumb.label}-${i}`}>
              <BreadcrumbSeparator className={cn(i === crumbs.length - 1 ? "hidden sm:inline-flex" : "hidden md:inline-flex", "rtl:[&_svg]:-scale-x-100")} />
              <BreadcrumbItem className={cn("min-w-0", i < crumbs.length - 1 && "hidden md:inline-flex")}>
                {i === crumbs.length - 1 || !crumb.to ? (
                  <BreadcrumbPage className="truncate">{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink {...linkProps(router, crumb.to)} className="truncate">
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          aria-label="Search and commands"
          aria-keyshortcuts="Meta+K Control+K"
          onClick={() => setOpen("command", true)}
          className="hidden w-[13.5rem] justify-start gap-2 bg-muted/60 px-2.5 font-normal text-muted-foreground shadow-[inset_0_0_0_1px_rgb(0_0_0/0.06)] hover:text-foreground md:inline-flex dark:bg-muted/50 dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06)] lg:w-[15rem]"
        >
          <Search {...icon} />
          <span className="flex-1 text-start">Search…</span>
          <KbdCombo keys={["mod", "k"]} />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Search and commands" onClick={() => setOpen("command", true)} className="md:hidden">
          <Search {...icon} />
        </Button>
        <Notifications />
        <ThemeMenu />
        <Button variant="ghost" size="icon" aria-label="Appearance settings" onClick={() => setOpen("appearance", true)} className="hidden sm:inline-flex">
          <SlidersHorizontal {...icon} />
        </Button>
        <Separator orientation="vertical" className="mx-1.5 hidden h-4 self-center sm:block" />
        <HeaderAccount />
      </div>
    </header>
  )
}

function ThemeMenu() {
  const { state, actions } = useStore()
  const theme = state.appearance.theme
  const Glyph = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor
  return (
    <Menu>
      <MenuTrigger aria-label={`Theme: ${theme}`} render={<Button variant="ghost" size="icon" className="hidden sm:inline-flex" />}>
        <Glyph {...icon} />
      </MenuTrigger>
      <MenuContent align="end" className="w-40">
        <MenuRadioGroup value={theme} onValueChange={(value) => actions.setAppearance({ theme: value as Appearance["theme"] })}>
          <MenuRadioItem value="light" label="Light">
            <Sun {...icon} className="text-muted-foreground" />
            Light
          </MenuRadioItem>
          <MenuRadioItem value="dark" label="Dark">
            <Moon {...icon} className="text-muted-foreground" />
            Dark
          </MenuRadioItem>
          <MenuRadioItem value="system" label="System">
            <Monitor {...icon} className="text-muted-foreground" />
            System
          </MenuRadioItem>
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  )
}
