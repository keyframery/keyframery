import { Listbox, ListboxItem, ListboxItemIndicator } from "@/components/ui/listbox"

export default function Usage() {
  return (
    <Listbox aria-label="Size" defaultValue="m">
      <ListboxItem value="s">
        Small
        <ListboxItemIndicator />
      </ListboxItem>
      <ListboxItem value="m">
        Medium
        <ListboxItemIndicator />
      </ListboxItem>
    </Listbox>
  )
}
