// Basic
// Suggestions filter as you type. Free text is still allowed: an autocomplete helps, it doesn't restrict.
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteControl,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItems,
  AutocompleteLabel,
  AutocompleteList,
} from "@/components/ui/autocomplete"

const cities = ["Amsterdam", "Barcelona", "Berlin", "Copenhagen", "Lisbon", "Madrid", "Paris", "Prague", "Rome", "Vienna"]

export default function AutocompleteBasic() {
  return (
    <div className="w-full max-w-[300px]">
      <Autocomplete items={cities}>
        <AutocompleteLabel>Destination</AutocompleteLabel>
        <AutocompleteControl>
          <AutocompleteInput placeholder="Where to?" />
        </AutocompleteControl>
        <AutocompleteContent>
          <AutocompleteEmpty>No cities match.</AutocompleteEmpty>
          <AutocompleteList>
            {(state) => <AutocompleteItems items={state.items} />}
          </AutocompleteList>
        </AutocompleteContent>
      </Autocomplete>
    </div>
  )
}
