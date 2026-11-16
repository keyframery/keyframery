"use client"

/* Styled sidebar: the animated primitive plus the Keyframery look. A group can fold away with the
   collapsible's height and cascade: pass `collapsible` (and `defaultOpen`) to SidebarGroup. */

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
  SidebarProvider,
  SidebarTrigger as SidebarTriggerPart,
  useSidebar,
} from "@/components/primitives/sidebar"
import { cn } from "@/lib/utils"

const GroupContext = React.createContext(false)

function Sidebar({ className, ...props }: React.ComponentProps<typeof SidebarRoot>) {
  return (
    <SidebarRoot
      className={cn(
        "bg-muted/45 text-foreground shadow-[inset_-1px_0_0_rgb(0_0_0/0.07)] dark:bg-card dark:shadow-[inset_-1px_0_0_rgb(255_255_255/0.07)]",
        /* As a sheet over the page it is the same tone, made opaque, and lifts off with a shadow. */
        "data-mobile:bg-[color-mix(in_oklab,var(--muted)_45%,var(--background))] data-mobile:shadow-[inset_-1px_0_0_rgb(0_0_0/0.07),16px_0_40px_-16px_rgb(0_0_0/0.3)] dark:data-mobile:bg-card dark:data-mobile:shadow-[inset_-1px_0_0_rgb(255_255_255/0.07),16px_0_40px_-12px_rgb(0_0_0/0.7)]",
        className,
      )}
      {...props}
    />
  )
}

function SidebarHeader({ className, ...props }: React.ComponentProps<typeof SidebarHeaderPart>) {
  return <SidebarHeaderPart className={cn("flex h-12 shrink-0 items-center gap-2 px-2", className)} {...props} />
}

/* The key is the same surface as a selected tab: it lifts off the sidebar's well. */
function SidebarContent({ className, ...props }: React.ComponentProps<typeof SidebarContentPart>) {
  return (
    <SidebarContentPart
      className={cn(
        "flex flex-col gap-4 overflow-x-hidden overflow-y-auto px-2 py-1",
        "before:rounded-[9px] before:bg-background before:shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)]",
        "dark:before:bg-accent dark:before:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
        className,
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
  const group = <SidebarGroupPart className={cn("flex flex-col", className)} {...props} />
  if (!collapsible) return group
  return (
    <GroupContext.Provider value>
      <CollapsibleRoot defaultOpen={defaultOpen} open={open} onOpenChange={onOpenChange}>
        {group}
      </CollapsibleRoot>
    </GroupContext.Provider>
  )
}

const labelLook = "flex h-7 w-full items-center gap-1 rounded-[8px] px-3 text-[11px] leading-none font-medium whitespace-nowrap text-muted-foreground"

function SidebarGroupLabel({ className, children, ...props }: React.ComponentProps<typeof SidebarGroupLabelPart>) {
  const collapsible = React.useContext(GroupContext)
  if (!collapsible)
    return (
      <SidebarGroupLabelPart className={cn(labelLook, className)} {...props}>
        {children}
      </SidebarGroupLabelPart>
    )
  return (
    <SidebarGroupLabelPart className={cn(className)} {...props}>
      <CollapsibleTriggerPart
        className={cn(
          labelLook,
          "group/sidebar-group cursor-pointer text-left outline-none select-none",
          "transition-[color,scale] duration-[calc(150ms*var(--kf-speed,1))] ease-house hover:text-foreground active:scale-[0.98] motion-reduce:transition-none!",
          "focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        {children}
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
  const content = <SidebarGroupContentPart className={cn(className)} {...props} />
  return collapsible ? <CollapsiblePanelPart>{content}</CollapsiblePanelPart> : content
}

function SidebarMenu({ className, ...props }: React.ComponentProps<typeof SidebarMenuPart>) {
  return <SidebarMenuPart className={cn("flex flex-col gap-px", className)} {...props} />
}

/* 40px wide on the rail with the icon centred, so nothing moves sideways as the labels fold. */
function SidebarMenuButton({ className, ...props }: React.ComponentProps<typeof SidebarMenuButtonPart>) {
  return (
    <SidebarMenuButtonPart
      className={cn(
        "flex h-8 w-full min-w-0 cursor-pointer items-center gap-2.5 rounded-[9px] px-3 text-left text-[13px] leading-none font-medium whitespace-nowrap text-muted-foreground outline-none select-none",
        "not-data-active:hover:bg-foreground/[0.04] hover:text-foreground data-active:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-40",
        "[&>svg]:size-4 [&>svg]:shrink-0 [&>[data-slot=sidebar-label]]:min-w-0 [&>[data-slot=sidebar-label]]:flex-1 [&>[data-slot=sidebar-label]]:truncate",
        className,
      )}
      {...props}
    />
  )
}

function SidebarMenuBadge({ className, ...props }: React.ComponentProps<typeof SidebarMenuBadgePart>) {
  return (
    <SidebarMenuBadgePart
      className={cn(
        "ml-auto grid h-[18px] min-w-[18px] shrink-0 place-items-center rounded-full bg-foreground/[0.07] px-1.5 text-[11px] leading-none font-medium text-muted-foreground tabular-nums",
        className,
      )}
      {...props}
    />
  )
}

function SidebarTrigger({ className, children, ...props }: React.ComponentProps<typeof SidebarTriggerPart>) {
  return (
    <SidebarTriggerPart
      className={cn(
        "grid size-8 shrink-0 cursor-pointer place-items-center rounded-[8px] text-muted-foreground outline-none hover:bg-foreground/[0.05] hover:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4",
        className,
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
      className={cn("shrink-0 p-2 shadow-[inset_0_1px_0_rgb(0_0_0/0.06)] dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]", className)}
      {...props}
    />
  )
}

function SidebarInset({ className, ...props }: React.ComponentProps<typeof SidebarInsetPart>) {
  return <SidebarInsetPart className={cn("bg-background", className)} {...props} />
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
