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

export default function ToolbarDemo() {
  const [styles, setStyles] = React.useState(["bold"])
  const [align, setAlign] = React.useState("left")

  return (
    <div className="relative mb-5 w-[400px]">
      <article className="rounded-[14px] bg-card px-6 pt-5 pb-10 text-card-foreground shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
        <h3 className="text-[15px] font-semibold tracking-tight">Packing for Lisbon</h3>
        <p className="mt-1 text-[12px] text-muted-foreground">Edited just now</p>
        <p
          className={cn(
            "mt-4 text-[14px] leading-[1.7]",
            align === "center" && "text-center",
            align === "right" && "text-right",
          )}
        >
          A light jacket for evenings by the river.{" "}
          <span
            className={cn(
              "rounded-[3px] bg-ring/20 box-decoration-clone px-0.5 py-0.5",
              styles.includes("bold") && "font-semibold",
              styles.includes("italic") && "italic",
              styles.includes("underline") && "underline decoration-[1.5px] underline-offset-[3px]",
            )}
          >
            Good shoes for the hills in Alfama.
          </span>{" "}
          Leave room in the bag for ceramics.
        </p>
      </article>

      <Toolbar aria-label="Formatting" className="absolute -bottom-5 left-1/2 -translate-x-1/2">
        <ToolbarButton aria-label="Undo">
          <Icon d="M5.75 3.75l-3 3 3 3M3 6.75h6.5a3.25 3.25 0 010 6.5h-2" />
        </ToolbarButton>
        <ToolbarButton aria-label="Redo" disabled>
          <Icon d="M10.25 3.75l3 3-3 3M13 6.75H6.5a3.25 3.25 0 000 6.5h2" />
        </ToolbarButton>
        <ToolbarSeparator />
        <ToolbarToggleGroup multiple value={styles} onValueChange={setStyles} aria-label="Text style">
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
          value={[align]}
          onValueChange={([next]) => next && setAlign(next)}
          deselectable={false}
          aria-label="Alignment"
        >
          {alignments.map((a) => (
            <ToolbarToggle key={a.value} value={a.value} aria-label={a.label}>
              <Icon d={a.d} />
            </ToolbarToggle>
          ))}
        </ToolbarToggleGroup>
        <ToolbarSeparator />
        <ToolbarButton className="px-2" data-play="link">
          <Icon d="M6.9 9.1a2.6 2.6 0 003.7 0l1.9-1.9a2.6 2.6 0 00-3.7-3.7l-.7.7M9.1 6.9a2.6 2.6 0 00-3.7 0L3.5 8.8a2.6 2.6 0 003.7 3.7l.7-.7" />
          Link
        </ToolbarButton>
      </Toolbar>
    </div>
  )
}
