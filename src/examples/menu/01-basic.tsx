// Icons and shortcuts
// `shortcut` shows the keys on the item and also runs it from the keyboard while the menu is open. `onAction` hears every choice.
import { Copy, Pencil, Share, Trash2 } from "lucide-react"
import * as React from "react"

import { Menu, MenuContent, MenuItem, MenuItemIcon, MenuSeparator, MenuShortcut, MenuTrigger } from "@/components/ui/menu"

export default function MenuBasic() {
  const [last, setLast] = React.useState<string | null>(null)
  return (
    <div className="flex flex-col items-center gap-3">
      <Menu onAction={(value) => setLast(String(value))}>
        <MenuTrigger>Actions</MenuTrigger>
        <MenuContent className="w-52">
          <MenuItem value="edit" shortcut="mod+e">
            <MenuItemIcon>
              <Pencil />
            </MenuItemIcon>
            Edit
            <MenuShortcut />
          </MenuItem>
          <MenuItem value="duplicate" shortcut="mod+d">
            <MenuItemIcon>
              <Copy />
            </MenuItemIcon>
            Duplicate
            <MenuShortcut />
          </MenuItem>
          <MenuItem value="share">
            <MenuItemIcon>
              <Share />
            </MenuItemIcon>
            Share…
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
      <span className="text-[12px] text-muted-foreground">{last ? `Chose “${last}”` : "Nothing chosen yet"}</span>
    </div>
  )
}
