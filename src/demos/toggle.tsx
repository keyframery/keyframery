import * as React from "react"

import { Toggle, ToggleGroup, ToggleIcon } from "@/components/ui/toggle"

export const meta = { name: "Toggle", group: "Actions" }

/* The demo plays itself: toggles press and release, so each pressed surface pops in and out. */
export const play = [
  { click: '[aria-label="Italic"]', wait: 900 },
  { click: '[aria-label="Align centre"]', wait: 900 },
  { click: '[data-chip="weekend"]', wait: 900 },
  { click: '[aria-label="Italic"]', wait: 900 },
  { click: '[aria-label="Align left"]', wait: 900 },
  { click: '[data-chip="weekend"]', wait: 1400 },
]

const icon = {
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const

const BoldIcon = () => (
  <svg {...icon} strokeWidth={1.75}>
    <path d="M4.75 3h4a2.5 2.5 0 0 1 0 5h-4zM4.75 8h4.75a2.5 2.5 0 0 1 0 5H4.75z" />
  </svg>
)
const ItalicIcon = () => (
  <svg {...icon}>
    <path d="M10.5 3H6.5M9.5 13h-4M9 3 7 13" />
  </svg>
)
const UnderlineIcon = () => (
  <svg {...icon}>
    <path d="M4.5 2.75V7a3.5 3.5 0 0 0 7 0V2.75M3.5 13.5h9" />
  </svg>
)
const AlignStartIcon = () => (
  <svg {...icon}>
    <path d="M2.75 4h10.5M2.75 8h6.5M2.75 12h8.5" />
  </svg>
)
const AlignCenterIcon = () => (
  <svg {...icon}>
    <path d="M2.75 4h10.5M4.75 8h6.5M3.75 12h8.5" />
  </svg>
)
const AlignEndIcon = () => (
  <svg {...icon}>
    <path d="M2.75 4h10.5M6.75 8h6.5M4.75 12h8.5" />
  </svg>
)
const PinIcon = () => (
  <svg {...icon}>
    <path d="M9.75 2.5 13.5 6.25l-2 .75-2.25 2.25-.5 2.75L4.25 7.5 7 7l2.25-2.25z M6.5 9.5 3 13" />
  </svg>
)

export const controls = {
  size: { type: "select", label: "Size", options: ["original", "sm", "md", "icon-sm", "icon"], default: "original" },
  orientation: { type: "select", label: "Orientation", options: ["horizontal", "vertical"], default: "horizontal" },
  disabled: { type: "switch", label: "Disabled", default: false, group: "Behaviour" },
  focusableWhenDisabled: { type: "switch", label: "Focusable when disabled", default: false, group: "Behaviour" },
  multiple: { type: "switch", label: "Multiple", default: true, group: "Behaviour" },
  deselectable: { type: "switch", label: "Deselectable", default: false, group: "Behaviour" },
  loop: { type: "switch", label: "Loop", default: true, group: "Behaviour" },
  archivedDisabled: { type: "switch", label: "Archived disabled", default: true, group: "Behaviour" },
  direction: { type: "select", label: "Text direction", options: ["ltr", "rtl"], default: "ltr" },
  mirror: { type: "switch", label: "Mirror", default: true, group: "Behaviour" },
  items: { type: "slider", label: "Chips", min: 1, max: 4, step: 1, default: 4, unit: "", group: "Layout" },
  content: { type: "text", label: "Content", default: "Sourdough, two dozen eggs, ripe tomatoes, a bunch of basil and the good olive oil." },
  width: { type: "slider", label: "Width", min: 340, max: 600, step: 1, default: 400, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Gap", min: 0, max: 12, step: 1, default: 2, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Radius", min: 0, max: 20, step: 1, default: 9, unit: "px", group: "Layout" },
  groupRadius: { type: "slider", label: "Group radius", min: 0, max: 24, step: 1, default: 12, unit: "px", group: "Layout" },
  track: { type: "color", label: "Track", default: "", group: "Colours" },
  keyFill: { type: "color", label: "Key", default: "", group: "Colours" },
  ink: { type: "color", label: "Ink", default: "", group: "Colours" },
} as const

export default function ToggleDemo({
  size = "original",
  orientation = "horizontal",
  disabled = false,
  focusableWhenDisabled = false,
  multiple = true,
  deselectable = false,
  loop = true,
  archivedDisabled = true,
  direction = "ltr",
  mirror = true,
  items = 4,
  content = "Sourdough, two dozen eggs, ripe tomatoes, a bunch of basil and the good olive oil.",
  width = 400,
  gap = 2,
  radius = 9,
  groupRadius = 12,
  track = "",
  keyFill = "",
  ink = "",
}: {
  size?: "original" | "sm" | "md" | "icon-sm" | "icon"
  orientation?: "horizontal" | "vertical"
  disabled?: boolean
  focusableWhenDisabled?: boolean
  multiple?: boolean
  deselectable?: boolean
  loop?: boolean
  archivedDisabled?: boolean
  direction?: "ltr" | "rtl"
  mirror?: boolean
  items?: number
  content?: string
  width?: number
  gap?: number
  radius?: number
  groupRadius?: number
  track?: string
  keyFill?: string
  ink?: string
} = {}) {
  const theme = {
    "--toggle-gap": `${gap}px`,
    "--toggle-group-radius": `${groupRadius}px`,
    ...(track ? { "--toggle-track": track } : {}),
    ...(keyFill ? { "--toggle-key": keyFill } : {}),
    ...(ink ? { "--toggle-ink": ink } : {}),
    ...(radius !== 9 ? { "--toggle-radius": `${radius}px` } : {}),
  } as React.CSSProperties
  const [formats, setFormats] = React.useState<string[]>(["bold"])
  const [align, setAlign] = React.useState<string[]>(["start"])
  const [pinned, setPinned] = React.useState(true)

  const has = (f: string) => formats.includes(f)

  return (
    <div dir={direction} style={{ ...theme, maxWidth: width }} className="w-full">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ToggleGroup multiple={multiple} orientation={orientation} loop={loop} disabled={disabled} aria-label="Text style" value={formats} onValueChange={setFormats}>
            <Toggle value="bold" aria-label="Bold" size={size === "original" ? "icon" : size}>
              <ToggleIcon><BoldIcon /></ToggleIcon>
            </Toggle>
            <Toggle value="italic" aria-label="Italic" size={size === "original" ? "icon" : size}>
              <ToggleIcon><ItalicIcon /></ToggleIcon>
            </Toggle>
            <Toggle value="underline" aria-label="Underline" size={size === "original" ? "icon" : size}>
              <ToggleIcon><UnderlineIcon /></ToggleIcon>
            </Toggle>
          </ToggleGroup>
          <ToggleGroup
            aria-label="Alignment"
            value={align}
            onValueChange={(next) => setAlign(next)}
            deselectable={deselectable} orientation={orientation} loop={loop} disabled={disabled}
          >
            <Toggle value="start" aria-label="Align left" size={size === "original" ? "icon" : size}>
              <ToggleIcon mirror={mirror}><AlignStartIcon /></ToggleIcon>
            </Toggle>
            <Toggle value="center" aria-label="Align centre" size={size === "original" ? "icon" : size}>
              <ToggleIcon><AlignCenterIcon /></ToggleIcon>
            </Toggle>
            <Toggle value="end" aria-label="Align right" size={size === "original" ? "icon" : size}>
              <ToggleIcon mirror={mirror}><AlignEndIcon /></ToggleIcon>
            </Toggle>
          </ToggleGroup>
        </div>
        <Toggle aria-label={pinned ? "Pinned" : "Pin"} size={size === "original" ? "md" : size} disabled={disabled} focusableWhenDisabled={focusableWhenDisabled} pressed={pinned} onPressedChange={setPinned}>
          <ToggleIcon><PinIcon /></ToggleIcon>
          {size !== "icon" && size !== "icon-sm" && (pinned ? "Pinned" : "Pin")}
        </Toggle>
      </div>

      <div
        className={[
          "mt-4 rounded-[12px] bg-background px-4 py-3.5 text-[13px] leading-relaxed",
          "shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_1px_2px_rgb(0_0_0/0.04)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]",
          align[0] === "center" ? "text-center" : align[0] === "end" ? "text-right" : "text-left",
        ].join(" ")}
      >
        <p className="text-[11px] font-medium text-muted-foreground">Saturday market · 08:30</p>
        <p
          className={[
            "mt-1.5",
            has("bold") ? "font-semibold" : "",
            has("italic") ? "italic" : "",
            has("underline") ? "underline decoration-foreground/30 underline-offset-[3px]" : "",
          ].join(" ")}
        >
          {content}
        </p>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {["Groceries", "Weekend", "Shared", "Archived"].slice(0, items).map((label, i) => <Toggle key={label} aria-label={label} size={size === "original" ? "sm" : size} defaultPressed={i === 0} disabled={disabled || (i === 3 && archivedDisabled)} focusableWhenDisabled={focusableWhenDisabled} data-chip={i === 1 ? "weekend" : undefined}>{size === "icon" || size === "icon-sm" ? label[0] : label}</Toggle>)}
      </div>
    </div>
  )
}
