import * as React from "react"

import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"

export const meta = { name: "Popover", group: "Overlays" }

/* The demo plays itself: the counter unfolds out of its trigger with its rows cascading in,
   one more child is added, and Done closes it. */
export const play = [
  { click: "[data-slot=popover-trigger]", wait: 1800 },
  { click: '[aria-label="More children"]', wait: 1000 },
  { click: "[data-slot=popover-close]", wait: 1400 },
  { click: "[data-slot=popover-trigger]", wait: 1800 },
  { click: '[aria-label="Fewer children"]', wait: 1000 },
  { click: "[data-slot=popover-close]", wait: 1400 },
]

type Kind = "adults" | "children" | "infants"

const rows: { kind: Kind; label: string; hint: string; min: number; max: number }[] = [
  { kind: "adults", label: "Adults", hint: "13 and over", min: 1, max: 8 },
  { kind: "children", label: "Children", hint: "Ages 2 to 12", min: 0, max: 6 },
  { kind: "infants", label: "Infants", hint: "Under 2", min: 0, max: 3 },
]

const stepKey = [
  "grid size-7 cursor-pointer place-items-center rounded-full bg-background text-foreground outline-none dark:bg-accent",
  "shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_1px_2px_rgb(0_0_0/0.06)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),inset_0_1px_0_rgb(255_255_255/0.08)]",
  "transition-[background-color,translate,scale,opacity] duration-100 ease-[cubic-bezier(0.22,1,0.36,1)]",
  "hover:bg-[color-mix(in_oklab,var(--background),var(--foreground)_4%)] dark:hover:bg-[color-mix(in_oklab,var(--accent),var(--foreground)_8%)]",
  "active:translate-y-px active:scale-[0.96]",
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover",
  "aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground aria-disabled:[&_svg]:opacity-40 aria-disabled:shadow-[0_0_0_1px_rgb(0_0_0/0.05)] dark:aria-disabled:shadow-[0_0_0_1px_rgb(255_255_255/0.05)] aria-disabled:active:translate-y-0 aria-disabled:active:scale-100 aria-disabled:hover:bg-background dark:aria-disabled:hover:bg-accent",
  "motion-reduce:transition-none [&_svg]:size-3.5",
].join(" ")

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

function summary(count: Record<Kind, number>) {
  const guests = count.adults + count.children
  const parts = [`${guests} ${guests === 1 ? "guest" : "guests"}`]
  if (count.infants) parts.push(`${count.infants} ${count.infants === 1 ? "infant" : "infants"}`)
  return parts.join(", ")
}

export default function PopoverDemo() {
  const [count, setCount] = React.useState<Record<Kind, number>>({ adults: 2, children: 1, infants: 0 })
  const change = (kind: Kind, by: number) => setCount((c) => ({ ...c, [kind]: c[kind] + by }))
  const canAdd = (kind: Kind) => {
    const row = rows.find((r) => r.kind === kind)!
    if (count[kind] >= row.max) return false
    return kind === "infants" || count.adults + count.children < 8
  }

  return (
    <div className="flex w-[340px] items-center gap-3 rounded-[14px] bg-muted/60 p-3 pl-4">
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-semibold tracking-tight">Cabin by the lake</div>
        <div className="mt-0.5 text-[12px] text-muted-foreground tabular-nums">Fri 6 to Sun 8 June</div>
      </div>
      <Popover>
        <PopoverTrigger className="tabular-nums">
          {summary(count)}
          <svg
            data-slot="popover-chevron"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="-mr-1"
          >
            <path d="m4.5 6.5 3.5 3.5 3.5-3.5" />
          </svg>
        </PopoverTrigger>
        <PopoverContent align="end">
          <PopoverTitle>Who's coming?</PopoverTitle>
          <PopoverDescription className="mt-0.5">The cabin sleeps up to 8.</PopoverDescription>
          <ul className="mt-3 divide-y divide-border">
            {rows.map((row) => (
              <li key={row.kind} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium">{row.label}</div>
                  <div className="text-[12px] text-muted-foreground">{row.hint}</div>
                </div>
                <button
                  type="button"
                  className={stepKey}
                  aria-label={`Fewer ${row.label.toLowerCase()}`}
                  aria-disabled={count[row.kind] <= row.min}
                  onClick={() => count[row.kind] > row.min && change(row.kind, -1)}
                >
                  <Icon d="M4 8h8" />
                </button>
                <span aria-live="polite" className="w-5 text-center text-[14px] font-semibold tabular-nums">
                  {count[row.kind]}
                </span>
                <button
                  type="button"
                  className={stepKey}
                  aria-label={`More ${row.label.toLowerCase()}`}
                  aria-disabled={!canAdd(row.kind)}
                  onClick={() => canAdd(row.kind) && change(row.kind, 1)}
                >
                  <Icon d="M8 4v8M4 8h8" />
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex justify-end">
            <PopoverClose variant="primary">Done</PopoverClose>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
