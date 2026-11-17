// Split button
// A main action and a menu of the others share one key. `ButtonGroupSeparator` draws the line between them.
import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group"
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/ui/menu"

export default function ButtonGroupSplit() {
  return (
    <ButtonGroup aria-label="Publish">
      <Button variant="primary">Publish now</Button>
      <ButtonGroupSeparator className="bg-primary-foreground/25" />
      <Menu>
        <MenuTrigger render={<Button variant="primary" size="icon" aria-label="More ways to publish" />}>
          <ChevronDown />
        </MenuTrigger>
        <MenuContent align="end" className="w-52">
          <MenuItem value="schedule">Schedule for later</MenuItem>
          <MenuItem value="draft">Save as draft</MenuItem>
          <MenuItem value="preview">Share a preview link</MenuItem>
        </MenuContent>
      </Menu>
    </ButtonGroup>
  )
}
