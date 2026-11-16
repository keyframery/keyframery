// One choice
// An always-open list. Arrow keys move and select, and typing jumps to an item.
import { Listbox, ListboxItem, ListboxItemIndicator } from "@/components/ui/listbox"

const plans = ["Free", "Pro", "Team", "Enterprise"]

export default function ListboxSingle() {
  return (
    <Listbox aria-label="Plan" defaultValue="Pro" className="w-full max-w-[220px]">
      {plans.map((plan) => (
        <ListboxItem key={plan} value={plan}>
          {plan}
          <ListboxItemIndicator />
        </ListboxItem>
      ))}
    </Listbox>
  )
}
