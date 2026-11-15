import * as React from "react"

import { DateInput } from "@/components/ui/date-input"

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

export default function DateInputDemo() {
  const [expiry, setExpiry] = React.useState<string | null>("2031-08-09")
  const expiresTooSoon = expiry !== null && expiry < sixMonthsOut

  return (
    <div className="w-[340px]">
      <h3 className="text-[15px] font-semibold tracking-tight">Passenger 1</h3>
      <p className="mt-1 text-[13px] text-muted-foreground">As shown on the passport</p>

      <div
        className="mt-5 grid grid-cols-2 gap-x-3 gap-y-1.5"
        /* A scripted click does not focus an input by itself; this lets the self-playing loop in. */
        onClick={(event) => event.target instanceof HTMLInputElement && event.target.focus()}
      >
        <span id="dob" className="text-[13px] font-medium">
          Date of birth
        </span>
        <span id="expiry" className="text-[13px] font-medium">
          Passport expires
        </span>
        <DateInput aria-labelledby="dob" defaultValue="1991-04-23" max={iso(today)} className="w-full" />
        <DateInput
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
          {expiresTooSoon ? "Must last 6 more months" : "Valid for this trip"}
        </span>
      </div>
    </div>
  )
}
