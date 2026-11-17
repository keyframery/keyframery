import * as React from "react"

import {
  Command,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandItemIcon,
  CommandItemText,
  CommandList,
  CommandPage,
  CommandSearch,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

export const controls = {
  autoHighlight: { type: "switch", label: "Auto highlight", default: true, group: "Behaviour" },
  loop: { type: "switch", label: "Loop", default: true, group: "Behaviour" },
  disabled: { type: "switch", label: "Disable commands", default: false, group: "Behaviour" },
  filter: { type: "select", label: "Filter", default: "fuzzy", options: ["fuzzy", "contains", "startsWith"], group: "Behaviour" },
  notebookCount: { type: "slider", label: "Notebook count", default: 5, min: 1, max: 5, step: 1 },
  placeholder: { type: "text", label: "Placeholder", default: "Search notes or run an action…" },
  pagePlaceholder: { type: "text", label: "Page placeholder", default: "Choose a notebook…" },
  empty: { type: "text", label: "Empty", default: "No notes or actions match." },
  actionsLabel: { type: "text", label: "Actions label", default: "Actions" },
  notesLabel: { type: "text", label: "Notes label", default: "Recent notes" },
  notebooksLabel: { type: "text", label: "Notebooks label", default: "Notebooks" },
  newLabel: { type: "text", label: "New label", default: "New note" },
  moveLabel: { type: "text", label: "Move label", default: "Move to notebook…" },
  width: { type: "slider", label: "Width", default: 460, min: 300, max: 600, step: 1, unit: "px", group: "Layout" },
  height: { type: "slider", label: "Height", default: 424, min: 300, max: 500, step: 1, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Radius", default: 14, min: 0, max: 28, step: 1, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Gap", default: 10, min: 0, max: 24, step: 1, unit: "px", group: "Layout" },
  face: { type: "color", label: "Face", default: "", group: "Colours" },
  ink: { type: "color", label: "Ink", default: "", group: "Colours" },
  accent: { type: "color", label: "Accent", default: "", group: "Colours" },
} as const

export const meta = { name: "Command", group: "Overlays" }

/* The demo plays itself: the highlight glides down the actions, "Move to notebook" opens a page
   whose rows cascade in from the side, a notebook is chosen, then a search narrows the list. */
const at = (name: string) => `[data-play="${name}"]`
export const play = [
  { hover: at("pin"), wait: 450 },
  { hover: at("share"), wait: 450 },
  { hover: at("note-ragu"), wait: 500 },
  { hover: at("move"), wait: 700 },
  { click: at("move"), wait: 1300 },
  { hover: at("move-Reading list"), wait: 500 },
  { hover: at("move-Journal"), wait: 500 },
  { hover: at("move-Travel"), wait: 700 },
  { click: at("move-Travel"), wait: 1300 },
  { type: "pla", into: '[data-slot="command-input"]', wait: 1500 },
  { type: "", into: '[data-slot="command-input"]', wait: 1200 },
]

const svg = {
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
}

const icons = {
  search: (
    <svg {...svg}>
      <circle cx="7" cy="7" r="4.25" />
      <path d="m10.25 10.25 3 3" />
    </svg>
  ),
  plus: (
    <svg {...svg}>
      <path d="M8 3.5v9M3.5 8h9" />
    </svg>
  ),
  note: (
    <svg {...svg}>
      <path d="M4.5 2.5h5l2.5 2.5v8.5h-7.5z" />
      <path d="M6.5 8h3M6.5 10.5h3" />
    </svg>
  ),
  calendar: (
    <svg {...svg}>
      <rect x="2.5" y="3.5" width="11" height="10" rx="2" />
      <path d="M2.5 7h11M5.5 2v3M10.5 2v3" />
    </svg>
  ),
  pin: (
    <svg {...svg}>
      <path d="M6 2.5h4M7 2.5v4l-2.5 3h7L9 6.5v-4M8 9.5v4" />
    </svg>
  ),
  folder: (
    <svg {...svg}>
      <path d="M2.5 4.5a1 1 0 0 1 1-1h3l1.5 1.5h4.5a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1z" />
    </svg>
  ),
  share: (
    <svg {...svg}>
      <path d="M8 2.5v7.5M5 5.5l3-3 3 3M3.5 9v3.5a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V9" />
    </svg>
  ),
  chevron: (
    <svg {...svg}>
      <path d="m6 4 4 4-4 4" />
    </svg>
  ),
}

const notebooks = ["Recipes", "Travel", "Reading list", "Home projects", "Journal"]

export default function CommandDemo({
  autoHighlight = true,
  loop = true,
  disabled = false,
  filter = "fuzzy",
  notebookCount = 5,
  placeholder = "Search notes or run an action…",
  pagePlaceholder = "Choose a notebook…",
  empty = "No notes or actions match.",
  actionsLabel = "Actions",
  notesLabel = "Recent notes",
  notebooksLabel = "Notebooks",
  newLabel = "New note",
  moveLabel = "Move to notebook…",
  width = 460,
  height = 424,
  radius = 14,
  gap = 10,
  face = "",
  ink = "",
  accent = "",
}: {
  autoHighlight?: boolean
  loop?: boolean
  disabled?: boolean
  filter?: "fuzzy" | "contains" | "startsWith"
  notebookCount?: number
  placeholder?: string
  pagePlaceholder?: string
  empty?: string
  actionsLabel?: string
  notesLabel?: string
  notebooksLabel?: string
  newLabel?: string
  moveLabel?: string
  width?: number
  height?: number
  radius?: number
  gap?: number
  face?: string
  ink?: string
  accent?: string
}) {
  const theme = {
    "--command-radius": `${radius}px`,
    "--command-gap": `${gap}px`,
    ...(face ? { "--command-face": face } : null),
    ...(ink ? { "--command-ink": ink } : null),
    ...(accent ? { "--command-accent": accent } : null),
  } as React.CSSProperties
  const [pages, setPages] = React.useState<string[]>([])
  const onMovePage = pages.at(-1) === "move"

  return (
    <Command
      aria-label="Notes commands"
      autoHighlight={autoHighlight}
      loop={loop}
      filter={filter}
      style={{ ...theme, maxWidth: width, ...(height !== 424 ? { height } : null) }}
      pages={pages}
      onPagesChange={setPages}
      onAction={() => setPages([])}
      className="@container h-[424px] w-full max-w-[460px] @max-[26rem]:h-[344px]"
    >
      <CommandSearch>
        {icons.search}
        {onMovePage && (
          <span className="shrink-0 rounded-[6px] bg-muted px-1.5 py-1 text-[12px] leading-none font-medium text-foreground">
            Move to
          </span>
        )}
        <CommandInput
          aria-label="Search notes and actions"
          placeholder={onMovePage ? pagePlaceholder : placeholder}
        />
      </CommandSearch>
      <CommandEmpty className="flex-1">{empty}</CommandEmpty>
      <CommandList className="max-h-none flex-1">
        <CommandPage>
          <CommandGroup>
            <CommandGroupLabel>{actionsLabel}</CommandGroupLabel>
            <CommandItem disabled={disabled} data-play="new" value="new" label={newLabel} shortcut="mod+n">
              <CommandItemIcon>{icons.plus}</CommandItemIcon>
              <CommandItemText>{newLabel}</CommandItemText>
              <CommandShortcut className="@max-[26rem]:hidden" />
            </CommandItem>
            <CommandItem disabled={disabled} data-play="pin" value="pin" label="Pin to top" shortcut="mod+shift+p">
              <CommandItemIcon>{icons.pin}</CommandItemIcon>
              <CommandItemText>Pin to top</CommandItemText>
              <CommandShortcut className="@max-[26rem]:hidden" />
            </CommandItem>
            <CommandItem disabled={disabled} data-play="move" value="move" label={moveLabel} page="move">
              <CommandItemIcon>{icons.folder}</CommandItemIcon>
              <CommandItemText>{moveLabel}</CommandItemText>
              <span className="ml-auto text-muted-foreground [&_svg]:size-3.5">{icons.chevron}</span>
            </CommandItem>
            <CommandItem disabled={disabled} data-play="share" value="share" label="Share with" keywords={["send", "invite"]} shortcut="mod+shift+s">
              <CommandItemIcon>{icons.share}</CommandItemIcon>
              <CommandItemText>Share with…</CommandItemText>
              <CommandShortcut className="@max-[26rem]:hidden" />
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup>
            <CommandGroupLabel>{notesLabel}</CommandGroupLabel>
            <CommandItem disabled={disabled} data-play="note-crete" value="note-crete" label="Crete packing list">
              <CommandItemIcon>{icons.note}</CommandItemIcon>
              <CommandItemText>Crete packing list</CommandItemText>
              <span className="ml-auto text-[12px] text-muted-foreground">Travel</span>
            </CommandItem>
            <CommandItem disabled={disabled} data-play="note-ragu" value="note-ragu" label="Sunday ragù">
              <CommandItemIcon>{icons.note}</CommandItemIcon>
              <CommandItemText>Sunday ragù</CommandItemText>
              <span className="ml-auto text-[12px] text-muted-foreground">Recipes</span>
            </CommandItem>
            <CommandItem disabled={disabled} data-play="note-week" value="note-week" label="Plan for the week" keywords={["calendar"]}>
              <CommandItemIcon>{icons.calendar}</CommandItemIcon>
              <CommandItemText>Plan for the week</CommandItemText>
              <span className="ml-auto text-[12px] text-muted-foreground">Journal</span>
            </CommandItem>
          </CommandGroup>
        </CommandPage>
        <CommandPage value="move">
          <CommandGroup>
            <CommandGroupLabel>{notebooksLabel}</CommandGroupLabel>
            {notebooks.slice(0, notebookCount).map((name) => (
              <CommandItem disabled={disabled} key={name} data-play={`move-${name}`} value={`move-${name}`} label={name}>
                <CommandItemIcon>{icons.folder}</CommandItemIcon>
                <CommandItemText>{name}</CommandItemText>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandPage>
      </CommandList>
      {/* Keyboard hints mean nothing on a phone, so the footer and shortcuts step aside there. */}
      <CommandFooter className="@max-[26rem]:hidden">
        <span>↑↓ to move</span>
        <span>↵ to run</span>
        <span className="ml-auto">{onMovePage ? "⌫ to go back" : "esc to clear"}</span>
      </CommandFooter>
    </Command>
  )
}
