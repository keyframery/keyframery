// Several choices
// `multiple` toggles items. Shift and arrow keys extend the selection.
import * as React from "react"

import { Listbox, ListboxItem, ListboxItemIndicator } from "@/components/ui/listbox"

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

export default function ListboxMultiple() {
  const [picked, setPicked] = React.useState<string[]>(["Monday", "Thursday"])
  return (
    <div className="flex w-full max-w-[220px] flex-col gap-2">
      <Listbox aria-label="Office days" multiple value={picked} onValueChange={setPicked}>
        {days.map((day) => (
          <ListboxItem key={day} value={day}>
            {day}
            <ListboxItemIndicator />
          </ListboxItem>
        ))}
      </Listbox>
      <span className="text-[12px] text-muted-foreground">{picked.length} days a week</span>
    </div>
  )
}
