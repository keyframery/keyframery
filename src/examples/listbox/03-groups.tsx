// Groups
// `ListboxGroup` and `ListboxGroupLabel` split a long list into sections.
import { Listbox, ListboxGroup, ListboxGroupLabel, ListboxItem, ListboxItemIndicator, ListboxSeparator } from "@/components/ui/listbox"

export default function ListboxGroups() {
  return (
    <Listbox aria-label="Font" defaultValue="Inter" className="w-full max-w-[220px]">
      <ListboxGroup>
        <ListboxGroupLabel>Sans serif</ListboxGroupLabel>
        {["Inter", "Helvetica"].map((font) => (
          <ListboxItem key={font} value={font}>
            {font}
            <ListboxItemIndicator />
          </ListboxItem>
        ))}
      </ListboxGroup>
      <ListboxSeparator />
      <ListboxGroup>
        <ListboxGroupLabel>Serif</ListboxGroupLabel>
        {["Georgia", "Garamond"].map((font) => (
          <ListboxItem key={font} value={font}>
            {font}
            <ListboxItemIndicator />
          </ListboxItem>
        ))}
      </ListboxGroup>
    </Listbox>
  )
}
