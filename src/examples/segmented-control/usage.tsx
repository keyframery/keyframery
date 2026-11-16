import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"

export default function Usage() {
  return (
    <SegmentedControl aria-label="View" defaultValue="list">
      <SegmentedControlItem value="list">List</SegmentedControlItem>
      <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
    </SegmentedControl>
  )
}
