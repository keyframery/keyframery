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

const people = [
  { name: "Megan Holt", initials: "MH", role: "Chooses the book", photo: "/demo/face-2.jpg" },
  { name: "Ruth Okafor", initials: "RO", role: "Hosting this month", photo: "/demo/face-4.jpg" },
  { name: "Sam Lerner", initials: "SL", role: "Bringing wine" },
]

const going = [
  { initials: "CL", photo: "/demo/face-1.jpg" },
  { initials: "TB" },
  { initials: "JW", photo: "/demo/face-3.jpg" },
  { initials: "AK" },
  { initials: "PD" },
]

const key =
  "inline-flex h-7 cursor-pointer items-center rounded-[8px] bg-background px-2.5 text-[12px] leading-none font-medium text-foreground outline-none select-none shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)] transition-[translate,scale,box-shadow] duration-100 active:translate-y-px active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)] motion-reduce:transition-none"

export default function AvatarDemo() {
  const [photos, setPhotos] = React.useState(true)
  const [hovered, setHovered] = React.useState<number | null>(null)

  return (
    <div className="w-[400px]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight">Book club</h3>
          <p className="mt-1 text-[13px] text-muted-foreground">Thursday at Ruth's, 7pm</p>
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
            <div className="text-[12px] leading-4 text-muted-foreground tabular-nums">8 of 11 replied</div>
          </div>
          <AvatarGroup className="[--avatar-ring:var(--card)]">
            {going.map((person, i) => (
              <Avatar
                key={person.initials}
                data-hovered={hovered === i || undefined}
                onPointerEnter={() => setHovered(i)}
                onPointerLeave={() => setHovered(null)}
              >
                {photos && person.photo && <AvatarImage src={person.photo} alt="" />}
                <AvatarFallback>{person.initials}</AvatarFallback>
              </Avatar>
            ))}
            <AvatarGroupCount aria-label="3 more people">+3</AvatarGroupCount>
          </AvatarGroup>
        </div>
      </div>
    </div>
  )
}
