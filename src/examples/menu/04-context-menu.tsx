// Context menu
// Use `MenuContextTrigger` instead of a button. Right-click the area, or long-press it on a touch screen: the menu opens at the pointer and unfolds out of it. `tabIndex` lets Shift+F10 open it from the keyboard.
import { Copy, Pencil, Trash2 } from "lucide-react"

import {
  Menu,
  MenuContent,
  MenuContextTrigger,
  MenuItem,
  MenuItemIcon,
  MenuSeparator,
  MenuShortcut,
} from "@/components/ui/menu"

export default function MenuContextMenu() {
  return (
    <Menu>
      <MenuContextTrigger
        tabIndex={0}
        className="grid h-[160px] w-full max-w-[340px] place-items-center rounded-[14px] border border-dashed text-[13px] text-muted-foreground"
      >
        Right-click here
      </MenuContextTrigger>
      <MenuContent className="w-48">
        <MenuItem value="rename">
          <MenuItemIcon>
            <Pencil />
          </MenuItemIcon>
          Rename
        </MenuItem>
        <MenuItem value="duplicate" shortcut="mod+d">
          <MenuItemIcon>
            <Copy />
          </MenuItemIcon>
          Duplicate
          <MenuShortcut />
        </MenuItem>
        <MenuSeparator />
        <MenuItem value="delete" destructive>
          <MenuItemIcon>
            <Trash2 />
          </MenuItemIcon>
          Delete
        </MenuItem>
      </MenuContent>
    </Menu>
  )
}
