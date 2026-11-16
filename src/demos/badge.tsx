import * as React from "react"

import { Badge } from "@/components/ui/badge"

export const meta = { name: "Badge", group: "Display" }

/* Mail arrives twice (counts roll up, the flight status flips and its dot pulses), then everything
   is marked read (counts roll down and the row badges leave). */
export const play = [
  { click: "[data-play=receive]", wait: 1700 },
  { click: "[data-play=receive]", wait: 1700 },
  { click: "[data-play=read]", wait: 2000 },
]

const key =
  "inline-flex h-7 cursor-pointer items-center rounded-[8px] bg-background px-2.5 text-[12px] leading-none font-medium text-foreground outline-none select-none shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)] transition-[scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)] motion-reduce:transition-none"

type Thread = { id: string; from: string; initials: string; subject: string; time: string; add: number }

const threads: Thread[] = [
  { id: "tap", from: "Priya Shah", initials: "PS", subject: "Train tickets attached", time: "09:41", add: 1 },
  { id: "ines", from: "Mum", initials: "M", subject: "Are you still coming Sunday?", time: "08:12", add: 3 },
  { id: "casa", from: "Gareth Price", initials: "GP", subject: "Re: boiler service", time: "Mon", add: 0 },
  { id: "bank", from: "Ellie Shaw", initials: "ES", subject: "Photos from the party", time: "Sun", add: 1 },
]

const start: Record<string, number> = { tap: 1, ines: 2, casa: 0, bank: 1 }

export default function BadgeDemo() {
  const [unread, setUnread] = React.useState(start)
  const [delayed, setDelayed] = React.useState(false)
  const total = Object.values(unread).reduce((a, b) => a + b, 0)

  const receive = () => {
    setUnread((u) => Object.fromEntries(threads.map((t) => [t.id, u[t.id] + t.add])))
    setDelayed((d) => !d)
  }
  const readAll = () => setUnread(Object.fromEntries(threads.map((t) => [t.id, 0])))

  return (
    <div className="w-full max-w-[420px] rounded-[16px] bg-card text-card-foreground shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_1px_2px_rgb(0_0_0/0.04),0_4px_12px_-6px_rgb(0_0_0/0.08)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_6px_16px_-6px_rgb(0_0_0/0.6)]">
      <div className="flex items-center gap-2 px-4 pt-4 pb-3">
        <h3 className="text-[15px] font-semibold tracking-tight">Inbox</h3>
        <Badge count={total} max={99} />
        <div className="ml-auto flex gap-1.5">
          <button type="button" data-play="receive" className={key} onClick={receive}>
            Get mail
          </button>
          <button type="button" data-play="read" className={key} onClick={readAll}>
            Mark all read
          </button>
        </div>
      </div>
      <ul className="border-t border-border">
        {threads.map((t) => {
          const n = unread[t.id]
          return (
            <li key={t.id} className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                {t.initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={"truncate text-[13px] " + (n ? "font-semibold" : "font-medium text-muted-foreground")}>
                    {t.from}
                  </span>
                  {t.id === "tap" && (
                    <Badge dot variant={delayed ? "destructive" : "success"}>
                      {delayed ? "Delayed 40 min" : "On time"}
                    </Badge>
                  )}
                  {t.id === "casa" && <Badge variant="outline">Booked</Badge>}
                </div>
                <div className="mt-0.5 truncate text-[12px] text-muted-foreground">{t.subject}</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[11px] text-muted-foreground tabular-nums">{t.time}</span>
                <span className="flex h-5 items-center">
                  {n > 0 && <Badge variant="secondary" count={n} />}
                </span>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
