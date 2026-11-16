// Submenu
// `MenuSub` opens beside its item on hover, or with the right arrow key.
import { Menu, MenuContent, MenuItem, MenuSub, MenuSubContent, MenuSubTrigger, MenuTrigger } from "@/components/ui/menu"

export default function MenuSubmenu() {
  return (
    <Menu>
      <MenuTrigger>File</MenuTrigger>
      <MenuContent className="w-48">
        <MenuItem value="new">New</MenuItem>
        <MenuItem value="open">Open…</MenuItem>
        <MenuSub>
          <MenuSubTrigger>Export as</MenuSubTrigger>
          <MenuSubContent className="w-40">
            <MenuItem value="pdf">PDF</MenuItem>
            <MenuItem value="png">PNG</MenuItem>
            <MenuItem value="csv">CSV</MenuItem>
          </MenuSubContent>
        </MenuSub>
      </MenuContent>
    </Menu>
  )
}
