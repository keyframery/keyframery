// With an icon
// Wrap a leading icon in `ButtonIcon` so it moves with the label. `ButtonArrow` draws a trailing arrow that nudges forward on hover.
import { Download } from "lucide-react"

import { Button, ButtonArrow, ButtonIcon } from "@/components/ui/button"

export default function ButtonWithIcon() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Button>
        <ButtonIcon>
          <Download />
        </ButtonIcon>
        Export
      </Button>
      <Button variant="primary">
        Continue
        <ButtonArrow />
      </Button>
    </div>
  )
}
