import {
  Tree,
  TreeGroup,
  TreeItem,
  TreeItemIndicator,
  TreeItemLabel,
} from "@/components/ui/tree"

export const meta = { name: "Tree", group: "Navigation" }

/* The demo plays itself: open a folder so its photos cascade in, then let the selected
   row's key glide up and down the list, and fold the folder away again. */
export const play = [
  { click: '[data-value="kyoto"] [data-slot="tree-indicator"]', wait: 1300 },
  { click: '[data-value="kyoto/market"] [data-slot="tree-label"]', wait: 1200 },
  { click: '[data-value="lisbon/arrival"] [data-slot="tree-label"]', wait: 1200 },
  { click: '[data-value="kyoto"] [data-slot="tree-indicator"]', wait: 1100 },
  { click: '[data-value="lisbon/slopes"] [data-slot="tree-label"]', wait: 1600 },
]

type Album = { value: string; label: string; count: number; children?: Album[] }

const library: Album[] = [
  { value: "favourites", label: "Favourites", count: 48 },
  {
    value: "2026",
    label: "2026",
    count: 707,
    children: [
      {
        value: "lisbon",
        label: "Ski week",
        count: 268,
        children: [
          { value: "lisbon/arrival", label: "Arrival day", count: 84 },
          { value: "lisbon/slopes", label: "On the slopes", count: 126 },
          { value: "lisbon/dinner", label: "Team dinner", count: 58 },
        ],
      },
      {
        value: "kyoto",
        label: "Mum's 60th",
        count: 342,
        children: [
          { value: "kyoto/temples", label: "Temples", count: 190 },
          { value: "kyoto/market", label: "Nishiki market", count: 152 },
        ],
      },
      { value: "garden", label: "Garden", count: 97 },
    ],
  },
  {
    value: "2025",
    label: "2025",
    count: 986,
    children: [
      { value: "iceland", label: "Iceland road trip", count: 412 },
      { value: "wedding", label: "Maya’s wedding", count: 318 },
      { value: "flat", label: "The new flat", count: 256 },
    ],
  },
]

const icon = {
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  className: "text-muted-foreground",
} as const

function FolderIcon() {
  return (
    <svg {...icon}>
      <path d="M2.5 5.25c0-.97.78-1.75 1.75-1.75h1.9c.46 0 .9.18 1.24.51l.7.7c.14.14.33.22.53.22h3.13c.97 0 1.75.78 1.75 1.75v4.07c0 .97-.78 1.75-1.75 1.75h-7.5c-.97 0-1.75-.78-1.75-1.75V5.25Z" />
    </svg>
  )
}

function PhotoIcon() {
  return (
    <svg {...icon}>
      <rect x="2.5" y="3" width="11" height="10" rx="2.25" />
      <path d="m2.75 10.75 2.55-2.55a1 1 0 0 1 1.4 0l3.05 3.05M9 10.5l.8-.8a1 1 0 0 1 1.4 0l2.05 2.05" />
      <path d="M10.25 6.25h.01" />
    </svg>
  )
}

function Albums({ albums }: { albums: Album[] }) {
  return albums.map((album) => (
    <TreeItem key={album.value} value={album.value} data-value={album.value}>
      <TreeItemLabel>
        {album.children && <TreeItemIndicator />}
        {album.children ? <FolderIcon /> : <PhotoIcon />}
        <span className="truncate">{album.label}</span>
        <span className="ml-auto pl-3 text-[12px] font-normal text-muted-foreground tabular-nums">
          {album.count}
        </span>
      </TreeItemLabel>
      {album.children && (
        <TreeGroup>
          <Albums albums={album.children} />
        </TreeGroup>
      )}
    </TreeItem>
  ))
}

export default function TreeDemo() {
  return (
    /* A fixed height, so the card grows down as folders open and nothing moves under the pointer. */
    <div className="h-[464px] w-full max-w-[300px]">
      <div className="rounded-[14px] bg-card p-2 text-card-foreground shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
        <div className="flex items-baseline justify-between px-2 pt-2 pb-2.5">
          <h3 className="text-[15px] font-semibold tracking-tight">Photos</h3>
          <span className="text-[12px] text-muted-foreground tabular-nums">1,693 items</span>
        </div>
        <Tree
          aria-label="Photo library"
          defaultExpanded={["2026", "lisbon"]}
          defaultValue="lisbon/slopes"
        >
          <Albums albums={library} />
        </Tree>
      </div>
    </div>
  )
}
