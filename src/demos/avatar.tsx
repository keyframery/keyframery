import * as React from "react"

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar"

export const controls = {
  size: { type: "select", label: "Size", default: "lg", options: ["sm", "md", "lg"], group: "Layout" },
  groupSize: { type: "select", label: "Group size", default: "md", options: ["sm", "md", "lg"], group: "Layout" },
  showPhotos: { type: "switch", label: "Show photos", default: true, group: "Behaviour" },
  peopleCount: { type: "slider", label: "People count", default: 3, min: 1, max: 3, step: 1 },
  goingCount: { type: "slider", label: "Going count", default: 5, min: 1, max: 5, step: 1 },
  more: { type: "slider", label: "More", default: 3, min: 0, max: 20, step: 1 },
  delay: { type: "slider", label: "Delay", default: 0, min: 0, max: 1000, step: 1, unit: "ms" },
  title: { type: "text", label: "Title", default: "Book club" },
  subtitle: { type: "text", label: "Subtitle", default: "Thursday at Ruth's, 7pm" },
  goingLabel: { type: "text", label: "Going label", default: "Going" },
  replied: { type: "text", label: "Replied", default: "8 of 11 replied" },
  name: { type: "text", label: "Name", default: "Megan Holt" },
  role: { type: "text", label: "Role", default: "Chooses the book" },
  initials: { type: "text", label: "Initials", default: "MH" },
  width: { type: "slider", label: "Width", default: 400, min: 280, max: 480, step: 1, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Radius", default: 9999, min: 0, max: 9999, step: 1, unit: "px", group: "Layout" },
  overlap: { type: "slider", label: "Overlap", default: 4, min: 0, max: 12, step: 1, unit: "px", group: "Layout" },
  face: { type: "color", label: "Face", default: "", group: "Colours" },
  ink: { type: "color", label: "Ink", default: "", group: "Colours" },
  ring: { type: "color", label: "Ring", default: "", group: "Colours" },
} as const

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
  "inline-flex h-7 cursor-pointer items-center rounded-[8px] bg-background px-2.5 text-[12px] leading-none font-medium text-foreground outline-none select-none shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)] transition-[translate,scale,box-shadow] duration-[calc(100ms*var(--kf-speed,1))] active:translate-y-px active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)] motion-reduce:transition-none"

export default function AvatarDemo({
  size = "lg",
  groupSize = "md",
  showPhotos = true,
  peopleCount = 3,
  goingCount = 5,
  more = 3,
  delay = 0,
  title = "Book club",
  subtitle = "Thursday at Ruth's, 7pm",
  goingLabel = "Going",
  replied = "8 of 11 replied",
  name = "Megan Holt",
  role = "Chooses the book",
  initials = "MH",
  width = 400,
  radius = 9999,
  overlap = 4,
  face = "",
  ink = "",
  ring = "",
}: {
  size?: "sm" | "md" | "lg"
  groupSize?: "sm" | "md" | "lg"
  showPhotos?: boolean
  peopleCount?: number
  goingCount?: number
  more?: number
  delay?: number
  title?: string
  subtitle?: string
  goingLabel?: string
  replied?: string
  name?: string
  role?: string
  initials?: string
  width?: number
  radius?: number
  overlap?: number
  face?: string
  ink?: string
  ring?: string
}) {
  const theme = {
    "--avatar-radius": `${radius}px`,
    "--avatar-overlap": `-${overlap}px`,
    ...(face ? { "--avatar-face": face } : null),
    ...(ink ? { "--avatar-ink": ink } : null),
    ...(ring ? { "--avatar-ring": ring } : null),
  } as React.CSSProperties
  const [photos, setPhotos] = React.useState(showPhotos)
  React.useEffect(() => setPhotos(showPhotos), [showPhotos])
  const [hovered, setHovered] = React.useState<number | null>(null)

  return (
    <div style={{ ...theme, maxWidth: width }} className="w-full">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
          <p className="mt-1 text-[13px] text-muted-foreground">{subtitle}</p>
        </div>
        <button type="button" data-play="photos" className={key} onClick={() => setPhotos((p) => !p)}>
          {photos ? "Hide photos" : "Show photos"}
        </button>
      </div>

      <div className="mt-4 rounded-[14px] bg-card p-4 shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_1px_2px_rgb(0_0_0/0.04)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]">
        <ul className="space-y-3">
          {people.slice(0, peopleCount).map((person, index) => (
            <li key={person.name} className="flex items-center gap-3">
              <Avatar size={size}>
                {photos && person.photo && <AvatarImage src={person.photo} alt={person.name} />}
                <AvatarFallback delay={delay}>{index === 0 ? initials : person.initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] leading-5 font-medium">{index === 0 ? name : person.name}</div>
                <div className="text-[12px] leading-4 text-muted-foreground">{index === 0 ? role : person.role}</div>
              </div>
            </li>
          ))}
        </ul>

        <div className="my-4 h-px bg-border" />

        <div className="flex items-center justify-between gap-4">
          <div>
            <div data-play="going" className="text-[13px] leading-5 font-medium">{goingLabel}</div>
            <div className="text-[12px] leading-4 text-muted-foreground tabular-nums">{replied}</div>
          </div>
          <AvatarGroup style={{ ...theme, "--avatar-ring": ring || "var(--card)" } as React.CSSProperties} className="[--avatar-ring:var(--card)]">
            {going.slice(0, goingCount).map((person, i) => (
              <Avatar
                size={groupSize}
                key={person.initials}
                data-hovered={hovered === i || undefined}
                onPointerEnter={() => setHovered(i)}
                onPointerLeave={() => setHovered(null)}
              >
                {photos && person.photo && <AvatarImage src={person.photo} alt="" />}
                <AvatarFallback delay={delay}>{person.initials}</AvatarFallback>
              </Avatar>
            ))}
            <AvatarGroupCount size={groupSize} aria-label={`${more} more people`}>+{more}</AvatarGroupCount>
          </AvatarGroup>
        </div>
      </div>
    </div>
  )
}
