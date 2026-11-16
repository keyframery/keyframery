import {
  Combobox,
  ComboboxContent,
  ComboboxControl,
  ComboboxInput,
  ComboboxItems,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox"

const fruits = ["Apple", "Banana", "Cherry"]

export default function Usage() {
  return (
    <Combobox items={fruits}>
      <ComboboxControl>
        <ComboboxInput placeholder="Fruit" />
        <ComboboxTrigger aria-label="Show fruit" />
      </ComboboxControl>
      <ComboboxContent>
        <ComboboxList>{(state) => <ComboboxItems items={state.items} />}</ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
