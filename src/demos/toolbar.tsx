import * as React from "react"

import {
  Toolbar,
  ToolbarButton,
  ToolbarSeparator,
  ToolbarToggle,
  ToolbarToggleGroup,
} from "@/components/ui/toolbar"
import { cn } from "@/lib/utils"

export const meta = { name: "Toolbar", group: "Actions" }

/* The demo plays itself: far jumps, so the highlight visibly glides along the bar. */
export const play = [
  { click: '[aria-label="Undo"]', wait: 1100 },
  { click: '[aria-label="Align right"]', wait: 1300 },
  { click: '[aria-label="Italic"]', wait: 1100 },
  { click: '[data-play="link"]', wait: 1300 },
  { click: '[aria-label="Align left"]', wait: 1100 },
  { click: '[aria-label="Italic"]', wait: 1500 },
]

function Icon({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={d} />
    </svg>
  )
}

const alignments = [
  { value: "left", label: "Align left", d: "M2.75 4h10.5M2.75 8h6.5M2.75 12h8.5" },
  { value: "center", label: "Align center", d: "M2.75 4h10.5M4.75 8h6.5M3.75 12h8.5" },
  { value: "right", label: "Align right", d: "M2.75 4h10.5M6.75 8h6.5M4.75 12h8.5" },
]

export const controls = {
  orientation: { type: "select", label: "Orientation", options: ["horizontal", "vertical"], default: "horizontal" },
  loop: { type: "switch", label: "Loop", default: true, group: "Behaviour" },
  disabled: { type: "switch", label: "Disabled", default: false, group: "Behaviour" },
  redoDisabled: { type: "switch", label: "Redo disabled", default: true, group: "Behaviour" },
  focusableWhenDisabled: { type: "switch", label: "Focusable when disabled", default: true, group: "Behaviour" },
  multiple: { type: "switch", label: "Multiple", default: true, group: "Behaviour" },
  deselectable: { type: "switch", label: "Deselectable", default: false, group: "Behaviour" },
  items: { type: "slider", label: "Alignments", min: 1, max: 3, step: 1, default: 3, unit: "", group: "Layout" },
  title: { type: "text", label: "Title", default: "Allotment, Saturday" },
  content: { type: "text", label: "Content", default: "Net the brassicas before the pigeons find them." },
  linkLabel: { type: "text", label: "Link label", default: "Link" },
  width: { type: "slider", label: "Width", min: 320, max: 600, step: 1, default: 400, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Gap", min: 0, max: 10, step: 1, default: 2, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Radius", min: 0, max: 24, step: 1, default: 12, unit: "px", group: "Layout" },
  itemRadius: { type: "slider", label: "Item radius", min: 0, max: 16, step: 1, default: 8, unit: "px", group: "Layout" },
  height: { type: "slider", label: "Height", min: 24, max: 40, step: 1, default: 28, unit: "px", group: "Layout" },
  face: { type: "color", label: "Face", default: "", group: "Colours" },
  ink: { type: "color", label: "Ink", default: "", group: "Colours" },
  accent: { type: "color", label: "Accent", default: "", group: "Colours" },
  keyFill: { type: "color", label: "Key", default: "", group: "Colours" },
} as const

export default function ToolbarDemo({
  orientation = "horizontal",
  loop = true,
  disabled = false,
  redoDisabled = true,
  focusableWhenDisabled = true,
  multiple = true,
  deselectable = false,
  items = 3,
  title = "Allotment, Saturday",
  content = "Net the brassicas before the pigeons find them.",
  linkLabel = "Link",
  width = 400,
  gap = 2,
  radius = 12,
  itemRadius = 8,
  height = 28,
  face = "",
  ink = "",
  accent = "",
  keyFill = "",
}: {
  orientation?: "horizontal" | "vertical"
  loop?: boolean
  disabled?: boolean
  redoDisabled?: boolean
  focusableWhenDisabled?: boolean
  multiple?: boolean
  deselectable?: boolean
  items?: number
  title?: string
  content?: string
  linkLabel?: string
  width?: number
  gap?: number
  radius?: number
  itemRadius?: number
  height?: number
  face?: string
  ink?: string
  accent?: string
  keyFill?: string
} = {}) {
  const theme = {
    "--toolbar-gap": `${gap}px`,
    "--toolbar-radius": `${radius}px`,
    "--toolbar-item-radius": `${itemRadius}px`,
    "--toolbar-height": `${height}px`,
    ...(face ? { "--toolbar-face": face } : {}),
    ...(ink ? { "--toolbar-ink": ink } : {}),
    ...(accent ? { "--toolbar-accent": accent } : {}),
    ...(keyFill ? { "--toolbar-key": keyFill } : {}),
  } as React.CSSProperties
  const [styles, setStyles] = React.useState(["bold"])
  const [align, setAlign] = React.useState("left")

  return (
    <div style={{ ...theme, maxWidth: width, display: orientation === "vertical" ? "flex" : undefined, alignItems: "center", gap: 12 }} className="relative mb-5 w-full">
      <article style={{ minWidth: 0, flex: 1 }} className="rounded-[14px] bg-card px-6 pt-5 pb-10 text-card-foreground shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
        <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
        <p className="mt-1 text-[12px] text-muted-foreground">Edited just now</p>
        <p
          className={cn(
            "mt-4 text-[14px] leading-[1.7]",
            align === "center" && "text-center",
            align === "right" && "text-right",
          )}
        >
          Seed potatoes in by ten.{" "}
          <span
            className={cn(
              "rounded-[3px] bg-ring/20 box-decoration-clone px-0.5 py-0.5",
              styles.includes("bold") && "font-semibold",
              styles.includes("italic") && "italic",
              styles.includes("underline") && "underline decoration-[1.5px] underline-offset-[3px]",
            )}
          >
            {content}
          </span>{" "}
          Take the long twine.
        </p>
      </article>

      <Toolbar orientation={orientation} loop={loop} disabled={disabled} aria-label="Formatting" className={orientation === "vertical" ? "relative max-h-[400px] shrink-0 overflow-y-auto" : "absolute -bottom-5 left-1/2 -translate-x-1/2"}>
        <ToolbarButton aria-label="Undo" focusableWhenDisabled={focusableWhenDisabled}>
          <Icon d="M5.75 3.75l-3 3 3 3M3 6.75h6.5a3.25 3.25 0 010 6.5h-2" />
        </ToolbarButton>
        <ToolbarButton aria-label="Redo" disabled={redoDisabled} focusableWhenDisabled={focusableWhenDisabled}>
          <Icon d="M10.25 3.75l3 3-3 3M13 6.75H6.5a3.25 3.25 0 000 6.5h2" />
        </ToolbarButton>
        <ToolbarSeparator />
        <ToolbarToggleGroup multiple={multiple} orientation={orientation} loop={loop} value={multiple ? styles : styles.slice(0, 1)} onValueChange={setStyles} aria-label="Text style">
          <ToolbarToggle value="bold" aria-label="Bold">
            <span className="font-bold">B</span>
          </ToolbarToggle>
          <ToolbarToggle value="italic" aria-label="Italic">
            <span className="italic">I</span>
          </ToolbarToggle>
          <ToolbarToggle value="underline" aria-label="Underline">
            <span className="underline decoration-[1.5px] underline-offset-[3px]">U</span>
          </ToolbarToggle>
        </ToolbarToggleGroup>
        <ToolbarSeparator />
        <ToolbarToggleGroup
          value={align ? [align] : []} orientation={orientation} loop={loop}
          onValueChange={([next]) => setAlign(next ?? "")}
          deselectable={deselectable}
          aria-label="Alignment"
        >
          {alignments.slice(0, items).map((a) => (
            <ToolbarToggle key={a.value} value={a.value} aria-label={a.label}>
              <Icon d={a.d} />
            </ToolbarToggle>
          ))}
        </ToolbarToggleGroup>
        <ToolbarSeparator />
        <ToolbarButton focusableWhenDisabled={focusableWhenDisabled} className="px-2" data-play="link">
          <Icon d="M6.9 9.1a2.6 2.6 0 003.7 0l1.9-1.9a2.6 2.6 0 00-3.7-3.7l-.7.7M9.1 6.9a2.6 2.6 0 00-3.7 0L3.5 8.8a2.6 2.6 0 003.7 3.7l.7-.7" />
          {linkLabel}
        </ToolbarButton>
      </Toolbar>
    </div>
  )
}
