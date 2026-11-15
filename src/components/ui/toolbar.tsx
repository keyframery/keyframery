"use client"

/* Styled toolbar: the animated primitive plus the Keyframery look. */

import * as React from "react"

import {
  Toolbar as ToolbarRoot,
  ToolbarButton as ToolbarButtonPart,
  ToolbarGroup as ToolbarGroupPart,
  ToolbarInput as ToolbarInputPart,
  ToolbarLink as ToolbarLinkPart,
  ToolbarSeparator as ToolbarSeparatorPart,
  ToolbarToggle as TogglePart,
  ToolbarToggleGroup as ToggleGroupPart,
} from "@/components/primitives/toolbar"
import { cn } from "@/lib/utils"

/* One box for everything you can press in the bar: buttons, links and toggles. */
const item = cn(
  "relative inline-flex h-7 min-w-7 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-[8px] px-1.5",
  "text-[13px] leading-none font-medium whitespace-nowrap text-muted-foreground outline-none select-none",
  "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  "not-data-disabled:hover:text-foreground data-kf-toolbar-hl:not-data-disabled:text-foreground",
  "focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover",
  "data-disabled:cursor-not-allowed data-disabled:opacity-40",
)

const row =
  "flex items-center gap-0.5 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch"

function Toolbar({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarRoot>) {
  return (
    <ToolbarRoot
      className={cn(
        row,
        "w-fit rounded-[12px] bg-popover p-1 text-popover-foreground",
        /* The gliding highlight. */
        "before:rounded-[8px] before:bg-accent dark:before:bg-accent/70",
        "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_6px_-2px_rgb(0_0_0/0.08),0_12px_32px_-8px_rgb(0_0_0/0.18)]",
        "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_12px_32px_-8px_rgb(0_0_0/0.7)]",
        className,
      )}
      {...props}
    />
  )
}

function ToolbarButton({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarButtonPart>) {
  return (
    <ToolbarButtonPart
      className={cn(item, className)}
      {...props}
    />
  )
}

function ToolbarLink({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarLinkPart>) {
  return (
    <ToolbarLinkPart
      className={cn(item, "px-2", className)}
      {...props}
    />
  )
}

/* A toggle joins the bar's arrow keys on its own. Pressed, it becomes a key. */
function ToolbarToggle({
  className,
  ...props
}: React.ComponentProps<typeof TogglePart>) {
  return (
    <TogglePart
      className={cn(
        item,
        "data-pressed:bg-background data-pressed:text-foreground",
        "data-pressed:shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)]",
        "dark:data-pressed:bg-accent dark:data-pressed:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
        className,
      )}
      {...props}
    />
  )
}

function ToolbarToggleGroup<T extends string = string>({
  className,
  ...props
}: React.ComponentProps<typeof ToggleGroupPart<T>>) {
  return <ToggleGroupPart className={cn(row, className)} {...props} />
}

function ToolbarGroup({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarGroupPart>) {
  return <ToolbarGroupPart className={cn(row, className)} {...props} />
}

function ToolbarInput({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarInputPart>) {
  return (
    <ToolbarInputPart
      className={cn(
        "h-7 min-w-0 rounded-[8px] bg-background px-2 text-[13px] text-foreground outline-none placeholder:text-muted-foreground",
        "shadow-[0_0_0_1px_rgb(0_0_0/0.09),0_1px_2px_rgb(0_0_0/0.05)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1)]",
        "transition-shadow duration-[calc(150ms*var(--kf-speed,1))] motion-reduce:transition-none!",
        "not-data-disabled:hover:shadow-[0_0_0_1px_rgb(0_0_0/0.16),0_1px_2px_rgb(0_0_0/0.05)] dark:not-data-disabled:hover:shadow-[0_0_0_1px_rgb(255_255_255/0.18)]",
        "focus-visible:shadow-[0_0_0_1px_var(--ring)] focus-visible:ring-[3px] focus-visible:ring-ring/25",
        "dark:focus-visible:shadow-[0_0_0_1px_var(--ring)]",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
}

/* The line runs across the bar, so it stands upright in a horizontal one. */
function ToolbarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarSeparatorPart>) {
  return (
    <ToolbarSeparatorPart
      className={cn(
        "shrink-0 bg-border",
        "data-[orientation=vertical]:mx-1 data-[orientation=vertical]:h-4 data-[orientation=vertical]:w-px",
        "data-[orientation=horizontal]:my-1 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-4 data-[orientation=horizontal]:self-center",
        className,
      )}
      {...props}
    />
  )
}

export {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarInput,
  ToolbarLink,
  ToolbarSeparator,
  ToolbarToggle,
  ToolbarToggleGroup,
}
