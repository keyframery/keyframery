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

export default function ContextMenuDemo() {
  const [active, setActive] = React.useState(0)

  return (
    <div className="w-[440px]">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-[15px] font-semibold tracking-tight">Sunday kitchen</h3>
        <span className="text-[12px] text-muted-foreground tabular-nums">6 photos</span>
      </div>
      <ContextMenu onPayloadChange={(payload) => setActive(payload as number)}>
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, i) => (
            <ContextMenuTrigger
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
        <ContextMenuContent className="w-52">
          <ContextMenuGroup>
            <ContextMenuGroupLabel className="truncate">{photos[active].name}</ContextMenuGroupLabel>
            <ContextMenuItem value="rename">
              <ContextMenuItemIcon>
                <Icon d="M10.5 3 13 5.5 6 12.5H3.5V10z" />
              </ContextMenuItemIcon>
              Rename
            </ContextMenuItem>
            <ContextMenuItem value="duplicate" shortcut="mod+d">
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
                Move to album
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-44">
                {albums.map((album) => (
                  <ContextMenuItem key={album} value={album}>
                    {album}
                  </ContextMenuItem>
                ))}
                <ContextMenuSeparator />
                <ContextMenuItem value="new-album">New album…</ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuItem value="delete" destructive>
            <ContextMenuItemIcon>
              <Icon d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.5 8.5h6l.5-8.5" />
            </ContextMenuItemIcon>
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  )
}
