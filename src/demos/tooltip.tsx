import * as React from "react"

import { Tooltip, TooltipContent, TooltipShortcut, TooltipTrigger } from "@/components/ui/tooltip"

export const meta = { name: "Tooltip", group: "Overlays" }

/* The demo plays itself: the first tip pops out after its delay, the next ones follow the
   pointer at once along the row, then the pointer leaves for the title and the last tip goes. */
export const play = [
  { hover: '[aria-label="Previous song"]', wait: 1500 },
  { hover: '[aria-label="Play"]', unhover: '[aria-label="Previous song"]', wait: 800 },
  { hover: '[aria-label="Next song"]', unhover: '[aria-label="Play"]', wait: 800 },
  { unhover: '[aria-label="Next song"]', wait: 0 },
  { hover: "[data-play=away]", wait: 1600 },
]

const iconKey = [
  "grid size-8 cursor-pointer place-items-center rounded-[9px] text-muted-foreground select-none",
  "transition-[color,background-color,scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop",
  "hover:bg-foreground/[0.06] hover:text-foreground active:scale-[0.96]",
  "relative aria-pressed:text-foreground",
  "after:absolute after:bottom-0.5 after:left-1/2 after:size-[3px] after:-translate-x-1/2 after:rounded-full after:bg-current after:opacity-0 after:transition-opacity after:duration-[calc(150ms*var(--kf-speed,1))] after:ease-house motion-reduce:after:transition-none aria-pressed:after:opacity-100",
  "motion-reduce:transition-none [&_svg]:size-4",
].join(" ")

const playKey = [
  "grid size-10 cursor-pointer place-items-center rounded-full bg-primary text-primary-foreground select-none",
  "shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.25)] dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.7),0_1px_2px_rgb(0_0_0/0.5)]",
  "transition-[background-color,scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop",
  "hover:bg-[color-mix(in_oklab,var(--primary),var(--background)_14%)] active:scale-[0.96]",
  "motion-reduce:transition-none [&_svg]:size-4",
].join(" ")

function Icon({ d, fill }: { d: string; fill?: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill={fill ? "currentColor" : "none"}
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

const icons = {
  shuffle: "M2.5 4.5h2.2c1.2 0 2.2.6 2.9 1.6l1.8 3.8c.7 1 1.7 1.6 2.9 1.6h1.2M11.5 9.5l2 2-2 2M2.5 11.5h2.2c.9 0 1.7-.4 2.3-1M11.5 2.5l2 2-2 2M9 6c.6-.9 1.5-1.5 2.6-1.5h1.9",
  previous: "M4 3.5v9M12 3.8v8.4a.5.5 0 0 1-.8.4L5.6 8.4a.5.5 0 0 1 0-.8l5.6-4.2a.5.5 0 0 1 .8.4Z",
  next: "M12 3.5v9M4 3.8v8.4a.5.5 0 0 0 .8.4l5.6-4.2a.5.5 0 0 0 0-.8L4.8 3.4a.5.5 0 0 0-.8.4Z",
  play: "M5 3.4v9.2a.6.6 0 0 0 .9.5l7.4-4.6a.6.6 0 0 0 0-1L5.9 2.9a.6.6 0 0 0-.9.5Z",
  pause: "M5.5 3.5v9M10.5 3.5v9",
  repeat: "M3 7.5V6.5a2 2 0 0 1 2-2h8.5M11.5 2.5l2 2-2 2M13 8.5v1a2 2 0 0 1-2 2H2.5M4.5 13.5l-2-2 2-2",
}

export const controls = {
  side: { type: "select", label: "Side", options: ["top", "right", "bottom", "left"], default: "top" },
  align: { type: "select", label: "Align", options: ["start", "center", "end"], default: "center" },
  sideOffset: { type: "slider", label: "Trigger gap", min: 0, max: 24, step: 1, default: 6, unit: "px", group: "Layout" },
  disabled: { type: "switch", label: "Disabled", default: false, group: "Behaviour" },
  toggleable: { type: "switch", label: "Toggleable", default: false, group: "Behaviour" },
  closeOnPress: { type: "switch", label: "Close on press", default: true, group: "Behaviour" },
  type: { type: "select", label: "Type", options: ["auto", "label", "description"], default: "auto" },
  delay: { type: "slider", label: "Hover delay", min: 0, max: 1200, step: 1, default: 600, unit: "ms", group: "Behaviour" },
  closeDelay: { type: "slider", label: "Close delay", min: 0, max: 600, step: 1, default: 0, unit: "ms", group: "Behaviour" },
  showShortcuts: { type: "switch", label: "Show shortcuts", default: true, group: "Behaviour" },
  items: { type: "slider", label: "Buttons", min: 3, max: 5, step: 1, default: 5, unit: "", group: "Layout" },
  title: { type: "text", label: "Title", default: "Sunday Morning Coffee" },
  subtitle: { type: "text", label: "Subtitle", default: "24 songs, about an hour and a half" },
  previousLabel: { type: "text", label: "Previous label", default: "Previous" },
  width: { type: "slider", label: "Tooltip max width", min: 120, max: 360, step: 1, default: 256, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Radius", min: 0, max: 20, step: 1, default: 8, unit: "px", group: "Layout" },
  font: { type: "slider", label: "Font", min: 10, max: 18, step: 1, default: 12, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Gap", min: 2, max: 20, step: 1, default: 8, unit: "px", group: "Layout" },
  face: { type: "color", label: "Face", default: "", group: "Colours" },
  ink: { type: "color", label: "Ink", default: "", group: "Colours" },
} as const

export default function TooltipDemo({
  side = "top",
  align = "center",
  sideOffset = 6,
  disabled = false,
  toggleable = false,
  closeOnPress = true,
  type = "auto",
  delay = 600,
  closeDelay = 0,
  showShortcuts = true,
  items = 5,
  title = "Sunday Morning Coffee",
  subtitle = "24 songs, about an hour and a half",
  previousLabel = "Previous",
  width = 256,
  radius = 8,
  font = 12,
  gap = 8,
  face = "",
  ink = "",
}: {
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  sideOffset?: number
  disabled?: boolean
  toggleable?: boolean
  closeOnPress?: boolean
  type?: "auto" | "label" | "description"
  delay?: number
  closeDelay?: number
  showShortcuts?: boolean
  items?: number
  title?: string
  subtitle?: string
  previousLabel?: string
  width?: number
  radius?: number
  font?: number
  gap?: number
  face?: string
  ink?: string
} = {}) {
  const theme = {
    "--tooltip-width": `${width}px`,
    "--tooltip-radius": `${radius}px`,
    "--tooltip-font": `${font}px`,
    "--tooltip-gap": `${gap}px`,
    ...(face ? { "--tooltip-face": face } : {}),
    ...(ink ? { "--tooltip-ink": ink } : {}),
  } as React.CSSProperties
  const [playing, setPlaying] = React.useState(false)
  const [shuffle, setShuffle] = React.useState(true)
  const [repeat, setRepeat] = React.useState(false)

  return (
    <div style={theme} className="w-full max-w-[340px] rounded-[16px] bg-muted/60 p-4">
      <div className="flex items-center gap-3">
        <img src="/demo/cup.jpg" alt="" className="size-11 shrink-0 rounded-[10px] bg-muted object-cover" />
        <div className="min-w-0 flex-1">
          <div data-play="away" className="truncate text-[14px] font-semibold tracking-tight">{title}</div>
          <div className="truncate text-[12px] text-muted-foreground">{subtitle}</div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between px-1">
        {items >= 4 && <Tooltip disabled={disabled} toggleable={toggleable} closeOnPress={closeOnPress} delay={delay} closeDelay={closeDelay} type={type === "auto" ? undefined : type} shortcut="s">
          <TooltipTrigger
            aria-label="Shuffle"
            aria-pressed={shuffle}
            className={iconKey}
            onClick={() => setShuffle((s) => !s)}
          >
            <Icon d={icons.shuffle} />
          </TooltipTrigger>
          <TooltipContent style={theme} side={side} align={align} sideOffset={sideOffset}>
            {shuffle ? "Shuffle is on" : "Shuffle"}
            {showShortcuts && <TooltipShortcut />}
          </TooltipContent>
        </Tooltip>}
        <Tooltip disabled={disabled} toggleable={toggleable} closeOnPress={closeOnPress} delay={delay} closeDelay={closeDelay} type={type === "auto" ? undefined : type} shortcut="j">
          <TooltipTrigger aria-label="Previous song" className={iconKey}>
            <Icon d={icons.previous} />
          </TooltipTrigger>
          <TooltipContent style={theme} side={side} align={align} sideOffset={sideOffset}>
            {previousLabel}
            {showShortcuts && <TooltipShortcut />}
          </TooltipContent>
        </Tooltip>
        <Tooltip disabled={disabled} toggleable={toggleable} closeOnPress={closeOnPress} delay={delay} closeDelay={closeDelay} type={type === "auto" ? undefined : type} shortcut="k">
          <TooltipTrigger aria-label={playing ? "Pause" : "Play"} className={playKey} onClick={() => setPlaying((p) => !p)}>
            <Icon d={playing ? icons.pause : icons.play} fill={!playing} />
          </TooltipTrigger>
          <TooltipContent style={theme} side={side} align={align} sideOffset={sideOffset}>
            {playing ? "Pause" : "Play"}
            {showShortcuts && <TooltipShortcut />}
          </TooltipContent>
        </Tooltip>
        <Tooltip disabled={disabled} toggleable={toggleable} closeOnPress={closeOnPress} delay={delay} closeDelay={closeDelay} type={type === "auto" ? undefined : type} shortcut="l">
          <TooltipTrigger aria-label="Next song" className={iconKey}>
            <Icon d={icons.next} />
          </TooltipTrigger>
          <TooltipContent style={theme} side={side} align={align} sideOffset={sideOffset}>
            Next
            {showShortcuts && <TooltipShortcut />}
          </TooltipContent>
        </Tooltip>
        {items >= 5 && <Tooltip disabled={disabled} toggleable={toggleable} closeOnPress={closeOnPress} delay={delay} closeDelay={closeDelay} type={type === "auto" ? undefined : type} shortcut="r">
          <TooltipTrigger
            aria-label="Repeat"
            aria-pressed={repeat}
            className={iconKey}
            onClick={() => setRepeat((r) => !r)}
          >
            <Icon d={icons.repeat} />
          </TooltipTrigger>
          <TooltipContent style={theme} side={side} align={align} sideOffset={sideOffset}>
            {repeat ? "Repeat is on" : "Repeat"}
            {showShortcuts && <TooltipShortcut />}
          </TooltipContent>
        </Tooltip>}
      </div>
    </div>
  )
}
