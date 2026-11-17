"use client"

/* Animated context menu for `@ui-sdk/react/menu`: a menu opened by a right-click, a long press or
   Shift+F10 on a `MenuContextTrigger`. It is the animated menu primitive (same sheet, same gliding
   highlight, same row cascade, same drawn checks), so everything from `@/components/primitives/menu`
   passes through, and the parts are also exported under ContextMenu* names.

   The one difference is the unfold. A context menu has no trigger to grow out of: UI SDK anchors it
   to the press point and puts that point in `--transform-origin`. So the sheet starts smaller (0.6),
   does not slide toward a trigger, and grows straight out of the pointer. */

import {
  Menu,
  MenuCheckboxItem,
  MenuContent as MenuContentPart,
  MenuContextTrigger,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuItemIcon,
  MenuItemIndicator,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuShortcut,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
} from "@/components/primitives/menu"
import * as React from "react"

import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export * from "@/components/primitives/menu"

/* Unfold from the point: no travel, a deeper scale and blur, the same spring in and quick fade out. */
const contextMenuMotion = cn(
  "data-starting-style:[translate:0_0] data-starting-style:scale-[0.6] data-starting-style:blur-[8px]",
  "data-ending-style:scale-[0.94]",
  /* Reduced motion: appear in place, no scale or blur. */
  "motion-reduce:data-starting-style:scale-100 motion-reduce:data-starting-style:blur-none motion-reduce:data-ending-style:scale-100",
)

function ContextMenuContent<Payload = unknown>({
  className,
  ...props
}: React.ComponentProps<typeof MenuContentPart<Payload>>) {
  return <MenuContentPart<Payload> className={withClass(contextMenuMotion, className)} {...props} />
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
  contextMenuMotion,
  MenuRadioGroup as ContextMenuRadioGroup,
  MenuRadioItem as ContextMenuRadioItem,
  MenuSeparator as ContextMenuSeparator,
  MenuShortcut as ContextMenuShortcut,
  MenuSub as ContextMenuSub,
  MenuSubContent as ContextMenuSubContent,
  MenuSubTrigger as ContextMenuSubTrigger,
  MenuContextTrigger as ContextMenuTrigger,
}
