import { Stat } from "@/components/ui/stat"

export default function Usage() {
  return <Stat label="Revenue" value={48210} formatValue={(v) => `$${v.toLocaleString("en-US")}`} delta={0.124} />
}
