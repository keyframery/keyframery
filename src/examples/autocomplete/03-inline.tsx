// Inline completion
// `inlineComplete` fills in the rest of the first match as you type. Press Tab or the right arrow to accept it.
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteControl,
  AutocompleteInput,
  AutocompleteItems,
  AutocompleteList,
} from "@/components/ui/autocomplete"

const tags = ["design", "design-system", "development", "documentation", "devops"]

export default function AutocompleteInline() {
  return (
    <div className="w-full max-w-[300px]">
      <Autocomplete items={tags} inlineComplete autoHighlight>
        <AutocompleteControl>
          <AutocompleteInput aria-label="Tag" placeholder="Type “de”" />
        </AutocompleteControl>
        <AutocompleteContent>
          <AutocompleteList>
            {(state) => <AutocompleteItems items={state.items} />}
          </AutocompleteList>
        </AutocompleteContent>
      </Autocomplete>
    </div>
  )
}
