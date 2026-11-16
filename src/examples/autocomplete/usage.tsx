import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteControl,
  AutocompleteInput,
  AutocompleteItems,
  AutocompleteList,
} from "@/components/ui/autocomplete"

const cities = ["Amsterdam", "Berlin", "Lisbon"]

export default function Usage() {
  return (
    <Autocomplete items={cities}>
      <AutocompleteControl>
        <AutocompleteInput placeholder="City" />
      </AutocompleteControl>
      <AutocompleteContent>
        <AutocompleteList>
          {(state) => <AutocompleteItems items={state.items} />}
        </AutocompleteList>
      </AutocompleteContent>
    </Autocomplete>
  )
}
