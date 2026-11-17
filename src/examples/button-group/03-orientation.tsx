// Vertical and nested
// `orientation="vertical"` stacks the buttons. Groups inside a group keep a gap between them.
import { Minus, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"

export default function ButtonGroupOrientation() {
  return (
    <ButtonGroup aria-label="Map controls">
      <ButtonGroup orientation="vertical" aria-label="Zoom">
        <Button size="icon" aria-label="Zoom in">
          <Plus />
        </Button>
        <Button size="icon" aria-label="Zoom out">
          <Minus />
        </Button>
      </ButtonGroup>
      <ButtonGroup orientation="vertical" aria-label="Map type">
        <Button size="sm">Map</Button>
        <Button size="sm">Satellite</Button>
      </ButtonGroup>
    </ButtonGroup>
  )
}
