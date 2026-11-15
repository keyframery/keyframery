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
  "transition-[color,background-color,scale] duration-200 ease-pop",
  "hover:bg-foreground/[0.06] hover:text-foreground active:scale-[0.96]",
  "relative aria-pressed:text-foreground",
  "after:absolute after:bottom-0.5 after:left-1/2 after:size-[3px] after:-translate-x-1/2 after:rounded-full after:bg-current after:opacity-0 after:transition-opacity after:duration-150 aria-pressed:after:opacity-100",
  "motion-reduce:transition-none [&_svg]:size-4",
].join(" ")

const playKey = [
  "grid size-10 cursor-pointer place-items-center rounded-full bg-primary text-primary-foreground select-none",
  "shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.25)] dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.7),0_1px_2px_rgb(0_0_0/0.5)]",
  "transition-[background-color,scale] duration-200 ease-pop",
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

export default function TooltipDemo() {
  const [playing, setPlaying] = React.useState(false)
  const [shuffle, setShuffle] = React.useState(true)
  const [repeat, setRepeat] = React.useState(false)

  return (
    <div className="w-[340px] rounded-[16px] bg-muted/60 p-4">
      <div className="flex items-center gap-3">
        <img src="/demo/cup.jpg" alt="" className="size-11 shrink-0 rounded-[10px] bg-muted object-cover" />
        <div className="min-w-0 flex-1">
          <div data-play="away" className="truncate text-[14px] font-semibold tracking-tight">Sunday Morning Coffee</div>
          <div className="truncate text-[12px] text-muted-foreground">24 songs, about an hour and a half</div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between px-1">
        <Tooltip shortcut="s">
          <TooltipTrigger
            aria-label="Shuffle"
            aria-pressed={shuffle}
            className={iconKey}
            onClick={() => setShuffle((s) => !s)}
          >
            <Icon d={icons.shuffle} />
          </TooltipTrigger>
          <TooltipContent>
            {shuffle ? "Shuffle is on" : "Shuffle"}
            <TooltipShortcut />
          </TooltipContent>
        </Tooltip>
        <Tooltip shortcut="j">
          <TooltipTrigger aria-label="Previous song" className={iconKey}>
            <Icon d={icons.previous} />
          </TooltipTrigger>
          <TooltipContent>
            Previous
            <TooltipShortcut />
          </TooltipContent>
        </Tooltip>
        <Tooltip shortcut="k">
          <TooltipTrigger aria-label={playing ? "Pause" : "Play"} className={playKey} onClick={() => setPlaying((p) => !p)}>
            <Icon d={playing ? icons.pause : icons.play} fill={!playing} />
          </TooltipTrigger>
          <TooltipContent>
            {playing ? "Pause" : "Play"}
            <TooltipShortcut />
          </TooltipContent>
        </Tooltip>
        <Tooltip shortcut="l">
          <TooltipTrigger aria-label="Next song" className={iconKey}>
            <Icon d={icons.next} />
          </TooltipTrigger>
          <TooltipContent>
            Next
            <TooltipShortcut />
          </TooltipContent>
        </Tooltip>
        <Tooltip shortcut="r">
          <TooltipTrigger
            aria-label="Repeat"
            aria-pressed={repeat}
            className={iconKey}
            onClick={() => setRepeat((r) => !r)}
          >
            <Icon d={icons.repeat} />
          </TooltipTrigger>
          <TooltipContent>
            {repeat ? "Repeat is on" : "Repeat"}
            <TooltipShortcut />
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
