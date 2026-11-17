import * as React from "react"

import { Separator, SeparatorLabel } from "@/components/ui/separator"

export const meta = { name: "Separator", group: "Layout" }

/* The demo plays itself: switching cards mounts fresh separators, so every line draws again. */
export const play = [
  { click: '[data-view="signin"]', wait: 2000 },
  { click: '[data-view="profile"]', wait: 2200 },
]

const views = [
  { id: "profile", label: "Profile" },
  { id: "signin", label: "Sign in" },
] as const

const key =
  "inline-flex h-9 w-full items-center justify-center rounded-[10px] text-[13px] leading-none font-medium outline-none transition-[scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"

const keySurface =
  "bg-background shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)] dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]"

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1.5 py-1">
      <span className="text-[15px] leading-none font-semibold tracking-tight tabular-nums">{value}</span>
      <span className="text-[11px] leading-none text-muted-foreground">{label}</span>
    </div>
  )
}

function Profile({ orientation, decorative, name, occupation, items, gap }: { orientation: "horizontal" | "vertical"; decorative: boolean; name: string; occupation: string; items: number; gap: number }) {
  return (
    <div style={{ gap }} className="flex flex-col">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-full bg-muted text-[12px] font-semibold text-muted-foreground">NB</span>
        <div className="flex flex-col gap-1.5">
          <span className="text-[15px] leading-none font-semibold tracking-tight">{name}</span>
          <span className="text-[12px] leading-none text-muted-foreground">{occupation}</span>
        </div>
      </div>
      <Separator decorative={decorative} />
      <p className="text-[13px] leading-relaxed text-muted-foreground">
        Throws stoneware by hand in a small riverside studio, and teaches a Saturday wheel class for beginners.
      </p>
      <div style={{ flexDirection: orientation === "vertical" ? "row" : "column" }} className="flex items-stretch rounded-[12px] bg-muted/60 py-2">
        {[["48", "Pieces"], ["1,280", "Followers"], ["312", "Following"]].slice(0, items).map(([value, label], i) => <React.Fragment key={label}>{i > 0 && <Separator orientation={orientation} decorative={decorative} className="my-1" />}<Stat value={value} label={label} /></React.Fragment>)}
      </div>
    </div>
  )
}

function SignIn({ heading, label, gap }: { heading: string; label: string; gap: number }) {
  return (
    <div style={{ gap }} className="flex flex-col">
      <div className="flex flex-col gap-1.5">
        <span className="text-[15px] leading-none font-semibold tracking-tight">{heading}</span>
        <span className="text-[12px] leading-none text-muted-foreground">Sign in to see your orders and saved pieces.</span>
      </div>
      <button
        type="button"
        className={`${key} bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.25)]`}
      >
        Sign in with passkey
      </button>
      <div className="flex items-center">
        <Separator decorative />
        <SeparatorLabel>{label}</SeparatorLabel>
        <Separator decorative />
      </div>
      <input
        type="email"
        placeholder="you@example.com"
        aria-label="Email"
        className="h-9 rounded-[10px] bg-background px-3 text-[13px] outline-none shadow-[0_0_0_1px_rgb(0_0_0/0.09),0_1px_2px_rgb(0_0_0/0.05)] placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/25 dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1)]"
      />
      <button type="button" className={`${key} ${keySurface}`}>
        Email me a link
      </button>
    </div>
  )
}

export const controls = {
  orientation: { type: "select", label: "Stats dividers", options: ["horizontal", "vertical"], default: "vertical" },
  decorative: { type: "switch", label: "Decorative", default: false, group: "Behaviour" },
  name: { type: "text", label: "Name", default: "Nell Barrow" },
  occupation: { type: "text", label: "Occupation", default: "Ceramicist, Stroud" },
  heading: { type: "text", label: "Heading", default: "Welcome back" },
  label: { type: "text", label: "Label", default: "or" },
  items: { type: "slider", label: "Stats", min: 1, max: 3, step: 1, default: 3, unit: "", group: "Layout" },
  width: { type: "slider", label: "Width", min: 280, max: 480, step: 1, default: 340, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Gap", min: 8, max: 32, step: 1, default: 16, unit: "px", group: "Layout" },
  corners: { type: "slider", label: "Corners", min: 0, max: 32, step: 1, default: 18, unit: "px", group: "Layout" },
  thickness: { type: "slider", label: "Thickness", min: 1, max: 6, step: 1, default: 1, unit: "px", group: "Layout" },
  labelGap: { type: "slider", label: "Label gap", min: 0, max: 24, step: 1, default: 12, unit: "px", group: "Layout" },
  font: { type: "slider", label: "Font", min: 10, max: 18, step: 1, default: 12, unit: "px", group: "Layout" },
  line: { type: "color", label: "Line", default: "", group: "Colours" },
  ink: { type: "color", label: "Ink", default: "", group: "Colours" },
} as const

export default function SeparatorDemo({
  orientation = "vertical",
  decorative = false,
  name = "Nell Barrow",
  occupation = "Ceramicist, Stroud",
  heading = "Welcome back",
  label = "or",
  items = 3,
  width = 340,
  gap = 16,
  corners = 18,
  thickness = 1,
  labelGap = 12,
  font = 12,
  line = "",
  ink = "",
}: {
  orientation?: "horizontal" | "vertical"
  decorative?: boolean
  name?: string
  occupation?: string
  heading?: string
  label?: string
  items?: number
  width?: number
  gap?: number
  corners?: number
  thickness?: number
  labelGap?: number
  font?: number
  line?: string
  ink?: string
} = {}) {
  const theme = {
    "--separator-thickness": `${thickness}px`,
    "--separator-label-gap": `${labelGap}px`,
    "--separator-font": `${font}px`,
    ...(line ? { "--separator-line": line } : {}),
    ...(ink ? { "--separator-ink": ink } : {}),
  } as React.CSSProperties
  const [view, setView] = React.useState<(typeof views)[number]["id"]>("profile")
  return (
    <div style={{ ...theme, maxWidth: width }} className="flex w-full flex-col items-center gap-4">
      <div className="flex gap-1 rounded-full bg-muted p-1 shadow-[inset_0_1px_2px_rgb(0_0_0/0.07),inset_0_0_0_1px_rgb(0_0_0/0.035)] dark:shadow-[inset_0_1px_2px_rgb(0_0_0/0.5),inset_0_0_0_1px_rgb(255_255_255/0.04)]">
        {views.map((v) => (
          <button
            key={v.id}
            type="button"
            data-view={v.id}
            aria-pressed={view === v.id}
            onClick={() => setView(v.id)}
            className={[
              "h-7 rounded-full px-3 text-[12px] leading-none font-medium outline-none transition-[color,scale] duration-[calc(150ms*var(--kf-speed,1))] ease-house active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
              view === v.id ? `${keySurface} text-foreground` : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {v.label}
          </button>
        ))}
      </div>
      <div
        key={view}
        style={{ borderRadius: corners }}
        className="w-full rounded-[18px] bg-card p-5 text-card-foreground shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_6px_-2px_rgb(0_0_0/0.08),0_12px_32px_-8px_rgb(0_0_0/0.12)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_12px_32px_-8px_rgb(0_0_0/0.7)]"
      >
        {view === "profile" ? <Profile {...{ orientation, decorative, name, occupation, items, gap }} /> : <SignIn {...{ heading, label, gap }} />}
      </div>
    </div>
  )
}
