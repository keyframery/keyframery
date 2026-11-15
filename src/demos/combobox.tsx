import * as React from "react"

import {
  Combobox,
  ComboboxContent,
  ComboboxControl,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxItemText,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
} from "@/components/ui/combobox"

export const meta = { name: "Combobox", group: "Menus" }

/* The demo plays itself: the list unfolds and cascades, the highlight glides, a city is picked,
   then typing narrows the list. The highlight is moved with the arrow keys. */
const item = (n: number) => `[data-slot="combobox-item"]:nth-of-type(${n})`
export const play = [
  { click: '[data-slot="combobox-trigger"]', wait: 1100 },
  { key: "ArrowDown", wait: 420 },
  { key: "ArrowDown", wait: 420 },
  { key: "ArrowDown", wait: 420 },
  { key: "ArrowUp", wait: 700 },
  { key: "Enter", wait: 1300 },
  { type: "ky", into: '[data-slot="combobox-input"]', wait: 1500 },
  { click: '[data-slot="combobox-trigger"]', wait: 900 },
  { click: '[data-slot="combobox-trigger"]', wait: 900 },
  { click: item(1), wait: 1400 },
]

const regions = [
  {
    label: "Europe",
    cities: [
      { value: "lisbon", label: "Lisbon", country: "Portugal" },
      { value: "barcelona", label: "Barcelona", country: "Spain" },
      { value: "copenhagen", label: "Copenhagen", country: "Denmark" },
      { value: "vienna", label: "Vienna", country: "Austria" },
    ],
  },
  {
    label: "Asia",
    cities: [
      { value: "kyoto", label: "Kyoto", country: "Japan" },
      { value: "seoul", label: "Seoul", country: "South Korea" },
      { value: "hanoi", label: "Hanoi", country: "Vietnam" },
    ],
  },
  {
    label: "Americas",
    cities: [
      { value: "mexico-city", label: "Mexico City", country: "Mexico" },
      { value: "montreal", label: "Montréal", country: "Canada" },
    ],
  },
]

export default function ComboboxDemo() {
  return (
    <div className="w-[320px]">
      <Combobox defaultValue="lisbon" autoHighlight="always">
        <div className="flex flex-col gap-2">
          <ComboboxLabel>Where to next?</ComboboxLabel>
          <ComboboxControl>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M8 14s4.5-4 4.5-7.5a4.5 4.5 0 0 0-9 0C3.5 10 8 14 8 14Z" />
              <circle cx="8" cy="6.5" r="1.5" />
            </svg>
            <ComboboxInput placeholder="Search cities…" />
            <ComboboxTrigger aria-label="Show cities" />
          </ComboboxControl>
        </div>
        <ComboboxContent>
          <ComboboxEmpty>No cities match. Try a country.</ComboboxEmpty>
          <ComboboxList>
            {regions.map((region, index) => (
              <React.Fragment key={region.label}>
                {index > 0 && <ComboboxSeparator />}
                <ComboboxGroup>
                  <ComboboxGroupLabel>{region.label}</ComboboxGroupLabel>
                  {region.cities.map((city) => (
                    <ComboboxItem
                      key={city.value}
                      value={city.value}
                      label={city.label}
                      keywords={[city.country]}
                    >
                      <ComboboxItemText className="flex-none">{city.label}</ComboboxItemText>
                      <span className="truncate text-[12px] text-muted-foreground">{city.country}</span>
                      <ComboboxItemIndicator />
                    </ComboboxItem>
                  ))}
                </ComboboxGroup>
              </React.Fragment>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}
