import * as React from "react"

import {
  Menu,
  Menubar,
  MenuCheckboxItem,
  MenuContent,
  MenuGroupLabel,
  MenuItem,
  MenuItemIndicator,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "@/components/ui/menubar"

export const meta = { name: "Menubar", group: "Menus" }

/* The demo plays itself: a menu unfolds, the highlight glides down it, the bar's highlight glides
   to the next menus, a sort order is picked and its check draws, then everything closes. */
export const play = [
  { click: "[data-slot=menubar] > [data-slot=menu-trigger]:nth-of-type(1)", wait: 900 },
  { key: "ArrowDown", wait: 600 },
  { key: "ArrowRight", wait: 900 },
  { key: "ArrowRight", wait: 900 },
  { key: "ArrowDown", wait: 450 },
  { key: "ArrowDown", wait: 600 },
  { click: "#kf-sort-name", wait: 1000 },
  { key: "Escape", wait: 1400 },
]

const tiles = [28, 29, 15, 17, 18, 19]

export const controls = {
  orientation: { type: "select", label: "Orientation", default: "horizontal", options: ["horizontal", "vertical"] },
  side: { type: "select", label: "Menu side", default: "bottom", options: ["top", "right", "bottom", "left"] },
  align: { type: "select", label: "Menu alignment", default: "start", options: ["start", "center", "end"] },
  modal: { type: "select", label: "Modality", default: "pointer", options: ["pointer", "modal", "non-modal"] },
  disabled: { type: "switch", label: "Disabled", default: false, group: "Behaviour" },
  loop: { type: "switch", label: "Loop navigation", default: true, group: "Behaviour" },
  closeOnSelect: { type: "switch", label: "Close on action", default: true, group: "Behaviour" },
  dismissible: { type: "switch", label: "Dismissible", default: true, group: "Behaviour" },
  undoDisabled: { type: "switch", label: "Disable Undo", default: true, group: "Behaviour" },
  title: { type: "text", label: "Album", default: "Hill walk, March" },
  photoLabel: { type: "text", label: "First menu", default: "Photo" },
  items: { type: "slider", label: "Preview photos", default: 6, min: 1, max: 6, step: 1, unit: "", group: "Layout" },
  width: { type: "slider", label: "Album width", default: 440, min: 300, max: 480, step: 1, unit: "px", group: "Layout" },
  menuWidth: { type: "slider", label: "Photo menu width", default: 224, min: 192, max: 320, step: 1, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Trigger gap", default: 2, min: 0, max: 16, step: 1, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Corners", default: 14, min: 0, max: 28, step: 1, unit: "px", group: "Layout" },
  surface: { type: "color", label: "Menu", default: "", group: "Colours" },
  ink: { type: "color", label: "Text", default: "", group: "Colours" },
  highlight: { type: "color", label: "Highlight", default: "", group: "Colours" },
  danger: { type: "color", label: "Destructive", default: "", group: "Colours" },
} as const

export default function MenubarDemo({
  orientation = "horizontal",
  side = "bottom",
  align = "start",
  modal = "pointer",
  disabled = false,
  loop = true,
  closeOnSelect = true,
  dismissible = true,
  undoDisabled = true,
  title = "Hill walk, March",
  photoLabel = "Photo",
  items = 6,
  width = 440,
  menuWidth = 224,
  gap = 2,
  radius = 14,
  surface = "",
  ink = "",
  highlight = "",
  danger = "",
}: {
  orientation?: "horizontal" | "vertical"
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  modal?: "pointer" | "modal" | "non-modal"
  disabled?: boolean
  loop?: boolean
  closeOnSelect?: boolean
  dismissible?: boolean
  undoDisabled?: boolean
  title?: string
  photoLabel?: string
  items?: number
  width?: number
  menuWidth?: number
  gap?: number
  radius?: number
  surface?: string
  ink?: string
  highlight?: string
  danger?: string
}) {
  const theme = {
    "--menubar-radius": `${radius}px`,
    "--menubar-item-radius": `${radius * 8 / 14}px`,
    "--menubar-gap": `${gap}px`,
    ...(surface ? { "--menubar-surface": surface } : {}),
    ...(ink ? { "--menubar-ink": ink } : {}),
    ...(highlight ? { "--menubar-highlight": highlight } : {}),
    ...(danger ? { "--menubar-danger": danger } : {}),
  } as React.CSSProperties
  return (
    <div style={{ ...theme, maxWidth: width }} className="w-full max-w-[440px] overflow-hidden rounded-[14px] bg-background shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),0_8px_24px_-12px_rgb(0_0_0/0.6)]">
      <div className="flex items-center gap-2 border-b border-border px-1.5 py-1.5">
        <Menubar aria-label="Photos" orientation={orientation} disabled={disabled} loop={loop} modal={modal === "pointer" ? "pointer" : modal === "modal"}>
          <Menu loop={loop} dismissible={dismissible}>
            <MenuTrigger>{photoLabel}</MenuTrigger>
            <MenuContent side={side} align={align} style={{ width: menuWidth }} className="w-56">
              <MenuItem closeOnSelect={closeOnSelect} value="import" shortcut="mod+shift+i">Import…</MenuItem>
              <MenuItem closeOnSelect={closeOnSelect} value="duplicate" shortcut="mod+d">Duplicate</MenuItem>
              <MenuSub>
                <MenuSubTrigger>Export</MenuSubTrigger>
                <MenuSubContent className="w-44">
                  <MenuItem closeOnSelect={closeOnSelect} value="jpeg">JPEG</MenuItem>
                  <MenuItem closeOnSelect={closeOnSelect} value="png">PNG</MenuItem>
                  <MenuItem closeOnSelect={closeOnSelect} value="original">Unmodified original</MenuItem>
                </MenuSubContent>
              </MenuSub>
              <MenuSeparator />
              <MenuItem closeOnSelect={closeOnSelect} value="trash" shortcut="mod+backspace" destructive>
                Move to Trash
              </MenuItem>
            </MenuContent>
          </Menu>
          <Menu loop={loop} dismissible={dismissible}>
            <MenuTrigger>Edit</MenuTrigger>
            <MenuContent side={side} align={align} style={{ width: menuWidth - 16 }} className="w-52">
              <MenuItem closeOnSelect={closeOnSelect} value="undo" shortcut="mod+z" disabled={undoDisabled}>Undo</MenuItem>
              <MenuItem closeOnSelect={closeOnSelect} value="redo" shortcut="mod+shift+z">Redo</MenuItem>
              <MenuSeparator />
              <MenuItem closeOnSelect={closeOnSelect} value="crop" shortcut="c">Crop</MenuItem>
              <MenuItem closeOnSelect={closeOnSelect} value="rotate" shortcut="mod+r">Rotate</MenuItem>
              <MenuItem closeOnSelect={closeOnSelect} value="adjust" shortcut="a">Adjust colour</MenuItem>
            </MenuContent>
          </Menu>
          <Menu loop={loop} dismissible={dismissible}>
            <MenuTrigger>View</MenuTrigger>
            <MenuContent side={side} align={align} style={{ width: menuWidth - 16 }} className="w-52">
              <MenuCheckboxItem value="filmstrip" defaultChecked>
                Show filmstrip
                <MenuItemIndicator />
              </MenuCheckboxItem>
              <MenuCheckboxItem value="info">
                Show info
                <MenuItemIndicator />
              </MenuCheckboxItem>
              <MenuSeparator />
              <MenuRadioGroup defaultValue="date">
                <MenuGroupLabel>Sort by</MenuGroupLabel>
                <MenuRadioItem value="date">
                  Date taken
                  <MenuItemIndicator />
                </MenuRadioItem>
                <MenuRadioItem id="kf-sort-name" value="name">
                  Name
                  <MenuItemIndicator />
                </MenuRadioItem>
                <MenuRadioItem value="rating">
                  Rating
                  <MenuItemIndicator />
                </MenuRadioItem>
              </MenuRadioGroup>
            </MenuContent>
          </Menu>
          <Menu loop={loop} dismissible={dismissible}>
            <MenuTrigger>Share</MenuTrigger>
            <MenuContent side={side} align={align} style={{ width: menuWidth - 32 }} className="w-48">
              <MenuItem closeOnSelect={closeOnSelect} value="link">Copy link</MenuItem>
              <MenuItem closeOnSelect={closeOnSelect} value="album">Add to shared album</MenuItem>
              <MenuItem closeOnSelect={closeOnSelect} value="email">Email</MenuItem>
            </MenuContent>
          </Menu>
        </Menubar>
      </div>
      <div className="p-3">
        <div className="mb-2.5 flex items-baseline justify-between px-0.5">
          <span className="text-[13px] font-medium">{title}</span>
          <span className="text-[12px] text-muted-foreground tabular-nums">31 photos</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {tiles.slice(0, items).map((id) => (
            <img
              key={id}
              src={`/demo/walk-${id}.jpg`}
              alt=""
              draggable={false}
              className="block aspect-[4/3] w-full rounded-[8px] bg-muted object-cover"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
