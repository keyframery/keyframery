import * as React from "react"

import { DateInput } from "@/components/ui/date-input"

export const controls = {
  granularity: { type: "select", label: "Granularity", default: "day", options: ["day", "hour", "minute", "second"], group: "Behaviour" },
  hourCycle: { type: "select", label: "Hour cycle", default: "locale", options: ["locale", "12", "24"], group: "Behaviour" },
  locale: { type: "text", label: "Locale", default: "" },
  disabled: { type: "switch", label: "Disabled", default: false, group: "Behaviour" },
  readOnly: { type: "switch", label: "Read only", default: false, group: "Behaviour" },
  required: { type: "switch", label: "Required", default: false, group: "Behaviour" },
  title: { type: "text", label: "Title", default: "Passenger 1" },
  subtitle: { type: "text", label: "Subtitle", default: "As shown on the passport" },
  birthLabel: { type: "text", label: "Birth label", default: "Date of birth" },
  expiryLabel: { type: "text", label: "Expiry label", default: "Passport expires" },
  validLabel: { type: "text", label: "Valid label", default: "Valid for this trip" },
  invalidLabel: { type: "text", label: "Invalid label", default: "Must last 6 more months" },
  width: { type: "slider", label: "Width", default: 340, min: 300, max: 720, step: 1, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Gap", default: 12, min: 4, max: 24, step: 1, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Radius", default: 10, min: 0, max: 24, step: 1, unit: "px", group: "Layout" },
  height: { type: "slider", label: "Height", default: 36, min: 28, max: 48, step: 1, unit: "px", group: "Layout" },
  font: { type: "slider", label: "Font", default: 13, min: 10, max: 18, step: 1, unit: "px", group: "Layout" },
  face: { type: "color", label: "Face", default: "", group: "Colours" },
  ink: { type: "color", label: "Ink", default: "", group: "Colours" },
  accent: { type: "color", label: "Accent", default: "", group: "Colours" },
} as const

export const meta = { name: "Date Input", group: "Dates" }

const today = new Date()
const iso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

/* A passport has to stay valid for six months after the trip. */
const sixMonthsOut = iso(new Date(today.getFullYear(), today.getMonth() + 6, today.getDate()))

/* The demo plays itself: the highlight glides along the segments and steps a value on the way. */
export const play = [
  { click: '[aria-labelledby="dob"] [data-type="month"]', wait: 900 },
  { key: "ArrowRight", wait: 800 },
  { key: "ArrowRight", wait: 800 },
  { key: "ArrowUp", wait: 700 },
  { key: "ArrowDown", wait: 700 },
  { key: "ArrowLeft", wait: 800 },
  { key: "ArrowLeft", wait: 1200 },
]

export default function DateInputDemo({
  granularity = "day",
  hourCycle = "locale",
  locale = "",
  disabled = false,
  readOnly = false,
  required = false,
  title = "Passenger 1",
  subtitle = "As shown on the passport",
  birthLabel = "Date of birth",
  expiryLabel = "Passport expires",
  validLabel = "Valid for this trip",
  invalidLabel = "Must last 6 more months",
  width = 340,
  gap = 12,
  radius = 10,
  height = 36,
  font = 13,
  face = "",
  ink = "",
  accent = "",
}: {
  granularity?: "day" | "hour" | "minute" | "second"
  hourCycle?: "locale" | "12" | "24"
  locale?: string
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  title?: string
  subtitle?: string
  birthLabel?: string
  expiryLabel?: string
  validLabel?: string
  invalidLabel?: string
  width?: number
  gap?: number
  radius?: number
  height?: number
  font?: number
  face?: string
  ink?: string
  accent?: string
}) {
  const theme = {
    "--date-input-radius": `${radius}px`,
    "--date-input-height": `${height}px`,
    "--date-input-font": `${font}px`,
    ...(face ? { "--date-input-face": face } : null),
    ...(ink ? { "--date-input-ink": ink } : null),
    ...(accent ? { "--date-input-accent": accent } : null),
  } as React.CSSProperties
  const [expiry, setExpiry] = React.useState<string | null>("2031-08-09")
  const expiresTooSoon = expiry !== null && expiry < sixMonthsOut

  return (
    <div style={{ ...theme, maxWidth: granularity === "day" ? width : Math.max(width, 640) }} className="w-full">
      <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
      <p className="mt-1 text-[13px] text-muted-foreground">{subtitle}</p>

      <div
        style={{ columnGap: gap }} className="mt-5 grid grid-cols-2 gap-x-3 gap-y-1.5"
        /* A scripted click does not focus an input by itself; this lets the self-playing loop in. */
        onClick={(event) => event.target instanceof HTMLInputElement && event.target.focus()}
      >
        <span id="dob" className="text-[13px] font-medium">
          {birthLabel}
        </span>
        <span id="expiry" className="text-[13px] font-medium">
          {expiryLabel}
        </span>
        <DateInput granularity={granularity} hourCycle={hourCycle === "locale" ? undefined : hourCycle === "12" ? 12 : 24} locale={validLocale(locale)} disabled={disabled} readOnly={readOnly} required={required} aria-labelledby="dob" defaultValue="1991-04-23" max={iso(today)} className="w-full" />
        <DateInput
          granularity={granularity} hourCycle={hourCycle === "locale" ? undefined : hourCycle === "12" ? 12 : 24} locale={validLocale(locale)} disabled={disabled} readOnly={readOnly} required={required}
          aria-labelledby="expiry"
          value={expiry}
          onValueChange={setExpiry}
          min={sixMonthsOut}
          className="w-full"
        />
        <span />
        <span
          className={
            "text-[12px] " + (expiresTooSoon ? "text-destructive" : "text-muted-foreground")
          }
        >
          {expiresTooSoon ? invalidLabel : validLabel}
        </span>
      </div>
    </div>
  )
}

/* A locale typed into Customize is only used once it is a real language tag, so "de-" on the way to
   "de-DE" doesn't throw. */
function validLocale(locale: string) {
  if (!locale) return undefined
  try { return Intl.getCanonicalLocales(locale)[0] } catch { return undefined }
}
