import * as React from "react"

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar"

export const meta = { name: "Avatar", group: "Display" }

/* Hovers across the group, then reloads the photos so they blur in. Each hover step also sends a
   pointer-leave from the "Going" label: the gallery pauses while the pointer is over a demo, and
   that leave tells it the scripted pointer has gone, without unhovering the avatar. */
export const play = [
  { hover: '[data-slot="avatar-group"] > :nth-child(2)', unhover: "[data-play=going]", wait: 1000 },
  { hover: '[data-slot="avatar-group"] > :nth-child(5)', unhover: "[data-play=going]", wait: 1000 },
  { unhover: '[data-slot="avatar-group"] > :nth-child(5)', wait: 700 },
  { click: "[data-play=photos]", wait: 700 },
  { click: "[data-play=photos]", wait: 1600 },
]

/* Simple drawn portraits as data URIs, so the demo needs no network. */
function portrait(sky: string, ground: string, skin: string, hair: string, shirt: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky}"/><stop offset="1" stop-color="${ground}"/></linearGradient></defs><rect width="64" height="64" fill="url(#b)"/><path d="M10 64c2-13 11-19 22-19s20 6 22 19z" fill="${shirt}"/><rect x="27" y="36" width="10" height="11" rx="4" fill="${skin}"/><ellipse cx="32" cy="29" rx="11" ry="12.5" fill="${skin}"/><path d="M20.5 29c-1-10 5-16 11.5-16s13 5 11.5 16c-2-6-6-8.5-11.5-8.5S22.5 23 20.5 29z" fill="${hair}"/></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const people = [
  {
    name: "Inès Moreau",
    initials: "IM",
    role: "Organiser",
    photo: portrait("#e9d8c4", "#d6b796", "#c8946f", "#3a2a22", "#2f4a5a"),
  },
  {
    name: "Kofi Mensah",
    initials: "KM",
    role: "Flights and hotel",
    photo: portrait("#c9d6dc", "#9fb4be", "#7a5038", "#1f1a17", "#b5643f"),
  },
  { name: "Aiko Sato", initials: "AS", role: "Dinners" },
]

const going = ["LB", "TN", "RD", "MO", "PS"]

const key =
  "inline-flex h-7 cursor-pointer items-center rounded-[8px] bg-background px-2.5 text-[12px] leading-none font-medium text-foreground outline-none select-none shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)] transition-[translate,scale,box-shadow] duration-100 active:translate-y-px active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)] motion-reduce:transition-none"

export default function AvatarDemo() {
  const [photos, setPhotos] = React.useState(true)
  const [hovered, setHovered] = React.useState<number | null>(null)

  return (
    <div className="w-[400px]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight">Lisbon offsite</h3>
          <p className="mt-1 text-[13px] text-muted-foreground">14 to 17 May · Alfama</p>
        </div>
        <button type="button" data-play="photos" className={key} onClick={() => setPhotos((p) => !p)}>
          {photos ? "Hide photos" : "Show photos"}
        </button>
      </div>

      <div className="mt-4 rounded-[14px] bg-card p-4 shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_1px_2px_rgb(0_0_0/0.04)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]">
        <ul className="space-y-3">
          {people.map((person) => (
            <li key={person.name} className="flex items-center gap-3">
              <Avatar size="lg">
                {photos && person.photo && <AvatarImage src={person.photo} alt={person.name} />}
                <AvatarFallback>{person.initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] leading-5 font-medium">{person.name}</div>
                <div className="text-[12px] leading-4 text-muted-foreground">{person.role}</div>
              </div>
            </li>
          ))}
        </ul>

        <div className="my-4 h-px bg-border" />

        <div className="flex items-center justify-between gap-4">
          <div>
            <div data-play="going" className="text-[13px] leading-5 font-medium">Going</div>
            <div className="text-[12px] leading-4 text-muted-foreground tabular-nums">8 of 12 replied</div>
          </div>
          <AvatarGroup className="[--avatar-ring:var(--card)]">
            {going.map((initials, i) => (
              <Avatar
                key={initials}
                data-hovered={hovered === i || undefined}
                onPointerEnter={() => setHovered(i)}
                onPointerLeave={() => setHovered(null)}
              >
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            ))}
            <AvatarGroupCount aria-label="3 more people">+3</AvatarGroupCount>
          </AvatarGroup>
        </div>
      </div>
    </div>
  )
}
