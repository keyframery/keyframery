"use client"

export * from "@/components/primitives/sidebar"

/* Styled sidebar: the animated primitive plus the Keyframery look. A group can fold away with the
   collapsible's height and cascade: pass `collapsible` (and `defaultOpen`) to SidebarGroup. */

/* Theming: inherit these optional variables; unset values retain the original light/dark tokens.
   --sidebar-face: Sidebar surface (default: --muted at 45%; --card in dark).
   --sidebar-ink: Labels and text (default: --muted-foreground; --foreground for active text).
   --sidebar-key: Selected page surface (default: --background; --accent in dark).
   --sidebar-radius: Menu key corners (default: 9px).
   --sidebar-height: Menu item height (default: 2rem).
   --sidebar-width: Expanded sidebar width (default: 15rem).
   --sidebar-width-collapsed: Collapsed rail width (default: 3.5rem).
   --sidebar-width-mobile: Mobile sheet width (default: 17rem).
 */

import * as React from "react"

import {
  Collapsible as CollapsibleRoot,
  CollapsiblePanel as CollapsiblePanelPart,
  CollapsibleTrigger as CollapsibleTriggerPart,
} from "@/components/primitives/collapsible"
import {
  Sidebar as SidebarRoot,
  SidebarContent as SidebarContentPart,
  SidebarFooter as SidebarFooterPart,
  SidebarGroup as SidebarGroupPart,
  SidebarGroupContent as SidebarGroupContentPart,
  SidebarGroupLabel as SidebarGroupLabelPart,
  SidebarHeader as SidebarHeaderPart,
  SidebarInset as SidebarInsetPart,
  SidebarLabel,
  SidebarMenu as SidebarMenuPart,
  SidebarMenuBadge as SidebarMenuBadgePart,
  SidebarMenuButton as SidebarMenuButtonPart,
  SidebarMenuItem,
  SidebarProvider as SidebarProviderPart,
  SidebarTrigger as SidebarTriggerPart,
  useSidebar,
} from "@/components/primitives/sidebar"
import { type SpeedProps, withSpeed } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* Adds the look to a `className` that may be a function of the part's state. */
function look<S>(className: string | ((state: S) => string | undefined) | undefined, ...base: string[]) {
  return typeof className === "function" ? (state: S) => cn(...base, className(state)) : cn(...base, className)
}

const GroupContext = React.createContext(false)

function SidebarProvider({ speed, style, ...props }: React.ComponentProps<typeof SidebarProviderPart> & SpeedProps) {
  return <SidebarProviderPart style={withSpeed(style, speed)} {...props} />
}

function Sidebar({ className, ...props }: React.ComponentProps<typeof SidebarRoot>) {
  return (
    <SidebarRoot
      className={look(
        className,
        "bg-[var(--sidebar-face,color-mix(in_oklab,var(--muted)_45%,transparent))] text-[color:var(--sidebar-ink,var(--foreground))] shadow-[inset_-1px_0_0_rgb(0_0_0/0.07)] dark:bg-[var(--sidebar-face,var(--card))] dark:shadow-[inset_-1px_0_0_rgb(255_255_255/0.07)]",
        /* As a sheet over the page it is the same tone, made opaque, and lifts off with a shadow. */
        "data-mobile:bg-[var(--sidebar-face,color-mix(in_oklab,var(--muted)_45%,var(--background)))] data-mobile:shadow-[inset_-1px_0_0_rgb(0_0_0/0.07),16px_0_40px_-16px_rgb(0_0_0/0.3)] dark:data-mobile:bg-card dark:data-mobile:shadow-[inset_-1px_0_0_rgb(255_255_255/0.07),16px_0_40px_-12px_rgb(0_0_0/0.7)]",
      )}
      {...props}
    />
  )
}

function SidebarHeader({ className, ...props }: React.ComponentProps<typeof SidebarHeaderPart>) {
  return <SidebarHeaderPart className={look(className, "flex h-12 shrink-0 items-center gap-2 px-2")} {...props} />
}

/* The key is the same surface as a selected tab: it lifts off the sidebar's well. */
function SidebarContent({ className, ...props }: React.ComponentProps<typeof SidebarContentPart>) {
  return (
    <SidebarContentPart
      className={look(
        className,
        "flex flex-col gap-4 overflow-x-hidden overflow-y-auto px-2 py-1",
        "before:rounded-[var(--sidebar-radius,9px)] before:bg-[var(--sidebar-key,var(--background))] before:shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)]",
        "dark:before:bg-[var(--sidebar-key,var(--accent))] dark:before:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
      )}
      {...props}
    />
  )
}

function SidebarGroup({
  className,
  collapsible,
  defaultOpen = true,
  open,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof SidebarGroupPart> & {
  /** The label becomes a trigger that folds the group away. */
  collapsible?: boolean
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const group = <SidebarGroupPart className={look(className, "flex flex-col")} {...props} />
  if (!collapsible) return group
  return (
    <GroupContext.Provider value>
      <CollapsibleRoot defaultOpen={defaultOpen} open={open} onOpenChange={onOpenChange}>
        {group}
      </CollapsibleRoot>
    </GroupContext.Provider>
  )
}

const labelLook = "flex h-7 w-full items-center gap-1 rounded-[8px] px-3 text-[11px] leading-none font-medium whitespace-nowrap text-[color:var(--sidebar-ink,var(--muted-foreground))]"

function SidebarGroupLabel({ className, children, ...props }: React.ComponentProps<typeof SidebarGroupLabelPart>) {
  const collapsible = React.useContext(GroupContext)
  if (!collapsible)
    return (
      <SidebarGroupLabelPart className={look(className, labelLook)} {...props}>
        {children}
      </SidebarGroupLabelPart>
    )
  return (
    <SidebarGroupLabelPart className={className} {...props}>
      <CollapsibleTriggerPart
        className={cn(
          labelLook,
          "group/sidebar-group cursor-pointer text-left outline-none select-none",
          "transition-[color,scale] duration-[calc(150ms*var(--kf-speed,1))] ease-house hover:text-[color:var(--sidebar-ink,var(--foreground))] active:scale-[0.98] motion-reduce:transition-none!",
          "focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        {typeof children === "function" ? children({}) : children}
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3 -rotate-90 transition-[rotate] duration-[calc(480ms*var(--kf-speed,1))] ease-spring group-data-open/sidebar-group:rotate-0 motion-reduce:transition-none!"
        >
          <path d="m4 6 4 4 4-4" />
        </svg>
      </CollapsibleTriggerPart>
    </SidebarGroupLabelPart>
  )
}

function SidebarGroupContent({ className, ...props }: React.ComponentProps<typeof SidebarGroupContentPart>) {
  const collapsible = React.useContext(GroupContext)
  const content = <SidebarGroupContentPart className={className} {...props} />
  return collapsible ? <CollapsiblePanelPart>{content}</CollapsiblePanelPart> : content
}

function SidebarMenu({ className, ...props }: React.ComponentProps<typeof SidebarMenuPart>) {
  return <SidebarMenuPart className={look(className, "flex flex-col gap-px")} {...props} />
}

/* 40px wide on the rail with the icon centred, so nothing moves sideways as the labels fold. */
function SidebarMenuButton({ className, ...props }: React.ComponentProps<typeof SidebarMenuButtonPart>) {
  return (
    <SidebarMenuButtonPart
      className={look(
        className,
        "flex h-[var(--sidebar-height,2rem)] w-full min-w-0 cursor-pointer items-center gap-2.5 rounded-[var(--sidebar-radius,9px)] px-3 text-left text-[13px] leading-none font-medium whitespace-nowrap text-[color:var(--sidebar-ink,var(--muted-foreground))] outline-none select-none",
        "not-data-active:hover:bg-foreground/[0.04] hover:text-[color:var(--sidebar-ink,var(--foreground))] data-active:text-[color:var(--sidebar-ink,var(--foreground))]",
        "focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-40",
        "[&>svg]:size-4 [&>svg]:shrink-0 [&>[data-slot=sidebar-label]]:min-w-0 [&>[data-slot=sidebar-label]]:flex-1 [&>[data-slot=sidebar-label]]:truncate",
      )}
      {...props}
    />
  )
}

function SidebarMenuBadge({ className, ...props }: React.ComponentProps<typeof SidebarMenuBadgePart>) {
  return (
    <SidebarMenuBadgePart
      className={look(
        className,
        "ml-auto grid h-[18px] min-w-[18px] shrink-0 place-items-center rounded-full bg-foreground/[0.07] px-1.5 text-[11px] leading-none font-medium text-[color:var(--sidebar-ink,var(--muted-foreground))] tabular-nums",
      )}
      {...props}
    />
  )
}

function SidebarTrigger({ className, children, ...props }: React.ComponentProps<typeof SidebarTriggerPart>) {
  return (
    <SidebarTriggerPart
      className={look(
        className,
        "grid size-8 shrink-0 cursor-pointer place-items-center rounded-[8px] text-[color:var(--sidebar-ink,var(--muted-foreground))] outline-none hover:bg-foreground/[0.05] hover:text-[color:var(--sidebar-ink,var(--foreground))]",
        "focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4",
      )}
      {...props}
    >
      {children ?? (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="2" y="2.5" width="12" height="11" rx="2.5" />
          <path d="M6.5 2.5v11" />
        </svg>
      )}
    </SidebarTriggerPart>
  )
}

function SidebarFooter({ className, ...props }: React.ComponentProps<typeof SidebarFooterPart>) {
  return (
    <SidebarFooterPart
      className={look(className, "shrink-0 p-2 shadow-[inset_0_1px_0_rgb(0_0_0/0.06)] dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]")}
      {...props}
    />
  )
}

function SidebarInset({ className, ...props }: React.ComponentProps<typeof SidebarInsetPart>) {
  return <SidebarInsetPart className={look(className, "bg-background")} {...props} />
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
