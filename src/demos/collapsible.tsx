import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@/components/ui/collapsible"

export const meta = { name: "Collapsible", group: "Disclosure" }

/* Opens and closes the hidden stops, so they cascade in as the height opens. */
export const play = [
  { click: '[data-slot="collapsible-trigger"]', wait: 2000 },
  { click: '[data-slot="collapsible-trigger"]', wait: 1500 },
]

const middle = [
  { time: "09:31", name: "Darlington" },
  { time: "10:02", name: "York" },
  { time: "10:34", name: "Doncaster" },
]

function Stop({
  time,
  name,
  detail,
  end,
}: {
  time: string
  name: string
  detail?: string
  end?: boolean
}) {
  return (
    <div className="grid grid-cols-[44px_20px_1fr] items-center py-2 leading-5">
      <span className="text-[12px] text-muted-foreground tabular-nums">{time}</span>
      <span className="grid place-items-center">
        <span
          className={
            end
              ? "relative z-10 size-2.5 rounded-full bg-primary ring-4 ring-card"
              : "relative z-10 size-1.5 rounded-full bg-muted-foreground/60 ring-4 ring-card"
          }
        />
      </span>
      <span className="flex items-baseline gap-2 pl-2">
        <span className={end ? "text-[14px] font-medium" : "text-[13px]"}>{name}</span>
        {detail && <span className="text-[12px] text-muted-foreground">{detail}</span>}
      </span>
    </div>
  )
}

export default function CollapsibleDemo() {
  return (
    <div className="w-[420px]">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-[15px] font-semibold tracking-tight">Edinburgh to London</h3>
        <p className="text-[12px] text-muted-foreground tabular-nums">LNER 1E07</p>
      </div>
      <p className="mt-1 text-[13px] text-muted-foreground">Saturday 16 May, coach 4, seat 61</p>

      <div className="relative mt-4 rounded-[14px] bg-card px-4 py-2 shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_1px_2px_rgb(0_0_0/0.04)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]">
        {/* The line the stops sit on. */}
        <span aria-hidden className="absolute top-6 bottom-6 left-[69px] w-px bg-border" />
        <Stop time="08:09" name="Edinburgh Waverley" detail="Platform 5" end />
        <Stop time="08:52" name="Newcastle" />
        <Collapsible>
          <CollapsibleTrigger className="ml-[62px] w-[calc(100%-62px)]">
            {(state) => (state.open ? "Hide stops" : "Show 3 more stops")}
          </CollapsibleTrigger>
          <CollapsiblePanel>
            {middle.map((stop) => (
              <Stop key={stop.name} time={stop.time} name={stop.name} />
            ))}
          </CollapsiblePanel>
        </Collapsible>
        <Stop time="11:05" name="Peterborough" />
        <Stop time="11:14" name="London King's Cross" detail="Arrives on time" end />
      </div>
    </div>
  )
}
