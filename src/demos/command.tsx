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

export default function CommandDemo() {
  const [pages, setPages] = React.useState<string[]>([])
  const onMovePage = pages.at(-1) === "move"

  return (
    <Command
      aria-label="Notes commands"
      autoHighlight
      loop
      pages={pages}
      onPagesChange={setPages}
      onAction={() => setPages([])}
      className="h-[424px] w-[460px]"
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
          placeholder={onMovePage ? "Choose a notebook…" : "Search notes or run an action…"}
        />
      </CommandSearch>
      <CommandEmpty className="flex-1">No notes or actions match.</CommandEmpty>
      <CommandList className="max-h-none flex-1">
        <CommandPage>
          <CommandGroup>
            <CommandGroupLabel>Actions</CommandGroupLabel>
            <CommandItem data-play="new" value="new" label="New note" shortcut="mod+n">
              <CommandItemIcon>{icons.plus}</CommandItemIcon>
              <CommandItemText>New note</CommandItemText>
              <CommandShortcut />
            </CommandItem>
            <CommandItem data-play="pin" value="pin" label="Pin to top" shortcut="mod+shift+p">
              <CommandItemIcon>{icons.pin}</CommandItemIcon>
              <CommandItemText>Pin to top</CommandItemText>
              <CommandShortcut />
            </CommandItem>
            <CommandItem data-play="move" value="move" label="Move to notebook" page="move">
              <CommandItemIcon>{icons.folder}</CommandItemIcon>
              <CommandItemText>Move to notebook…</CommandItemText>
              <span className="ml-auto text-muted-foreground [&_svg]:size-3.5">{icons.chevron}</span>
            </CommandItem>
            <CommandItem data-play="share" value="share" label="Share with" keywords={["send", "invite"]} shortcut="mod+shift+s">
              <CommandItemIcon>{icons.share}</CommandItemIcon>
              <CommandItemText>Share with…</CommandItemText>
              <CommandShortcut />
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup>
            <CommandGroupLabel>Recent notes</CommandGroupLabel>
            <CommandItem data-play="note-crete" value="note-crete" label="Crete packing list">
              <CommandItemIcon>{icons.note}</CommandItemIcon>
              <CommandItemText>Crete packing list</CommandItemText>
              <span className="ml-auto text-[12px] text-muted-foreground">Travel</span>
            </CommandItem>
            <CommandItem data-play="note-ragu" value="note-ragu" label="Sunday ragù">
              <CommandItemIcon>{icons.note}</CommandItemIcon>
              <CommandItemText>Sunday ragù</CommandItemText>
              <span className="ml-auto text-[12px] text-muted-foreground">Recipes</span>
            </CommandItem>
            <CommandItem data-play="note-week" value="note-week" label="Plan for the week" keywords={["calendar"]}>
              <CommandItemIcon>{icons.calendar}</CommandItemIcon>
              <CommandItemText>Plan for the week</CommandItemText>
              <span className="ml-auto text-[12px] text-muted-foreground">Journal</span>
            </CommandItem>
          </CommandGroup>
        </CommandPage>
        <CommandPage value="move">
          <CommandGroup>
            <CommandGroupLabel>Notebooks</CommandGroupLabel>
            {notebooks.map((name) => (
              <CommandItem key={name} data-play={`move-${name}`} value={`move-${name}`} label={name}>
                <CommandItemIcon>{icons.folder}</CommandItemIcon>
                <CommandItemText>{name}</CommandItemText>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandPage>
      </CommandList>
      <CommandFooter>
        <span>↑↓ to move</span>
        <span>↵ to run</span>
        <span className="ml-auto">{onMovePage ? "⌫ to go back" : "esc to clear"}</span>
      </CommandFooter>
    </Command>
  )
}
