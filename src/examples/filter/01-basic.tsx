// A filter with counts
// Each option shows how many rows have it. Chosen values appear in the chip as badges; past two they read "3 selected".
import { Filter } from "@/components/ui/filter"

const priorities = [
  { value: "urgent", label: "Urgent", count: 3 },
  { value: "high", label: "High", count: 8 },
  { value: "medium", label: "Medium", count: 21 },
  { value: "low", label: "Low", count: 14 },
]

export default function FilterBasic() {
  return <Filter label="Priority" options={priorities} defaultValue={["urgent", "high"]} />
}
