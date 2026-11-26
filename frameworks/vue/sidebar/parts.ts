/* Shared pieces of the Vue sidebar: UI SDK parts made once from the shared core definition (the
   same file React uses), the instance handed down, and the motion (React primitive) and look
   (React ui layer) classes, in that order. */
import { computed, inject, type InjectionKey } from "vue"
import { createParts, type PrimitiveHandle } from "@ui-sdk/vue/primitive"

import { sidebar } from "@/components/keyframery/core/sidebar-core"
import { cn } from "@/lib/utils"

export const parts = createParts(sidebar, {
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

if (typeof document !== "undefined" && !document.getElementById("kf-sidebar")) {
  const style = document.createElement("style")
  style.id = "kf-sidebar"
  style.textContent = "@keyframes kf-sidebar-badge{from{scale:.6;opacity:0}}"
  document.head.append(style)
}

/* The instance, for `useSidebar`. */
export const handleKey: InjectionKey<PrimitiveHandle<typeof sidebar>> = Symbol("kf-sidebar")
/* Whether the group around is collapsible. */
export const groupKey: InjectionKey<() => boolean> = Symbol("kf-sidebar-group")

/** Collapsed state for the sidebar, its trigger and the page beside it. Reactive. */
export function useSidebar() {
  const handle = inject(handleKey, null)
  if (!handle) throw new Error("useSidebar must be used inside <SidebarProvider>.")
  const { api } = handle
  return {
    collapsed: computed(() => handle.state.collapsed),
    setCollapsed: (next: boolean) => void api.setCollapsed(next),
    /** Collapses to the rail, or on a narrow screen opens and closes the sheet. */
    toggle: () => void api.toggle(),
    /** The provider is narrower than its `mobileBreakpoint`: the sidebar is a sheet over the page. */
    isMobile: computed(() => handle.state.isMobile),
    openMobile: computed(() => handle.state.openMobile),
    setOpenMobile: (open: boolean) => void api.setOpenMobile(open),
  }
}

export const providerClass = "group/sidebar-provider relative flex"

export const scrimClass =
  "pointer-events-none absolute inset-0 z-30 bg-black/25 opacity-0 transition-opacity duration-[calc(260ms*var(--kf-speed,1))] ease-house data-open:pointer-events-auto data-open:opacity-100 data-open:duration-[calc(360ms*var(--kf-speed,1))] motion-reduce:transition-none dark:bg-black/50"

export const sidebarClass = cn(
  "group/sidebar flex w-(--sidebar-width,15rem) shrink-0 flex-col overflow-hidden",
  "data-collapsed:w-(--sidebar-width-collapsed,3.5rem)",
  "transition-[width] duration-[calc(420ms*var(--kf-speed,1))] ease-house data-collapsed:duration-[calc(340ms*var(--kf-speed,1))]",
  "data-mobile:absolute data-mobile:inset-y-0 data-mobile:left-0 data-mobile:z-40 data-mobile:w-(--sidebar-width-mobile,17rem) data-mobile:max-w-[85%] data-mobile:-translate-x-[calc(100%+48px)]",
  "data-mobile:transition-[translate] data-mobile:duration-[calc(280ms*var(--kf-speed,1))] data-mobile:data-open:translate-x-0 data-mobile:data-open:duration-[calc(440ms*var(--kf-speed,1))]",
  "motion-reduce:transition-none!",
  "bg-[var(--sidebar-face,color-mix(in_oklab,var(--muted)_45%,transparent))] text-[color:var(--sidebar-ink,var(--foreground))] shadow-[inset_-1px_0_0_rgb(0_0_0/0.07)] dark:bg-[var(--sidebar-face,var(--card))] dark:shadow-[inset_-1px_0_0_rgb(255_255_255/0.07)]",
  "data-mobile:bg-[var(--sidebar-face,color-mix(in_oklab,var(--muted)_45%,var(--background)))] data-mobile:shadow-[inset_-1px_0_0_rgb(0_0_0/0.07),16px_0_40px_-16px_rgb(0_0_0/0.3)] dark:data-mobile:bg-card dark:data-mobile:shadow-[inset_-1px_0_0_rgb(255_255_255/0.07),16px_0_40px_-12px_rgb(0_0_0/0.7)]",
)

export const triggerClass = cn(
  "transition-[scale] duration-[calc(260ms*var(--kf-speed,1))] ease-pop active:scale-[calc(1-0.1*var(--kf-flourish,1))] active:duration-[calc(100ms*var(--kf-speed,1))] motion-reduce:transition-none!",
  "grid size-8 shrink-0 cursor-pointer place-items-center rounded-[8px] text-[color:var(--sidebar-ink,var(--muted-foreground))] outline-none hover:bg-foreground/[0.05] hover:text-[color:var(--sidebar-ink,var(--foreground))]",
  "focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4",
)

export const headerClass = "flex h-12 shrink-0 items-center gap-2 px-2"
export const footerClass = "shrink-0 p-2 shadow-[inset_0_1px_0_rgb(0_0_0/0.06)] dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]"
export const insetClass = cn("min-w-0 flex-1", "bg-background")
export const menuClass = "flex flex-col gap-px"
export const groupClass = "flex flex-col"

/* Glide: the key is anchored to whichever button has data-active; it waits for data-ready. */
export const contentClass = cn(
  "relative isolate min-h-0 flex-1 [anchor-scope:--kf-sidebar-key]",
  "[&_[data-slot=sidebar-menu-button][data-active]]:[anchor-name:--kf-sidebar-key]",
  "before:pointer-events-none before:absolute before:-z-10 before:bg-[color-mix(in_oklch,currentColor_9%,transparent)]",
  "before:[position-anchor:--kf-sidebar-key] before:top-[anchor(top)] before:right-[anchor(right)] before:bottom-[anchor(bottom)] before:left-[anchor(left)]",
  "data-ready:before:[transition:top_calc(260ms*var(--kf-speed,1))_var(--ease-spring),right_calc(260ms*var(--kf-speed,1))_var(--ease-spring),bottom_calc(260ms*var(--kf-speed,1))_var(--ease-spring),left_calc(260ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(160ms*var(--kf-speed,1))_var(--ease-house)]",
  "not-has-[[data-slot=sidebar-menu-button][data-active]]:before:opacity-0 has-[[hidden]_[data-active]]:before:opacity-0",
  "motion-reduce:before:[transition:none]!",
  "flex flex-col gap-4 overflow-x-hidden overflow-y-auto px-2 py-1",
  "before:rounded-[var(--sidebar-radius,9px)] before:bg-[var(--sidebar-key,var(--background))] before:shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)]",
  "dark:before:bg-[var(--sidebar-key,var(--accent))] dark:before:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
)

/* Group labels fold to nothing on the rail. */
export const groupLabelMotion = cn(
  "transition-[opacity,filter,translate] duration-[calc(300ms*var(--kf-speed,1))] ease-house",
  "group-data-collapsed/sidebar:pointer-events-none group-data-collapsed/sidebar:-translate-x-[calc(0.25rem*var(--kf-flourish,1))] group-data-collapsed/sidebar:opacity-0 group-data-collapsed/sidebar:blur-[calc(3px*var(--kf-flourish,1))] group-data-collapsed/sidebar:duration-[calc(140ms*var(--kf-speed,1))]",
  "motion-reduce:transition-none!",
)
export const labelLook =
  "flex h-7 w-full items-center gap-1 rounded-[8px] px-3 text-[11px] leading-none font-medium whitespace-nowrap text-[color:var(--sidebar-ink,var(--muted-foreground))]"
export const groupTriggerClass = cn(
  labelLook,
  "group/sidebar-group cursor-pointer text-left outline-none select-none",
  "transition-[color,scale] duration-[calc(150ms*var(--kf-speed,1))] ease-house hover:text-[color:var(--sidebar-ink,var(--foreground))] active:scale-[calc(1-0.02*var(--kf-flourish,1))] motion-reduce:transition-none!",
  "focus-visible:ring-2 focus-visible:ring-ring",
)

/* The collapsible primitive's panel: height and cascade. */
export const collapsiblePanelClass = cn(
  "h-(--collapsible-panel-height) overflow-hidden",
  "transition-[height] duration-[calc(380ms*var(--kf-speed,1))] ease-house",
  "data-starting-style:h-0 data-ending-style:h-0 data-ending-style:duration-[calc(260ms*var(--kf-speed,1))]",
  "*:transition-[opacity,translate,filter] *:duration-[calc(420ms*var(--kf-speed,1))] *:ease-spring",
  "*:[transition-delay:calc((min(sibling-index(),10)-1)*calc(32ms*var(--kf-speed,1)*var(--kf-flourish,1))+calc(40ms*var(--kf-speed,1)*var(--kf-flourish,1)))]",
  "data-starting-style:*:translate-y-[calc(0.5rem*var(--kf-flourish,1))] data-starting-style:*:opacity-0 data-starting-style:*:blur-[calc(4px*var(--kf-flourish,1))] data-starting-style:*:transition-none",
  "data-ending-style:*:opacity-0 data-ending-style:*:blur-[calc(4px*var(--kf-flourish,1))] data-ending-style:*:duration-[calc(150ms*var(--kf-speed,1))] data-ending-style:*:ease-house data-ending-style:*:[transition-delay:0ms]",
  "motion-reduce:transition-none! motion-reduce:*:transition-none",
)

/* Text inside a button: leaves at once on collapse, rises back in after the width opens. */
const labelMotion = cn(
  "[&>[data-slot=sidebar-label]]:transition-[opacity,filter,translate] [&>[data-slot=sidebar-label]]:duration-[calc(320ms*var(--kf-speed,1))] [&>[data-slot=sidebar-label]]:ease-spring",
  "[&>[data-slot=sidebar-label]]:delay-[calc(140ms*var(--kf-speed,1))]",
  "group-data-collapsed/sidebar:[&>[data-slot=sidebar-label]]:-translate-x-[calc(0.25rem*var(--kf-flourish,1))] group-data-collapsed/sidebar:[&>[data-slot=sidebar-label]]:opacity-0 group-data-collapsed/sidebar:[&>[data-slot=sidebar-label]]:blur-[calc(3px*var(--kf-flourish,1))]",
  "group-data-collapsed/sidebar:[&>[data-slot=sidebar-label]]:delay-0 group-data-collapsed/sidebar:[&>[data-slot=sidebar-label]]:duration-[calc(120ms*var(--kf-speed,1))] group-data-collapsed/sidebar:[&>[data-slot=sidebar-label]]:ease-house",
  "motion-reduce:[&>[data-slot=sidebar-label]]:transition-none!",
)

export const menuButtonClass = cn(
  "[transition:color_calc(150ms*var(--kf-speed,1))_var(--ease-house),background-color_calc(150ms*var(--kf-speed,1))_var(--ease-house),scale_calc(260ms*var(--kf-speed,1))_var(--ease-pop)]",
  "active:scale-[calc(1-0.03*var(--kf-flourish,1))] active:[transition-duration:calc(100ms*var(--kf-speed,1))]",
  "motion-reduce:[transition:none]!",
  labelMotion,
  "flex h-[var(--sidebar-height,2rem)] w-full min-w-0 cursor-pointer items-center gap-2.5 rounded-[var(--sidebar-radius,9px)] px-3 text-left text-[13px] leading-none font-medium whitespace-nowrap text-[color:var(--sidebar-ink,var(--muted-foreground))] outline-none select-none",
  "not-data-active:hover:bg-foreground/[0.04] hover:text-[color:var(--sidebar-ink,var(--foreground))] data-active:text-[color:var(--sidebar-ink,var(--foreground))]",
  "focus-visible:ring-2 focus-visible:ring-ring",
  "disabled:pointer-events-none disabled:opacity-40",
  "[&>svg]:size-4 [&>svg]:shrink-0 [&>[data-slot=sidebar-label]]:min-w-0 [&>[data-slot=sidebar-label]]:flex-1 [&>[data-slot=sidebar-label]]:truncate",
)

export const badgeClass = cn(
  "transition-[opacity,scale] duration-[calc(260ms*var(--kf-speed,1))] ease-pop",
  "group-data-collapsed/sidebar:scale-[calc(0.95-0.45*var(--kf-flourish,1))] group-data-collapsed/sidebar:opacity-0 group-data-collapsed/sidebar:duration-[calc(120ms*var(--kf-speed,1))]",
  "motion-reduce:transition-none!",
  "ml-auto grid h-[18px] min-w-[18px] shrink-0 place-items-center rounded-full bg-foreground/[0.07] px-1.5 text-[11px] leading-none font-medium text-[color:var(--sidebar-ink,var(--muted-foreground))] tabular-nums",
)
