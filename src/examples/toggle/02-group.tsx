// Group
// `ToggleGroup` with `multiple` for formatting. Without it, one at a time, like alignment.
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Underline } from "lucide-react"

import { Toggle, ToggleGroup, ToggleIcon } from "@/components/ui/toggle"

export default function ToggleGroupExample() {
  return (
    <div className="flex flex-wrap gap-3">
      <ToggleGroup multiple aria-label="Text style" defaultValue={["bold"]}>
        <Toggle value="bold" size="icon" aria-label="Bold">
          <ToggleIcon>
            <Bold />
          </ToggleIcon>
        </Toggle>
        <Toggle value="italic" size="icon" aria-label="Italic">
          <ToggleIcon>
            <Italic />
          </ToggleIcon>
        </Toggle>
        <Toggle value="underline" size="icon" aria-label="Underline">
          <ToggleIcon>
            <Underline />
          </ToggleIcon>
        </Toggle>
      </ToggleGroup>
      <ToggleGroup aria-label="Alignment" defaultValue={["left"]} deselectable={false}>
        <Toggle value="left" size="icon" aria-label="Left">
          <AlignLeft />
        </Toggle>
        <Toggle value="center" size="icon" aria-label="Centre">
          <AlignCenter />
        </Toggle>
        <Toggle value="right" size="icon" aria-label="Right">
          <AlignRight />
        </Toggle>
      </ToggleGroup>
    </div>
  )
}
