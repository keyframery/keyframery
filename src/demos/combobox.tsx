import * as React from "react"

import {
  Combobox,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxValue,
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

export const controls = {
  multiple: { type: "switch", label: "Multiple", default: false, group: "Behaviour" },
  disabled: { type: "switch", label: "Disabled", default: false, group: "Behaviour" },
  readOnly: { type: "switch", label: "Read only", default: false, group: "Behaviour" },
  required: { type: "switch", label: "Required", default: false, group: "Behaviour" },
  keepQuery: { type: "switch", label: "Keep query", default: false, group: "Behaviour" },
  allowCustomValue: { type: "switch", label: "Allow custom value", default: false, group: "Behaviour" },
  loop: { type: "switch", label: "Loop", default: true, group: "Behaviour" },
  autoHighlight: { type: "select", label: "Auto highlight", default: "always", options: ["always", "typing", "off"], group: "Behaviour" },
  side: { type: "select", label: "Side", default: "bottom", options: ["bottom", "top", "left", "right"], group: "Behaviour" },
  align: { type: "select", label: "Align", default: "start", options: ["start", "center", "end"], group: "Behaviour" },
  items: { type: "slider", label: "Items", default: 9, min: 1, max: 9, step: 1 },
  label: { type: "text", label: "Label", default: "Where to next?" },
  placeholder: { type: "text", label: "Placeholder", default: "Search cities…" },
  empty: { type: "text", label: "Empty", default: "No cities match. Try a country." },
  width: { type: "slider", label: "Width", default: 320, min: 240, max: 480, step: 1, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Gap", default: 6, min: 0, max: 24, step: 1, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Radius", default: 14, min: 0, max: 28, step: 1, unit: "px", group: "Layout" },
  face: { type: "color", label: "Face", default: "", group: "Colours" },
  ink: { type: "color", label: "Ink", default: "", group: "Colours" },
  accent: { type: "color", label: "Accent", default: "", group: "Colours" },
} as const

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

export default function ComboboxDemo({
  multiple = false,
  disabled = false,
  readOnly = false,
  required = false,
  keepQuery = false,
  allowCustomValue = false,
  loop = true,
  autoHighlight = "always",
  side = "bottom",
  align = "start",
  items = 9,
  label = "Where to next?",
  placeholder = "Search cities…",
  empty = "No cities match. Try a country.",
  width = 320,
  gap = 6,
  radius = 14,
  face = "",
  ink = "",
  accent = "",
}: {
  multiple?: boolean
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  keepQuery?: boolean
  allowCustomValue?: boolean
  loop?: boolean
  autoHighlight?: "always" | "typing" | "off"
  side?: "bottom" | "top" | "left" | "right"
  align?: "start" | "center" | "end"
  items?: number
  label?: string
  placeholder?: string
  empty?: string
  width?: number
  gap?: number
  radius?: number
  face?: string
  ink?: string
  accent?: string
}) {
  const theme = {
    "--combobox-radius": `${radius}px`,
    ...(face ? { "--combobox-face": face } : null),
    ...(ink ? { "--combobox-ink": ink } : null),
    ...(accent ? { "--combobox-accent": accent } : null),
  } as React.CSSProperties
  return (
    <div style={{ ...theme, maxWidth: width }} className="w-full">
      <Combobox<string, boolean> key={String(multiple)} multiple={multiple} defaultValue={multiple ? ["lisbon"] : "lisbon"} autoHighlight={autoHighlight === "always" ? "always" : autoHighlight === "typing"} disabled={disabled} readOnly={readOnly} required={required} keepQuery={keepQuery} allowCustomValue={allowCustomValue} loop={loop}>
        <div className="flex flex-col gap-2">
          <ComboboxLabel>{label}</ComboboxLabel>
          <ComboboxControl>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M8 14s4.5-4 4.5-7.5a4.5 4.5 0 0 0-9 0C3.5 10 8 14 8 14Z" />
              <circle cx="8" cy="6.5" r="1.5" />
            </svg>
            {multiple ? (
              <ComboboxChips>
                <ComboboxValue>{(state) => (Array.isArray(state.value) ? state.value : []).map((value: string) => <ComboboxChip key={value} value={value}>{regions.flatMap((region) => region.cities).find((city) => city.value === value)?.label ?? value}<ComboboxChipRemove aria-label={`Remove ${value}`} /></ComboboxChip>)}</ComboboxValue>
                <ComboboxInput placeholder={placeholder} />
              </ComboboxChips>
            ) : <ComboboxInput placeholder={placeholder} />}
            <ComboboxTrigger aria-label="Show cities" />
          </ComboboxControl>
        </div>
        <ComboboxContent style={theme} side={side} align={align} sideOffset={gap}>
          <ComboboxEmpty>{empty}</ComboboxEmpty>
          <ComboboxList>
            {regions.map((region, index) => (
              <React.Fragment key={region.label}>
                {index > 0 && <ComboboxSeparator />}
                <ComboboxGroup>
                  <ComboboxGroupLabel>{region.label}</ComboboxGroupLabel>
                  {region.cities.filter((city) => regions.flatMap((region) => region.cities).slice(0, items).some((visible) => visible.value === city.value)).map((city) => (
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
