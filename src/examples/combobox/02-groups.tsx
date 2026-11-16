// Groups
// Pass groups as data, or write `ComboboxGroup` and `ComboboxGroupLabel` yourself.
import {
  Combobox,
  ComboboxContent,
  ComboboxControl,
  ComboboxInput,
  ComboboxItems,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox"

const foods = [
  { type: "group" as const, label: "Fruit", items: ["Apple", "Banana", "Mango"] },
  { type: "group" as const, label: "Vegetables", items: ["Carrot", "Leek", "Spinach"] },
]

export default function ComboboxGroups() {
  return (
    <div className="w-full max-w-[280px]">
      <Combobox<string> items={foods}>
        <ComboboxControl>
          <ComboboxInput aria-label="Food" placeholder="Pick a food" />
          <ComboboxTrigger aria-label="Show foods" />
        </ComboboxControl>
        <ComboboxContent>
          <ComboboxList>{(state) => <ComboboxItems items={state.items} />}</ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}
