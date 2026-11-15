import * as React from "react"

import { Button, ButtonArrow, ButtonIcon } from "@/components/ui/button"

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

export default function ButtonDemo() {
  /* Scripted pointer events cannot set :hover, so the demo mirrors hover as data-hovered. */
  const [hovered, setHovered] = React.useState(false)
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button variant="primary" data-play="book" onClick={() => wait(2200)} pendingAnnouncement="Booking">
          <ButtonIcon>
            <CalendarIcon />
          </ButtonIcon>
          Book trip
        </Button>
        <Button
          data-play="continue"
          data-hovered={hovered || undefined}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          onClick={() => wait(1800)}
          pendingAnnouncement="Loading seats"
        >
          Choose seats
          <ButtonArrow />
        </Button>
        <Button variant="ghost">
          <UploadIcon />
          Share
        </Button>
        <Button variant="destructive">Cancel trip</Button>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm">
          <PlusIcon />
          Add guest
        </Button>
        <Button size="md">
          <PlusIcon />
          Add guest
        </Button>
        <Button size="lg">
          <PlusIcon />
          Add guest
        </Button>
      </div>

      <div className="flex items-center gap-2">
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
        <Button disabled>Sold out</Button>
        <Button variant="primary" disabled>
          Pay now
        </Button>
      </div>
    </div>
  )
}
