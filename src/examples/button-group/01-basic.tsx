// Basic
// Buttons inside join into one strip, and one highlight glides between them under the pointer or keyboard focus.
import { Minus, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group"

export default function ButtonGroupBasic() {
  return (
    <ButtonGroup aria-label="Guests">
      <Button size="icon" aria-label="One fewer guest">
        <Minus />
      </Button>
      <ButtonGroupText className="w-20 justify-center tabular-nums">2 guests</ButtonGroupText>
      <Button size="icon" aria-label="One more guest">
        <Plus />
      </Button>
    </ButtonGroup>
  )
}
