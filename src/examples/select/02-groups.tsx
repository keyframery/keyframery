// Groups and details
// Group items under labels. Pass `items` so the trigger shows each value's label, and anything else in a row stays in the list.
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const zones = [
  { label: "Europe", items: [["london", "London", "GMT+1"], ["paris", "Paris", "GMT+2"]] },
  { label: "Asia", items: [["dubai", "Dubai", "GMT+4"], ["tokyo", "Tokyo", "GMT+9"]] },
]

/* The labels the trigger shows. */
const items = zones.flatMap((zone) => zone.items.map(([value, label]) => ({ value, label })))

export default function SelectGroups() {
  return (
    <Select defaultValue="london" items={items}>
      <SelectTrigger aria-label="Time zone" className="w-[220px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="w-60">
        {zones.map((zone, i) => (
          <SelectGroup key={zone.label}>
            {i > 0 && <SelectSeparator />}
            <SelectGroupLabel>{zone.label}</SelectGroupLabel>
            {zone.items.map(([value, city, offset]) => (
              <SelectItem key={value} value={value}>
                <SelectItemText>{city}</SelectItemText>
                <span className="text-[12px] text-muted-foreground tabular-nums">{offset}</span>
                <SelectItemIndicator />
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}
