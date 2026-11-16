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

export default function ToggleDemo() {
  const [formats, setFormats] = React.useState<string[]>(["bold"])
  const [align, setAlign] = React.useState<string[]>(["start"])
  const [pinned, setPinned] = React.useState(true)

  const has = (f: string) => formats.includes(f)

  return (
    <div className="w-full max-w-[400px]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ToggleGroup multiple aria-label="Text style" value={formats} onValueChange={setFormats}>
            <Toggle value="bold" aria-label="Bold" size="icon">
              <ToggleIcon><BoldIcon /></ToggleIcon>
            </Toggle>
            <Toggle value="italic" aria-label="Italic" size="icon">
              <ToggleIcon><ItalicIcon /></ToggleIcon>
            </Toggle>
            <Toggle value="underline" aria-label="Underline" size="icon">
              <ToggleIcon><UnderlineIcon /></ToggleIcon>
            </Toggle>
          </ToggleGroup>
          <ToggleGroup
            aria-label="Alignment"
            value={align}
            onValueChange={(next) => next.length && setAlign(next)}
            deselectable={false}
          >
            <Toggle value="start" aria-label="Align left" size="icon">
              <ToggleIcon mirror><AlignStartIcon /></ToggleIcon>
            </Toggle>
            <Toggle value="center" aria-label="Align centre" size="icon">
              <ToggleIcon><AlignCenterIcon /></ToggleIcon>
            </Toggle>
            <Toggle value="end" aria-label="Align right" size="icon">
              <ToggleIcon mirror><AlignEndIcon /></ToggleIcon>
            </Toggle>
          </ToggleGroup>
        </div>
        <Toggle pressed={pinned} onPressedChange={setPinned}>
          <ToggleIcon><PinIcon /></ToggleIcon>
          {pinned ? "Pinned" : "Pin"}
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
          Sourdough, two dozen eggs, ripe tomatoes, a bunch of basil and the good olive oil.
        </p>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Toggle size="sm" defaultPressed>Groceries</Toggle>
        <Toggle size="sm" data-chip="weekend">Weekend</Toggle>
        <Toggle size="sm">Shared</Toggle>
        <Toggle size="sm" disabled>Archived</Toggle>
      </div>
    </div>
  )
}
