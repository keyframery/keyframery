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

export default function MenuDemo() {
  return (
    <div className="flex w-[380px] items-center gap-3 rounded-[14px] bg-background p-2.5 pr-3 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
      <div className="relative size-12 shrink-0 overflow-hidden rounded-[9px] bg-primary bg-[repeating-radial-gradient(circle,color-mix(in_oklab,var(--primary-foreground)_9%,transparent)_0_1px,transparent_1px_3px)] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]">
        <span className="absolute inset-0 m-auto size-3.5 rounded-full bg-primary-foreground/90 shadow-[0_0_0_4px_var(--primary)]" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-medium tracking-tight">Slow Morning</div>
        <div className="mt-0.5 truncate text-[12px] text-muted-foreground">Lina Hart · Paper Rooms</div>
      </div>
      <span className="text-[12px] text-muted-foreground tabular-nums">3:42</span>
      <Menu>
        <MenuTrigger aria-label="More actions for Slow Morning" className="w-8 px-0">
          <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <circle cx="3.5" cy="8" r="1.15" />
            <circle cx="8" cy="8" r="1.15" />
            <circle cx="12.5" cy="8" r="1.15" />
          </svg>
        </MenuTrigger>
        <MenuContent align="end" className="w-60">
          <MenuGroup>
            <MenuItem value="play-next" shortcut="mod+enter">
              <MenuItemIcon>
                <Icon d="M2.5 4h7M2.5 8h7M2.5 12h4M11.5 9.5v4l3-2z" />
              </MenuItemIcon>
              Play next
            </MenuItem>
            <MenuItem value="queue" shortcut="mod+shift+q">
              <MenuItemIcon>
                <Icon d="M2.5 4h11M2.5 8h11M2.5 12h6M12 10.5v3M10.5 12h3" />
              </MenuItemIcon>
              Add to queue
            </MenuItem>
            <MenuSub>
              <MenuSubTrigger>
                <MenuItemIcon>
                  <Icon d="M8 3v10M3 8h10" />
                </MenuItemIcon>
                Add to playlist
              </MenuSubTrigger>
              <MenuSubContent className="w-48">
                {playlists.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
                <MenuSeparator />
                <MenuItem value="new-playlist">New playlist…</MenuItem>
              </MenuSubContent>
            </MenuSub>
            <MenuItem value="share" shortcut="mod+shift+c">
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
          <MenuItem value="remove" destructive>
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
