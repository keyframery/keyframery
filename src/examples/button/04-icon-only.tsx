// Icon only
// The `icon` sizes make a square button. Give it an `aria-label`, since there is no text to read.
import { Pencil, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function ButtonIconOnly() {
  return (
    <div className="flex items-center justify-center gap-2">
      <Button size="icon-sm" aria-label="Edit">
        <Pencil />
      </Button>
      <Button size="icon" variant="ghost" aria-label="Delete">
        <Trash2 />
      </Button>
      <Button size="icon-lg" variant="primary" aria-label="Add">
        <Plus />
      </Button>
    </div>
  )
}
