import * as React from "react"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuGroupLabel,
  ContextMenuItem,
  ContextMenuItemIcon,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

export const controls = {
  disabled: { type: "switch", label: "Disabled", default: false, group: "Behaviour" },
  loop: { type: "switch", label: "Loop", default: true, group: "Behaviour" },
  dismissible: { type: "switch", label: "Dismissible", default: true, group: "Behaviour" },
  closeOnSelect: { type: "switch", label: "Close on select", default: true, group: "Behaviour" },
  destructive: { type: "switch", label: "Destructive", default: true, group: "Behaviour" },
  side: { type: "select", label: "Side", default: "bottom", options: ["bottom", "top", "left", "right"], group: "Behaviour" },
  align: { type: "select", label: "Align", default: "start", options: ["start", "center", "end"], group: "Behaviour" },
  items: { type: "slider", label: "Items", default: 6, min: 1, max: 6, step: 1 },
  albumCount: { type: "slider", label: "Album count", default: 3, min: 1, max: 3, step: 1 },
  title: { type: "text", label: "Title", default: "Sunday kitchen" },
  moveLabel: { type: "text", label: "Move label", default: "Move to album" },
  deleteLabel: { type: "text", label: "Delete label", default: "Delete" },
  width: { type: "slider", label: "Width", default: 208, min: 180, max: 320, step: 1, unit: "px", group: "Layout" },
  rowHeight: { type: "slider", label: "Row height", default: 32, min: 28, max: 44, step: 1, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Radius", default: 14, min: 0, max: 28, step: 1, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Gap", default: 2, min: 0, max: 20, step: 1, unit: "px", group: "Layout" },
  face: { type: "color", label: "Face", default: "", group: "Colours" },
  ink: { type: "color", label: "Ink", default: "", group: "Colours" },
  accent: { type: "color", label: "Accent", default: "", group: "Colours" },
  danger: { type: "color", label: "Danger", default: "", group: "Colours" },
} as const

export const meta = { name: "Context Menu", group: "Menus" }

/* The demo plays itself. A script cannot right-click, so it presses the "…" button on a photo,
   which fires a real right-click (contextmenu) at its own position: the menu unfolds from that point,
   the highlight glides down into the album submenu, then it closes and another photo gets a turn. */
export const play = [
  { click: '[data-more="1"]', wait: 1000 },
  { key: "ArrowDown", wait: 420 },
  { key: "ArrowDown", wait: 420 },
  { key: "ArrowDown", wait: 500 },
  { key: "ArrowRight", wait: 1100 },
  { key: "Escape", wait: 300 },
  { key: "Escape", wait: 1200 },
  { click: '[data-more="5"]', wait: 1100 },
  { key: "ArrowUp", wait: 900 },
  { key: "Escape", wait: 1400 },
]

const photos = [
  { name: "Flat white", src: "/demo/food-1.jpg" },
  { name: "Raspberries", src: "/demo/food-2.jpg" },
  { name: "Peppercorns and garlic", src: "/demo/food-3.jpg" },
  { name: "Last of the grapes", src: "/demo/food-4.jpg" },
  { name: "Tea, second pot", src: "/demo/food-5.jpg" },
  { name: "Raspberries again", src: "/demo/food-6.jpg" },
]

const albums = ["Kitchen", "Market days", "Favourites"]

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  )
}

/* Opens the menu the way a right-click does, from the middle of the "…" button. */
function rightClickFrom(button: HTMLElement) {
  const tile = button.closest<HTMLElement>("[data-slot=menu-context-trigger]")
  if (!tile) return
  const r = button.getBoundingClientRect()
  tile.dispatchEvent(
    new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      button: 2,
      clientX: r.left + r.width / 2,
      clientY: r.top + r.height / 2,
    }),
  )
}

export default function ContextMenuDemo({
  disabled = false,
  loop = true,
  dismissible = true,
  closeOnSelect = true,
  destructive = true,
  side = "bottom",
  align = "start",
  items = 6,
  albumCount = 3,
  title = "Sunday kitchen",
  moveLabel = "Move to album",
  deleteLabel = "Delete",
  width = 208,
  rowHeight = 32,
  radius = 14,
  gap = 2,
  face = "",
  ink = "",
  accent = "",
  danger = "",
}: {
  disabled?: boolean
  loop?: boolean
  dismissible?: boolean
  closeOnSelect?: boolean
  destructive?: boolean
  side?: "bottom" | "top" | "left" | "right"
  align?: "start" | "center" | "end"
  items?: number
  albumCount?: number
  title?: string
  moveLabel?: string
  deleteLabel?: string
  width?: number
  rowHeight?: number
  radius?: number
  gap?: number
  face?: string
  ink?: string
  accent?: string
  danger?: string
}) {
  const theme = {
    "--context-menu-row-height": `${rowHeight}px`,
    "--context-menu-radius": `${radius}px`,
    ...(face ? { "--context-menu-face": face } : null),
    ...(ink ? { "--context-menu-ink": ink } : null),
    ...(accent ? { "--context-menu-accent": accent } : null),
    ...(danger ? { "--context-menu-danger": danger } : null),
  } as React.CSSProperties
  const [active, setActive] = React.useState(0)

  return (
    <div style={theme} className="w-full max-w-[440px]">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
        <span className="text-[12px] text-muted-foreground tabular-nums">{items} photos</span>
      </div>
      <ContextMenu loop={loop} dismissible={dismissible} onPayloadChange={(payload) => setActive(payload as number)}>
        <div className="grid grid-cols-3 gap-2">
          {photos.slice(0, items).map((photo, i) => (
            <ContextMenuTrigger
              disabled={disabled}
              key={photo.name}
              tabIndex={0}
              aria-label={photo.name}
              payload={i}
              className="group/photo relative aspect-[4/3] overflow-hidden rounded-[10px] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.06)] not-data-closed:ring-2 not-data-closed:ring-ring/70 not-data-closed:ring-offset-2 not-data-closed:ring-offset-background"
            >
              <img src={photo.src} alt="" draggable={false} className="absolute inset-0 size-full bg-muted object-cover" />
              <button
                type="button"
                data-more={i}
                aria-label={`More actions for ${photo.name}`}
                tabIndex={-1}
                onClick={(e) => rightClickFrom(e.currentTarget)}
                className="absolute top-1.5 right-1.5 grid size-6 cursor-pointer place-items-center rounded-full bg-background/85 text-foreground opacity-0 shadow-[0_1px_3px_rgb(0_0_0/0.2)] backdrop-blur-sm transition-[opacity,scale] duration-[calc(150ms*var(--kf-speed,1))] ease-house group-hover/photo:opacity-100 group-not-data-closed/photo:opacity-100 active:scale-[0.92] motion-reduce:transition-none"
              >
                <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className="size-3.5">
                  <circle cx="3.5" cy="8" r="1.2" />
                  <circle cx="8" cy="8" r="1.2" />
                  <circle cx="12.5" cy="8" r="1.2" />
                </svg>
              </button>
            </ContextMenuTrigger>
          ))}
        </div>
        <ContextMenuContent style={{ ...theme, width }} side={side} align={align} sideOffset={gap} className="w-52">
          <ContextMenuGroup>
            <ContextMenuGroupLabel className="truncate">{photos[active].name}</ContextMenuGroupLabel>
            <ContextMenuItem closeOnSelect={closeOnSelect} value="rename">
              <ContextMenuItemIcon>
                <Icon d="M10.5 3 13 5.5 6 12.5H3.5V10z" />
              </ContextMenuItemIcon>
              Rename
            </ContextMenuItem>
            <ContextMenuItem closeOnSelect={closeOnSelect} value="duplicate" shortcut="mod+d">
              <ContextMenuItemIcon>
                <Icon d="M5.5 5.5h7v7h-7zM3.5 10.5v-7h7" />
              </ContextMenuItemIcon>
              Duplicate
            </ContextMenuItem>
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <ContextMenuItemIcon>
                  <Icon d="M2.5 5V12.5h11V6.5H8L6.5 5zM2.5 5V3.5h4L8 5" />
                </ContextMenuItemIcon>
                {moveLabel}
              </ContextMenuSubTrigger>
              <ContextMenuSubContent style={theme} className="w-44">
                {albums.slice(0, albumCount).map((album) => (
                  <ContextMenuItem closeOnSelect={closeOnSelect} key={album} value={album}>
                    {album}
                  </ContextMenuItem>
                ))}
                <ContextMenuSeparator />
                <ContextMenuItem closeOnSelect={closeOnSelect} value="new-album">New album…</ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuItem closeOnSelect={closeOnSelect} value="delete" destructive={destructive}>
            <ContextMenuItemIcon>
              <Icon d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.5 8.5h6l.5-8.5" />
            </ContextMenuItemIcon>
            {deleteLabel}
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  )
}
