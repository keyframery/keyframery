// Basic
// Type to filter, then pick one. Unlike an autocomplete, the value must be one of the items.
import {
  Combobox,
  ComboboxContent,
  ComboboxControl,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItems,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox"

const timezones = ["London", "Lisbon", "Paris", "Berlin", "Athens", "Dubai", "Mumbai", "Singapore", "Tokyo", "Sydney"]

export default function ComboboxBasic() {
  return (
    <div className="flex w-full max-w-[280px] flex-col gap-2">
      <Combobox items={timezones} defaultValue="London">
        <ComboboxLabel>Time zone</ComboboxLabel>
        <ComboboxControl>
          <ComboboxInput placeholder="Search cities…" />
          <ComboboxTrigger aria-label="Show time zones" />
        </ComboboxControl>
        <ComboboxContent>
          <ComboboxEmpty>No cities match.</ComboboxEmpty>
          <ComboboxList>{(state) => <ComboboxItems items={state.items} />}</ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}
