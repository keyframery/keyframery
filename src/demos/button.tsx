import * as React from "react"

import { Button, ButtonArrow, ButtonIcon } from "@/components/ui/button"

export const controls = {
  variant: { type: "select", label: "Variant", default: "primary", options: ["default", "primary", "ghost", "destructive"] },
  size: { type: "select", label: "Size", default: "md", options: ["sm", "md", "lg", "icon-sm", "icon", "icon-lg"], group: "Layout" },
  disabled: { type: "switch", label: "Disabled", default: false, group: "Behaviour" },
  focusableWhenDisabled: { type: "switch", label: "Focusable when disabled", default: false, group: "Behaviour" },
  leadingIcon: { type: "switch", label: "Leading icon", default: true, group: "Behaviour" },
  trailingArrow: { type: "switch", label: "Trailing arrow", default: true, group: "Behaviour" },
  book: { type: "text", label: "Book", default: "Book trip" },
  seats: { type: "text", label: "Seats", default: "Choose seats" },
  share: { type: "text", label: "Share", default: "Share" },
  cancel: { type: "text", label: "Cancel", default: "Cancel trip" },
  guest: { type: "text", label: "Guest", default: "Add guest" },
  soldOut: { type: "text", label: "Sold out", default: "Sold out" },
  pay: { type: "text", label: "Pay", default: "Pay now" },
  rows: { type: "slider", label: "Rows", default: 3, min: 1, max: 3, step: 1 },
  width: { type: "slider", label: "Minimum row width", default: 0, min: 0, max: 480, step: 1, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Gap", default: 8, min: 0, max: 20, step: 1, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Radius", default: 9, min: 0, max: 24, step: 1, unit: "px", group: "Layout" },
  font: { type: "slider", label: "Font", default: 13, min: 10, max: 18, step: 1, unit: "px", group: "Layout" },
  face: { type: "color", label: "Face", default: "", group: "Colours" },
  ink: { type: "color", label: "Ink", default: "", group: "Colours" },
} as const

export const meta = { name: "Button", group: "Actions" }

/* The demo plays itself: book the trip, watch the label rise out for the spinner, and back. */
export const play = [
  { click: '[data-play="book"]', wait: 3400 },
  { hover: '[data-play="continue"]', wait: 1100 },
  { click: '[data-play="continue"]', wait: 2600 },
  { unhover: '[data-play="continue"]', wait: 900 },
]

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const icon = {
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const

function CalendarIcon() {
  return (
    <svg {...icon}>
      <rect x="2.5" y="3.5" width="11" height="10" rx="2.25" />
      <path d="M2.5 6.75h11M5.5 2v2.5M10.5 2v2.5" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg {...icon}>
      <path d="M8 3.25v9.5M3.25 8h9.5" />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg {...icon}>
      <path d="M8 10V2.75M5 5.5l3-3 3 3M3 10.5v1.25c0 .83.67 1.5 1.5 1.5h7c.83 0 1.5-.67 1.5-1.5V10.5" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg {...icon}>
      <circle cx="7.25" cy="7.25" r="4.25" />
      <path d="m10.5 10.5 3 3" />
    </svg>
  )
}

export default function ButtonDemo({
  variant = "primary",
  size = "md",
  disabled = false,
  focusableWhenDisabled = false,
  leadingIcon = true,
  trailingArrow = true,
  book = "Book trip",
  seats = "Choose seats",
  share = "Share",
  cancel = "Cancel trip",
  guest = "Add guest",
  soldOut = "Sold out",
  pay = "Pay now",
  rows = 3,
  width = 0,
  gap = 8,
  radius = 9,
  font = 13,
  face = "",
  ink = "",
}: {
  variant?: "default" | "primary" | "ghost" | "destructive"
  size?: "sm" | "md" | "lg" | "icon-sm" | "icon" | "icon-lg"
  disabled?: boolean
  focusableWhenDisabled?: boolean
  leadingIcon?: boolean
  trailingArrow?: boolean
  book?: string
  seats?: string
  share?: string
  cancel?: string
  guest?: string
  soldOut?: string
  pay?: string
  rows?: number
  width?: number
  gap?: number
  radius?: number
  font?: number
  face?: string
  ink?: string
}) {
  const theme = {
    ...(radius !== 9 ? { "--button-radius": `${radius}px` } : null),
    ...(font !== 13 ? { "--button-font": `${font}px` } : null),
    ...(face ? { "--button-face": face } : null),
    ...(ink ? { "--button-ink": ink } : null),
  } as React.CSSProperties
  /* Scripted pointer events cannot set :hover, so the demo mirrors hover as data-hovered. */
  const [hovered, setHovered] = React.useState(false)
  return (
    <div style={{ ...theme, minWidth: width || undefined }} className="flex flex-col gap-6">
      <div style={{ gap }} className="flex flex-wrap items-center gap-2">
        <Button variant={variant} size={size} disabled={disabled} focusableWhenDisabled={focusableWhenDisabled} aria-label={book} data-play="book" onClick={() => wait(2200)} pendingAnnouncement="Booking">
          {leadingIcon && <ButtonIcon>
            <CalendarIcon />
          </ButtonIcon>}
          <span className={size.startsWith("icon") ? "sr-only" : undefined}>{book}</span>
        </Button>
        <Button
          data-play="continue"
          data-hovered={hovered || undefined}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          onClick={() => wait(1800)}
          pendingAnnouncement="Loading seats"
        >
          {seats}
          {trailingArrow && <ButtonArrow />}
        </Button>
        <Button variant="ghost">
          <UploadIcon />
          {share}
        </Button>
        <Button variant="destructive">{cancel}</Button>
      </div>

      {rows >= 2 && <div style={{ gap }} className="flex flex-wrap items-center gap-2">
        <Button size="sm">
          <PlusIcon />
          {guest}
        </Button>
        <Button size="md">
          <PlusIcon />
          {guest}
        </Button>
        <Button size="lg">
          <PlusIcon />
          {guest}
        </Button>
      </div>}

      {rows >= 3 && <div style={{ gap }} className="flex flex-wrap items-center gap-2">
        <Button size="icon-sm" aria-label="Search trips">
          <SearchIcon />
        </Button>
        <Button size="icon" aria-label="Pick dates">
          <CalendarIcon />
        </Button>
        <Button size="icon-lg" variant="primary" aria-label="Add guest">
          <PlusIcon />
        </Button>
        <span className="mx-1 h-4 w-px bg-border" />
        <Button disabled>{soldOut}</Button>
        <Button variant="primary" disabled>
          {pay}
        </Button>
      </div>}
    </div>
  )
}
