import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/ui/menu"

export default function Usage() {
  return (
    <Menu>
      <MenuTrigger>Options</MenuTrigger>
      <MenuContent>
        <MenuItem value="edit">Edit</MenuItem>
        <MenuItem value="delete">Delete</MenuItem>
      </MenuContent>
    </Menu>
  )
}
