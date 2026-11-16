// Icons only
// Give each item an `aria-label` when it shows only an icon.
import { LayoutGrid, List, Rows3 } from "lucide-react"

import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"

export default function SegmentedControlIcons() {
  return (
    <SegmentedControl aria-label="Layout" defaultValue="grid">
      <SegmentedControlItem value="list" aria-label="List">
        <List />
      </SegmentedControlItem>
      <SegmentedControlItem value="rows" aria-label="Rows">
        <Rows3 />
      </SegmentedControlItem>
      <SegmentedControlItem value="grid" aria-label="Grid">
        <LayoutGrid />
      </SegmentedControlItem>
    </SegmentedControl>
  )
}
