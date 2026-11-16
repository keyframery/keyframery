import { TimeInput } from "@/components/ui/time-input"

export const meta = { name: "Time Input", group: "Dates" }

const hours = [
  { day: "Mon – Fri", opens: "07:30", closes: "18:00" },
  { day: "Saturday", opens: "09:00", closes: "16:30" },
  { day: "Sunday", opens: "10:00", closes: "14:00" },
]

/* The demo plays itself: the highlight glides across a closing time, turning it to the evening. */
export const play = [
  { click: '[aria-label="Saturday closes"] [data-type="hour"]', wait: 900 },
  { key: "ArrowUp", wait: 700 },
  { key: "ArrowRight", wait: 800 },
  { key: "ArrowRight", wait: 800 },
  { key: "ArrowLeft", wait: 700 },
  { key: "ArrowLeft", wait: 700 },
  { key: "ArrowDown", wait: 1200 },
]

export default function TimeInputDemo() {
  return (
    <div className="w-full max-w-[380px]">
      <h3 className="text-[15px] font-semibold tracking-tight">Opening hours</h3>
      <p className="mt-1 text-[13px] text-muted-foreground">Little Fern Bakery</p>

      <div
        className="mt-5 grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-2 gap-y-2.5 text-[13px]"
        /* A scripted click does not focus an input by itself; this lets the self-playing loop in. */
        onClick={(event) => event.target instanceof HTMLInputElement && event.target.focus()}
      >
        {hours.map((row) => (
          <div key={row.day} className="contents">
            <span className="font-medium">{row.day}</span>
            <TimeInput hourCycle={12} defaultValue={row.opens} aria-label={`${row.day} opens`} />
            <span className="text-muted-foreground">to</span>
            <TimeInput
              hourCycle={12}
              defaultValue={row.closes}
              min={row.opens}
              aria-label={`${row.day} closes`}
            />
          </div>
        ))}
        <span className="font-medium text-muted-foreground">Holidays</span>
        <TimeInput hourCycle={12} disabled aria-label="Holidays opens" />
        <span className="text-muted-foreground">to</span>
        <TimeInput hourCycle={12} disabled aria-label="Holidays closes" />
      </div>
    </div>
  )
}
