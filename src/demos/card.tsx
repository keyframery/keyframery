import * as React from "react"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const controls = {
  interactive: { type: "switch", label: "Interactive", default: true, group: "Behaviour" },
  spotlight: { type: "switch", label: "Spotlight", default: true, group: "Behaviour" },
  title: { type: "text", label: "Title", default: "Ski week" },
  description: { type: "text", label: "Description", default: "Les Arcs, 8 to 15 Feb" },
  badge: { type: "text", label: "Badge", default: "In 23 days" },
  footer: { type: "text", label: "Footer", default: "Jo paid the chalet" },
  action: { type: "text", label: "Action", default: "Itinerary" },
  solo: { type: "text", label: "Solo", default: "Solo" },
  team: { type: "text", label: "Team", default: "Team" },
  price: { type: "text", label: "Price", default: "€24" },
  plansCount: { type: "slider", label: "Plans count", default: 2, min: 1, max: 2, step: 1 },
  width: { type: "slider", label: "Width", default: 640, min: 320, max: 760, step: 1, unit: "px", group: "Layout" },
  cardWidth: { type: "slider", label: "Card width", default: 316, min: 240, max: 400, step: 1, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Gap", default: 16, min: 4, max: 28, step: 1, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Radius", default: 16, min: 0, max: 32, step: 1, unit: "px", group: "Layout" },
  padding: { type: "slider", label: "Padding", default: 20, min: 8, max: 28, step: 1, unit: "px", group: "Layout" },
  face: { type: "color", label: "Face", default: "", group: "Colours" },
  ink: { type: "color", label: "Ink", default: "", group: "Colours" },
  muted: { type: "color", label: "Muted", default: "", group: "Colours" },
  light: { type: "color", label: "Light", default: "", group: "Colours" },
} as const

export const meta = { name: "Card", group: "Layout" }

/* Hovers the trip card so it lifts under the light, then hovers and presses each plan.
   A scripted click cannot trigger :active, so the demo flashes `data-pressed` on clicks that
   did not come from a real pointer. */
export const play = [
  { hover: "[data-play=trip]", wait: 1400 },
  { unhover: "[data-play=trip]", hover: "[data-play=plan-team]", wait: 900 },
  { click: "[data-play=plan-team]", wait: 1300 },
  { unhover: "[data-play=plan-team]", hover: "[data-play=plan-solo]", wait: 900 },
  { click: "[data-play=plan-solo]", wait: 1300 },
  { unhover: "[data-play=plan-solo]", wait: 1200 },
]

/* What the Customize panel under the preview offers. The demo takes the same names as props. */

const key =
  "inline-flex h-8 cursor-pointer items-center justify-center rounded-[9px] bg-background px-3 text-[13px] leading-none font-medium text-foreground outline-none select-none shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)] transition-[scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)] motion-reduce:transition-none"

const plans = [
  { id: "solo", name: "Solo", price: "€0", note: "One trip at a time", seats: "1 traveller" },
  { id: "team", name: "Team", price: "€24", note: "Shared trips and budgets", seats: "Up to 15 people" },
]

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] bg-muted/70 px-3 py-2.5">
      <div className="text-[11px] font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 text-[15px] font-semibold tracking-tight tabular-nums">{value}</div>
    </div>
  )
}

/* Flash the pressed look for a click that no pointer pressed (the demo's own script). */
function usePressFlash() {
  const [pressed, setPressed] = React.useState<string | null>(null)
  const flash = (id: string, e: React.MouseEvent<HTMLElement>) => {
    if (e.nativeEvent.isTrusted) return
    const speed = parseFloat(getComputedStyle(e.currentTarget).getPropertyValue("--kf-speed")) || 1
    setPressed(id)
    setTimeout(() => setPressed((p) => (p === id ? null : p)), 160 * speed)
  }
  return [pressed, flash] as const
}

export default function CardDemo({
  interactive = true,
  spotlight = true,
  title = "Ski week",
  description = "Les Arcs, 8 to 15 Feb",
  badge = "In 23 days",
  footer = "Jo paid the chalet",
  action = "Itinerary",
  solo = "Solo",
  team = "Team",
  price = "€24",
  plansCount = 2,
  width = 640,
  cardWidth = 316,
  gap = 16,
  radius = 16,
  padding = 20,
  face = "",
  ink = "",
  muted = "",
  light = "",
}: {
  interactive?: boolean
  spotlight?: boolean
  title?: string
  description?: string
  badge?: string
  footer?: string
  action?: string
  solo?: string
  team?: string
  price?: string
  plansCount?: number
  width?: number
  cardWidth?: number
  gap?: number
  radius?: number
  padding?: number
  face?: string
  ink?: string
  muted?: string
  light?: string
}) {
  const theme = {
    "--card-radius": `${radius}px`,
    "--card-padding": `${padding}px`,
    ...(face ? { "--card-face": face } : null),
    ...(ink ? { "--card-ink": ink } : null),
    ...(muted ? { "--card-muted": muted } : null),
    ...(light ? { "--card-light": light } : null),
  } as React.CSSProperties
  const [plan, setPlan] = React.useState("solo")
  React.useEffect(() => {
    if (!plans.slice(0, plansCount).some((visible) => visible.id === plan)) setPlan("solo")
  }, [plansCount, plan])
  const [pressed, flash] = usePressFlash()

  return (
    <div style={{ ...theme, maxWidth: width }} className="@container w-full">
      <div style={gap === 16 ? undefined : { gap }} className="flex items-start gap-4 @max-[36rem]:flex-col @max-[36rem]:gap-3">
      <Card interactive={interactive} spotlight={spotlight} data-play="trip" style={cardWidth === 316 ? undefined : { width: cardWidth }} className="w-[316px] shrink-0 @max-[36rem]:w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
          <CardAction>
            <span className="inline-flex h-5 items-center rounded-full bg-muted px-2 text-[11px] font-medium text-muted-foreground">
              {badge}
            </span>
          </CardAction>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          <Stat label="Booked" value="5 of 6" />
          <Stat label="Budget" value="€4,150" />
          <Stat label="Lift passes" value="6" />
          <Stat label="Lessons" value="3" />
        </CardContent>
        <CardFooter className="justify-between">
          <span className="text-[12px] text-muted-foreground">{footer}</span>
          <button type="button" className={key}>
            {action}
          </button>
        </CardFooter>
      </Card>

      <div role="radiogroup" aria-label="Plan" className="flex flex-1 flex-col gap-3 @max-[36rem]:w-full">
        {plans.slice(0, plansCount).map((p) => {
          const checked = plan === p.id
          return (
            <Card
              key={p.id}
              interactive={interactive}
              role="radio"
              aria-checked={checked}
              tabIndex={checked ? 0 : -1}
              data-play={`plan-${p.id}`}
              data-pressed={pressed === p.id || undefined}
              onClick={(e) => {
                flash(p.id, e)
                setPlan(p.id)
              }}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault()
                  setPlan(p.id)
                }
              }}
              className={
                checked
                  ? "gap-3 py-4 shadow-[0_0_0_1.5px_color-mix(in_oklch,var(--foreground)_78%,transparent),0_4px_12px_-6px_rgb(0_0_0/0.12)] [&[data-interactive]:is(:hover,[data-hovered])]:shadow-[0_0_0_1.5px_color-mix(in_oklch,var(--foreground)_78%,transparent),0_16px_32px_-12px_rgb(0_0_0/0.24)] dark:shadow-[0_0_0_1.5px_color-mix(in_oklch,var(--foreground)_78%,transparent),0_6px_16px_-6px_rgb(0_0_0/0.6)] dark:[&[data-interactive]:is(:hover,[data-hovered])]:shadow-[0_0_0_1.5px_color-mix(in_oklch,var(--foreground)_78%,transparent),0_18px_36px_-12px_rgb(0_0_0/0.8)]"
                  : "gap-3 py-4"
              }
            >
              <CardHeader className="px-4">
                <CardTitle>{p.id === "solo" ? solo : team}</CardTitle>
                <CardDescription>{p.note}</CardDescription>
                <CardAction>
                  <span
                    aria-hidden
                    className={
                      "grid size-[18px] place-items-center rounded-full transition-[background-color,box-shadow] duration-[calc(150ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none " +
                      (checked
                        ? "bg-primary text-primary-foreground"
                        : "shadow-[inset_0_0_0_1.5px_var(--input)]")
                    }
                  >
                    <svg
                      viewBox="0 0 16 16"
                      className={
                        "size-3 transition-[scale,opacity] duration-[calc(300ms*var(--kf-speed,1))] ease-pop motion-reduce:transition-none " +
                        (checked ? "scale-100 opacity-100" : "scale-[0.6] opacity-0")
                      }
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3.5 8.5l3 3 6-7" />
                    </svg>
                  </span>
                </CardAction>
              </CardHeader>
              <CardContent className="flex items-baseline justify-between px-4">
                <span>
                  <span className="text-[22px] font-semibold tracking-tight tabular-nums">{p.id === "team" ? price : p.price}</span>
                  <span className="ml-1 text-muted-foreground">a month</span>
                </span>
                <span className="text-[12px] text-muted-foreground">{p.seats}</span>
              </CardContent>
            </Card>
          )
        })}
      </div>
      </div>
    </div>
  )
}
