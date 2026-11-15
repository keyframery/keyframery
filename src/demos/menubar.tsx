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

export default function MenubarDemo() {
  return (
    <div className="w-[440px] overflow-hidden rounded-[14px] bg-background shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),0_8px_24px_-12px_rgb(0_0_0/0.6)]">
      <div className="flex items-center gap-2 border-b border-border px-1.5 py-1.5">
        <Menubar aria-label="Photos">
          <Menu>
            <MenuTrigger>Photo</MenuTrigger>
            <MenuContent className="w-56">
              <MenuItem value="import" shortcut="mod+shift+i">Import…</MenuItem>
              <MenuItem value="duplicate" shortcut="mod+d">Duplicate</MenuItem>
              <MenuSub>
                <MenuSubTrigger>Export</MenuSubTrigger>
                <MenuSubContent className="w-44">
                  <MenuItem value="jpeg">JPEG</MenuItem>
                  <MenuItem value="png">PNG</MenuItem>
                  <MenuItem value="original">Unmodified original</MenuItem>
                </MenuSubContent>
              </MenuSub>
              <MenuSeparator />
              <MenuItem value="trash" shortcut="mod+backspace" destructive>
                Move to Trash
              </MenuItem>
            </MenuContent>
          </Menu>
          <Menu>
            <MenuTrigger>Edit</MenuTrigger>
            <MenuContent className="w-52">
              <MenuItem value="undo" shortcut="mod+z" disabled>Undo</MenuItem>
              <MenuItem value="redo" shortcut="mod+shift+z">Redo</MenuItem>
              <MenuSeparator />
              <MenuItem value="crop" shortcut="c">Crop</MenuItem>
              <MenuItem value="rotate" shortcut="mod+r">Rotate</MenuItem>
              <MenuItem value="adjust" shortcut="a">Adjust colour</MenuItem>
            </MenuContent>
          </Menu>
          <Menu>
            <MenuTrigger>View</MenuTrigger>
            <MenuContent className="w-52">
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
          <Menu>
            <MenuTrigger>Share</MenuTrigger>
            <MenuContent className="w-48">
              <MenuItem value="link">Copy link</MenuItem>
              <MenuItem value="album">Add to shared album</MenuItem>
              <MenuItem value="email">Email</MenuItem>
            </MenuContent>
          </Menu>
        </Menubar>
      </div>
      <div className="p-3">
        <div className="mb-2.5 flex items-baseline justify-between px-0.5">
          <span className="text-[13px] font-medium">Hill walk, March</span>
          <span className="text-[12px] text-muted-foreground tabular-nums">31 photos</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {tiles.map((id) => (
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
