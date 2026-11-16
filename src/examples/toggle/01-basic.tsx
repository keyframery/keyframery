// On and off
// A button that stays pressed. `ToggleIcon` animates the icon as it turns on.
import { Pin, Star } from "lucide-react"

import { Toggle, ToggleIcon } from "@/components/ui/toggle"

export default function ToggleBasic() {
  return (
    <div className="flex gap-2">
      <Toggle defaultPressed>
        <ToggleIcon>
          <Pin />
        </ToggleIcon>
        Pinned
      </Toggle>
      <Toggle size="icon" aria-label="Favourite">
        <ToggleIcon>
          <Star />
        </ToggleIcon>
      </Toggle>
    </div>
  )
}
