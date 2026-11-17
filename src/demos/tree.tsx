import * as React from "react"

import {
  Tree,
  TreeGroup,
  TreeItem,
  TreeItemIndicator,
  TreeItemCheckbox,
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

function Albums({ albums, checkable }: { albums: Album[]; checkable: boolean }) {
  return albums.map((album) => (
    <TreeItem key={album.value} value={album.value} data-value={album.value}>
      <TreeItemLabel>
        {album.children && <TreeItemIndicator />}
        {checkable && <TreeItemCheckbox />}
        {album.children ? <FolderIcon /> : <PhotoIcon />}
        <span className="truncate">{album.label}</span>
        <span className="ml-auto pl-3 text-[12px] font-normal text-muted-foreground tabular-nums">
          {album.count}
        </span>
      </TreeItemLabel>
      {album.children && (
        <TreeGroup>
          <Albums albums={album.children} checkable={checkable} />
        </TreeGroup>
      )}
    </TreeItem>
  ))
}

export const controls = {
  mode: { type: "select", label: "Mode", options: ["single", "multiple", "none"], default: "single" },
  activation: { type: "select", label: "Activation", options: ["manual", "automatic"], default: "manual" },
  checkable: { type: "switch", label: "Checkable", default: false, group: "Behaviour" },
  checkStrategy: { type: "select", label: "Check strategy", options: ["leaf", "trunk", "branch", "independent"], default: "leaf" },
  expandOnPress: { type: "switch", label: "Expand on press", default: true, group: "Behaviour" },
  disabled: { type: "switch", label: "Disabled", default: false, group: "Behaviour" },
  focusableWhenDisabled: { type: "switch", label: "Focusable when disabled", default: true, group: "Behaviour" },
  keepMounted: { type: "switch", label: "Keep mounted", default: false, group: "Behaviour" },
  hiddenUntilFound: { type: "switch", label: "Hidden until found", default: false, group: "Behaviour" },
  current: { type: "select", label: "Current", options: ["none", "lisbon/slopes", "kyoto/market", "favourites"], default: "none" },
  items: { type: "slider", label: "Top-level albums", min: 1, max: 3, step: 1, default: 3, unit: "", group: "Layout" },
  title: { type: "text", label: "Title", default: "Photos" },
  countText: { type: "text", label: "Count text", default: "1,693 items" },
  width: { type: "slider", label: "Width", min: 260, max: 480, step: 1, default: 300, unit: "px", group: "Layout" },
  height: { type: "slider", label: "Row height", min: 24, max: 40, step: 1, default: 28, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Radius", min: 0, max: 18, step: 1, default: 8, unit: "px", group: "Layout" },
  indent: { type: "slider", label: "Indent gap", min: 12, max: 36, step: 1, default: 22, unit: "px", group: "Layout" },
  ink: { type: "color", label: "Ink", default: "", group: "Colours" },
  accent: { type: "color", label: "Accent", default: "", group: "Colours" },
  guide: { type: "color", label: "Guide", default: "", group: "Colours" },
} as const

export default function TreeDemo({
  mode = "single",
  activation = "manual",
  checkable = false,
  checkStrategy = "leaf",
  expandOnPress = true,
  disabled = false,
  focusableWhenDisabled = true,
  keepMounted = false,
  hiddenUntilFound = false,
  current = "none",
  items = 3,
  title = "Photos",
  countText = "1,693 items",
  width = 300,
  height = 28,
  radius = 8,
  indent = 22,
  ink = "",
  accent = "",
  guide = "",
}: {
  mode?: "single" | "multiple" | "none"
  activation?: "manual" | "automatic"
  checkable?: boolean
  checkStrategy?: "leaf" | "trunk" | "branch" | "independent"
  expandOnPress?: boolean
  disabled?: boolean
  focusableWhenDisabled?: boolean
  keepMounted?: boolean
  hiddenUntilFound?: boolean
  current?: "none" | "lisbon/slopes" | "kyoto/market" | "favourites"
  items?: number
  title?: string
  countText?: string
  width?: number
  height?: number
  radius?: number
  indent?: number
  ink?: string
  accent?: string
  guide?: string
} = {}) {
  const theme = {
    "--tree-height": `${height}px`,
    "--tree-radius": `${radius}px`,
    "--tree-indent": `${indent}px`,
    ...(ink ? { "--tree-ink": ink } : {}),
    ...(accent ? { "--tree-accent": accent } : {}),
    ...(guide ? { "--tree-guide": guide } : {}),
  } as React.CSSProperties
  const [checked, setChecked] = React.useState<string[]>([])
  return (
    /* A fixed height, so the card grows down as folders open and nothing moves under the pointer. */
    <div style={{ ...theme, maxWidth: width }} className="h-[464px] w-full">
      <div className="rounded-[14px] bg-card p-2 text-card-foreground shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
        <div className="flex items-baseline justify-between px-2 pt-2 pb-2.5">
          <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
          <span className="text-[12px] text-muted-foreground tabular-nums">{checkable ? `${checked.length} checked` : countText}</span>
        </div>
        <Tree<"single" | "multiple" | "none"> key={mode} mode={mode} activation={activation} checkable={checkable} checked={checked} onCheckedChange={setChecked} checkStrategy={checkStrategy} expandOnPress={expandOnPress} disabled={disabled} focusableWhenDisabled={focusableWhenDisabled} keepMounted={keepMounted} hiddenUntilFound={hiddenUntilFound} current={current === "none" ? null : current}
          aria-label="Photo library"
          defaultExpanded={["2026", "lisbon"]}
          defaultValue={mode === "multiple" ? ["lisbon/slopes"] : mode === "none" ? undefined : "lisbon/slopes"}
        >
          <Albums albums={library.slice(0, items)} checkable={checkable} />
        </Tree>
      </div>
    </div>
  )
}
