import { Menu, Menubar, MenuContent, MenuItem, MenuTrigger } from "@/components/ui/menubar"

export default function Usage() {
  return (
    <Menubar aria-label="App">
      <Menu>
        <MenuTrigger>File</MenuTrigger>
        <MenuContent>
          <MenuItem value="new">New</MenuItem>
        </MenuContent>
      </Menu>
    </Menubar>
  )
}
