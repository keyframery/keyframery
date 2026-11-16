// Items as data
// Pass `items` and leave the listbox empty: it renders the rows, groups and separators for you.
import { Listbox, type ListData } from "@/components/ui/listbox"

const items: ListData = [
  { type: "group", label: "Coast", items: ["Seven Sisters", "Durdle Door"] },
  { type: "separator" },
  { type: "group", label: "Lakes", items: ["Derwentwater", "Buttermere"] },
]

export default function ListboxData() {
  return <Listbox aria-label="Walks" items={items} defaultValue="Derwentwater" className="w-full max-w-[260px]" />
}
