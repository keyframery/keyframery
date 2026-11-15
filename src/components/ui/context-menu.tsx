"use client"

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
import { cn } from "@/lib/utils"

/* Opens right at the pointer, so only a hair of offset. */
function ContextMenuContent<Payload = unknown>({
  className,
  sideOffset = 2,
  ...props
}: React.ComponentProps<typeof MenuContent<Payload>>) {
  return <MenuContent<Payload> sideOffset={sideOffset} className={cn(contextMenuMotion, className)} {...props} />
}

export {
  Menu as ContextMenu,
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
  MenuSubContent as ContextMenuSubContent,
  MenuSubTrigger as ContextMenuSubTrigger,
  MenuContextTrigger as ContextMenuTrigger,
}
