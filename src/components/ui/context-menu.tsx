"use client"

export * from "@/components/primitives/context-menu"

/* Theming: set on a part or its ancestor; unset variables preserve the original theme.
   --context-menu-face: Menu sheet surface (default: --popover).
   --context-menu-ink: Menu text (default: --popover-foreground).
   --context-menu-accent: Row highlight (default: --accent).
   --context-menu-danger: Destructive row text and highlight (default: --destructive).
   --context-menu-radius: Sheet corners (default: 14px).
   --context-menu-item-radius: Row corners (default: 8px).
   --context-menu-row-height: Minimum row height (default: 2rem).
 */

/* Styled context menu: the styled menu (same sheet, rows, highlight and checks) with the
   context-menu unfold from `@/components/primitives/context-menu`. */

import * as React from "react"

import { contextMenuMotion } from "@/components/primitives/context-menu"
import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuContextTrigger,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuItemIcon,
  MenuItemIndicator,
  MenuItems,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuShortcut,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
} from "@/components/ui/menu"
import { useSpeedStyle } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

const contextTheme = "[--menu-surface:var(--context-menu-face,var(--popover))] [--menu-ink:var(--context-menu-ink,var(--popover-foreground))] [--menu-highlight:var(--context-menu-accent,var(--accent))] [--menu-danger:var(--context-menu-danger,var(--destructive))] [--menu-radius:var(--context-menu-radius,14px)] [--menu-item-radius:var(--context-menu-item-radius,8px)] [--menu-row-height:var(--context-menu-row-height,2rem)]"

function ContextMenuSubContent<Payload = unknown>({ className, ...props }: React.ComponentProps<typeof MenuSubContent<Payload>>) {
  return <MenuSubContent<Payload> className={withClass(contextTheme, className)} {...props} />
}

/* Supply our sheet for the shared menu's data shorthand as well as composed content. */
function ContextMenu({ children, ...props }: React.ComponentProps<typeof Menu>) {
  const hasContent = React.Children.toArray(children).some(
    (child) => React.isValidElement(child) && (child.type === ContextMenuContent || child.type === MenuContent),
  )
  return (
    <Menu {...props}>
      {children}
      {props.items && !hasContent ? (
        <MenuContent className={contextTheme} />
      ) : null}
    </Menu>
  )
}

/* Opens right at the pointer, so only a hair of offset. */
function ContextMenuContent<Payload = unknown>({
  className,
  sideOffset = 2,
  style,
  ...props
}: React.ComponentProps<typeof MenuContent<Payload>>) {
  return <MenuContent<Payload> sideOffset={sideOffset} className={withClass(
    cn(
      contextMenuMotion, contextTheme,
    ),
    className,
  )} {...props} style={useSpeedStyle(style)} />
}

export {
  ContextMenu,
  MenuCheckboxItem as ContextMenuCheckboxItem,
  ContextMenuContent,
  MenuGroup as ContextMenuGroup,
  MenuGroupLabel as ContextMenuGroupLabel,
  MenuItem as ContextMenuItem,
  MenuItemIcon as ContextMenuItemIcon,
  MenuItemIndicator as ContextMenuItemIndicator,
  MenuItems as ContextMenuItems,
  MenuRadioGroup as ContextMenuRadioGroup,
  MenuRadioItem as ContextMenuRadioItem,
  MenuSeparator as ContextMenuSeparator,
  MenuShortcut as ContextMenuShortcut,
  MenuSub as ContextMenuSub,
  ContextMenuSubContent,
  MenuSubTrigger as ContextMenuSubTrigger,
  MenuContextTrigger as ContextMenuTrigger,
}
