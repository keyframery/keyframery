import * as React from "react"

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

export const controls = {
  disabled: { type: "switch", label: "Disabled", default: false, group: "Behaviour" },
  readOnly: { type: "switch", label: "Read only", default: false, group: "Behaviour" },
  required: { type: "switch", label: "Required", default: false, group: "Behaviour" },
  openOnFocus: { type: "switch", label: "Open on focus", default: true, group: "Behaviour" },
  autoHighlight: { type: "switch", label: "Auto highlight", default: true, group: "Behaviour" },
  inlineComplete: { type: "switch", label: "Inline complete", default: false, group: "Behaviour" },
  loop: { type: "switch", label: "Loop", default: true, group: "Behaviour" },
  filter: { type: "select", label: "Filter", default: "contains", options: ["contains", "startsWith", "fuzzy"], group: "Behaviour" },
  side: { type: "select", label: "Side", default: "bottom", options: ["bottom", "top", "left", "right"], group: "Behaviour" },
  align: { type: "select", label: "Align", default: "start", options: ["start", "center", "end"], group: "Behaviour" },
  label: { type: "text", label: "Label", default: "Find a recipe" },
  placeholder: { type: "text", label: "Placeholder", default: "Pasta, curry, something sweet…" },
  empty: { type: "text", label: "Empty", default: "No recipes match. Press Enter to search anyway." },
  items: { type: "slider", label: "Items", default: 12, min: 1, max: 12, step: 1 },
  width: { type: "slider", label: "Width", default: 340, min: 240, max: 480, step: 1, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Gap", default: 6, min: 0, max: 24, step: 1, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Radius", default: 14, min: 0, max: 24, step: 1, unit: "px", group: "Layout" },
  face: { type: "color", label: "Face", default: "", group: "Colours" },
  ink: { type: "color", label: "Ink", default: "", group: "Colours" },
  accent: { type: "color", label: "Accent", default: "", group: "Colours" },
} as const

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

export default function AutocompleteDemo({
  disabled = false,
  readOnly = false,
  required = false,
  openOnFocus = true,
  autoHighlight = true,
  inlineComplete = false,
  loop = true,
  filter = "contains",
  side = "bottom",
  align = "start",
  label = "Find a recipe",
  placeholder = "Pasta, curry, something sweet…",
  empty = "No recipes match. Press Enter to search anyway.",
  items = 12,
  width = 340,
  gap = 6,
  radius = 14,
  face = "",
  ink = "",
  accent = "",
}: {
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  openOnFocus?: boolean
  autoHighlight?: boolean
  inlineComplete?: boolean
  loop?: boolean
  filter?: "contains" | "startsWith" | "fuzzy"
  side?: "bottom" | "top" | "left" | "right"
  align?: "start" | "center" | "end"
  label?: string
  placeholder?: string
  empty?: string
  items?: number
  width?: number
  gap?: number
  radius?: number
  face?: string
  ink?: string
  accent?: string
}) {
  const theme = {
    "--autocomplete-radius": `${radius}px`,
    ...(face ? { "--autocomplete-face": face } : null),
    ...(ink ? { "--autocomplete-ink": ink } : null),
    ...(accent ? { "--autocomplete-accent": accent } : null),
  } as React.CSSProperties
  return (
    <div style={{ ...theme, maxWidth: width }} className="flex w-full flex-col gap-2">
      <Autocomplete items={recipes.slice(0, items)} emptyItems={recentGroup} openOnFocus={openOnFocus} autoHighlight={autoHighlight} disabled={disabled} readOnly={readOnly} required={required} inlineComplete={inlineComplete} loop={loop} filter={filter}>
        <AutocompleteLabel>{label}</AutocompleteLabel>
        <AutocompleteControl>
          <SearchIcon />
          <AutocompleteInput type="search" placeholder={placeholder} />
          <AutocompleteClear aria-label="Clear search" />
        </AutocompleteControl>
        <AutocompleteContent style={theme} side={side} align={align} sideOffset={gap}>
          <AutocompleteEmpty>{empty}</AutocompleteEmpty>
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
