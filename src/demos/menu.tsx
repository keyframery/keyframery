import * as React from "react"

import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuItemIcon,
  MenuItemIndicator,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "@/components/ui/menu"

export const meta = { name: "Menu", group: "Menus" }

/* The demo plays itself: the sheet unfolds, the highlight glides down, a check draws, it closes. */
export const play = [
  { click: '[aria-label^="More actions"]', wait: 900 },
  { key: "ArrowDown", wait: 450 },
  { key: "ArrowDown", wait: 450 },
  { key: "ArrowDown", wait: 650 },
  { click: "#kf-lyrics", wait: 900 },
  { key: "Escape", wait: 1400 },
]

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  )
}

const playlists = ["Road trip", "Late night focus", "Sunday cooking"]

export const controls = {
  side: { type: "select", label: "Side", default: "bottom", options: ["top", "right", "bottom", "left"] },
  align: { type: "select", label: "Alignment", default: "end", options: ["start", "center", "end"] },
  disabled: { type: "switch", label: "Disabled trigger", default: false, group: "Behaviour" },
  focusableWhenDisabled: { type: "switch", label: "Focusable disabled trigger", default: false, group: "Behaviour" },
  loop: { type: "switch", label: "Loop navigation", default: true, group: "Behaviour" },
  dismissible: { type: "switch", label: "Dismissible", default: true, group: "Behaviour" },
  closeOnSelect: { type: "switch", label: "Close on action", default: true, group: "Behaviour" },
  destructive: { type: "switch", label: "Destructive removal", default: true, group: "Behaviour" },
  presentation: { type: "select", label: "Presentation", default: "popover", options: ["popover", "sheet", "auto"] },
  modal: { type: "select", label: "Modality", default: "pointer", options: ["pointer", "modal", "non-modal"] },
  title: { type: "text", label: "Track", default: "Slow Morning" },
  items: { type: "slider", label: "Playlists", default: 3, min: 1, max: 3, step: 1, unit: "", group: "Layout" },
  width: { type: "slider", label: "Menu width", default: 240, min: 200, max: 360, step: 1, unit: "px", group: "Layout" },
  sideOffset: { type: "slider", label: "Trigger gap", default: 6, min: 0, max: 24, step: 1, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Corners", default: 14, min: 0, max: 28, step: 1, unit: "px", group: "Layout" },
  surface: { type: "color", label: "Menu", default: "", group: "Colours" },
  ink: { type: "color", label: "Text", default: "", group: "Colours" },
  highlight: { type: "color", label: "Highlight", default: "", group: "Colours" },
  danger: { type: "color", label: "Destructive", default: "", group: "Colours" },
  trigger: { type: "color", label: "Trigger", default: "", group: "Colours" },
} as const

export default function MenuDemo({
  side = "bottom",
  align = "end",
  disabled = false,
  focusableWhenDisabled = false,
  loop = true,
  dismissible = true,
  closeOnSelect = true,
  destructive = true,
  presentation = "popover",
  modal = "pointer",
  title = "Slow Morning",
  items = 3,
  width = 240,
  sideOffset = 6,
  radius = 14,
  surface = "",
  ink = "",
  highlight = "",
  danger = "",
  trigger = "",
}: {
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  disabled?: boolean
  focusableWhenDisabled?: boolean
  loop?: boolean
  dismissible?: boolean
  closeOnSelect?: boolean
  destructive?: boolean
  presentation?: "popover" | "sheet" | "auto"
  modal?: "pointer" | "modal" | "non-modal"
  title?: string
  items?: number
  width?: number
  sideOffset?: number
  radius?: number
  surface?: string
  ink?: string
  highlight?: string
  danger?: string
  trigger?: string
}) {
  const theme = {
    "--menu-radius": `${radius}px`,
    "--menu-item-radius": `${radius * 8 / 14}px`,
    ...(surface ? { "--menu-surface": surface } : {}),
    ...(ink ? { "--menu-ink": ink } : {}),
    ...(highlight ? { "--menu-highlight": highlight } : {}),
    ...(danger ? { "--menu-danger": danger } : {}),
    ...(trigger ? { "--menu-trigger": trigger } : {}),
  } as React.CSSProperties
  return (
    <div style={theme} className="flex w-full max-w-[380px] items-center gap-3 rounded-[14px] bg-background p-2.5 pr-3 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
      <img src="/demo/gig.jpg" alt="" className="size-12 shrink-0 rounded-[9px] bg-muted object-cover" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-medium tracking-tight">{title}</div>
        <div className="mt-0.5 truncate text-[12px] text-muted-foreground">Lina Hart, live at the Roundhouse</div>
      </div>
      <span className="text-[12px] text-muted-foreground tabular-nums">3:42</span>
      <Menu loop={loop} dismissible={dismissible} presentation={presentation} modal={modal === "pointer" ? "pointer" : modal === "modal"}>
        <MenuTrigger disabled={disabled} focusableWhenDisabled={focusableWhenDisabled} aria-label={`More actions for ${title}`} className="w-8 px-0">
          <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <circle cx="3.5" cy="8" r="1.15" />
            <circle cx="8" cy="8" r="1.15" />
            <circle cx="12.5" cy="8" r="1.15" />
          </svg>
        </MenuTrigger>
        <MenuContent side={side} align={align} sideOffset={sideOffset} style={{ width }} className="w-60">
          <MenuGroup>
            <MenuItem closeOnSelect={closeOnSelect} value="play-next" shortcut="mod+enter">
              <MenuItemIcon>
                <Icon d="M2.5 4h7M2.5 8h7M2.5 12h4M11.5 9.5v4l3-2z" />
              </MenuItemIcon>
              Play next
            </MenuItem>
            <MenuItem closeOnSelect={closeOnSelect} value="queue" shortcut="mod+shift+q">
              <MenuItemIcon>
                <Icon d="M2.5 4h11M2.5 8h11M2.5 12h6M12 10.5v3M10.5 12h3" />
              </MenuItemIcon>
              Add to queue
            </MenuItem>
            <MenuSub loop={loop}>
              <MenuSubTrigger>
                <MenuItemIcon>
                  <Icon d="M8 3v10M3 8h10" />
                </MenuItemIcon>
                Add to playlist
              </MenuSubTrigger>
              <MenuSubContent className="w-48">
                {playlists.slice(0, items).map((name) => (
                  <MenuItem closeOnSelect={closeOnSelect} key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
                <MenuSeparator />
                <MenuItem closeOnSelect={closeOnSelect} value="new-playlist">New playlist…</MenuItem>
              </MenuSubContent>
            </MenuSub>
            <MenuItem closeOnSelect={closeOnSelect} value="share" shortcut="mod+shift+c">
              <MenuItemIcon>
                <Icon d="M8 10V2.5M5 5.5l3-3 3 3M3.5 9v3.5a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V9" />
              </MenuItemIcon>
              Copy link
            </MenuItem>
          </MenuGroup>
          <MenuSeparator />
          <MenuGroup>
            <MenuGroupLabel>Listening</MenuGroupLabel>
            <MenuCheckboxItem value="offline" defaultChecked>
              Download for offline
              <MenuItemIndicator />
            </MenuCheckboxItem>
            <MenuCheckboxItem id="kf-lyrics" value="lyrics">
              Show lyrics
              <MenuItemIndicator />
            </MenuCheckboxItem>
          </MenuGroup>
          <MenuSeparator />
          <MenuItem closeOnSelect={closeOnSelect} value="remove" destructive={destructive}>
            <MenuItemIcon>
              <Icon d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.5 8.5h6l.5-8.5" />
            </MenuItemIcon>
            Remove from library
          </MenuItem>
        </MenuContent>
      </Menu>
    </div>
  )
}
