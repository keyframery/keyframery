// Icons and a clear button
// Put an icon in the control and `AutocompleteClear` after the input. `openOnFocus` shows the list before typing.
import { MapPin, Search } from "lucide-react"

import {
  Autocomplete,
  AutocompleteClear,
  AutocompleteContent,
  AutocompleteControl,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteItemIcon,
  AutocompleteItemText,
  AutocompleteList,
} from "@/components/ui/autocomplete"

const places = ["Covent Garden", "Camden Market", "Borough Market", "Greenwich Park", "Hampstead Heath"]

export default function AutocompleteWithIcons() {
  return (
    <div className="w-full max-w-[300px]">
      <Autocomplete items={places} openOnFocus autoHighlight>
        <AutocompleteControl>
          <Search />
          <AutocompleteInput type="search" aria-label="Search places" placeholder="Search places" />
          <AutocompleteClear aria-label="Clear" />
        </AutocompleteControl>
        <AutocompleteContent>
          <AutocompleteList>
            {(state) =>
              (state.items as string[]).map((place) => (
                <AutocompleteItem key={place} value={place}>
                  <AutocompleteItemIcon>
                    <MapPin />
                  </AutocompleteItemIcon>
                  <AutocompleteItemText />
                </AutocompleteItem>
              ))
            }
          </AutocompleteList>
        </AutocompleteContent>
      </Autocomplete>
    </div>
  )
}
