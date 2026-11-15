import {
  Autocomplete,
  AutocompleteClear,
  AutocompleteContent,
  AutocompleteControl,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteGroupLabel,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteItemIcon,
  AutocompleteItemText,
  AutocompleteLabel,
  AutocompleteList,
} from "@/components/ui/autocomplete"

export const meta = { name: "Autocomplete", group: "Menus" }

/* The demo plays itself: typing unfolds the suggestions, which cascade in; the highlight glides;
   one is chosen; then another search. */
const item = (n: number) => `[data-slot="autocomplete-item"]:nth-of-type(${n})`
const field = '[data-slot="autocomplete-input"]'
export const play = [
  { type: "pa", into: field, wait: 1300 },
  { hover: item(2), wait: 480 },
  { hover: item(3), wait: 480 },
  { hover: item(1), wait: 700 },
  { click: item(2), wait: 1300 },
  { type: "c", into: field, wait: 1400 },
  { hover: item(4), wait: 520 },
  { hover: item(2), wait: 800 },
  { type: "", into: field, wait: 1000 },
]

const minutes: Record<string, number> = {
  "Lemon garlic pasta": 20,
  "Shakshuka with feta": 25,
  "Miso glazed salmon": 30,
  "Mushroom risotto": 40,
  "Chicken tikka masala": 45,
  "Thai green curry": 35,
  "Banana bread": 70,
  "Lentil soup with cumin": 35,
  "Pad thai": 25,
  "Chocolate chip cookies": 30,
  "Greek salad": 10,
  "Pancakes with blueberries": 20,
}

const recipes = Object.keys(minutes)
const recent = ["Mushroom risotto", "Thai green curry", "Banana bread"]
const recentGroup = [{ type: "group" as const, label: "Recently cooked", items: recent }]

type Entry = string | (typeof recentGroup)[number]

function ClockIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="8" r="5.75" />
      <path d="M8 5v3l2 1.25" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="7" cy="7" r="4.25" />
      <path d="m10.25 10.25 3 3" />
    </svg>
  )
}

function Recipe({ name, recentRow }: { name: string; recentRow?: boolean }) {
  return (
    <AutocompleteItem value={name}>
      <AutocompleteItemIcon>{recentRow ? <ClockIcon /> : <SearchIcon />}</AutocompleteItemIcon>
      <AutocompleteItemText />
      <span className="shrink-0 text-[12px] text-muted-foreground tabular-nums">{minutes[name]} min</span>
    </AutocompleteItem>
  )
}

export default function AutocompleteDemo() {
  return (
    <div className="flex w-[340px] flex-col gap-2">
      <Autocomplete items={recipes} emptyItems={recentGroup} openOnFocus autoHighlight>
        <AutocompleteLabel>Find a recipe</AutocompleteLabel>
        <AutocompleteControl>
          <SearchIcon />
          <AutocompleteInput type="search" placeholder="Pasta, curry, something sweet…" />
          <AutocompleteClear aria-label="Clear search" />
        </AutocompleteControl>
        <AutocompleteContent>
          <AutocompleteEmpty>No recipes match. Press Enter to search anyway.</AutocompleteEmpty>
          <AutocompleteList>
            {(state) =>
              (state.items as Entry[]).map((entry) =>
                typeof entry === "string" ? (
                  <Recipe key={entry} name={entry} />
                ) : (
                  <AutocompleteGroup key={entry.label}>
                    <AutocompleteGroupLabel>{entry.label}</AutocompleteGroupLabel>
                    {entry.items.map((name) => (
                      <Recipe key={name} name={name} recentRow />
                    ))}
                  </AutocompleteGroup>
                ),
              )
            }
          </AutocompleteList>
        </AutocompleteContent>
      </Autocomplete>
    </div>
  )
}
