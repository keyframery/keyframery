import * as React from "react"

import {
  createResizableController,
  Resizable,
  ResizableHandle,
  ResizablePanel,
} from "@/components/ui/resizable"

export const meta = { name: "Resizable", group: "Layout" }

/* The demo plays itself: the pointer finds the handle (the ring line grows, the grip stretches),
   then the reader widens and narrows again, so the panels glide on a spring. */
export const play = [
  { hover: '[data-slot="resizable-handle"]', wait: 1300 },
  { unhover: '[data-slot="resizable-handle"]', wait: 500 },
  { click: '[data-play="focus"]', wait: 1500 },
  { click: '[data-play="focus"]', wait: 1700 },
]

function ExpandIcon({ wide }: { wide: boolean }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="size-4">
      <rect x="2.5" y="3" width="11" height="10" rx="2.25" />
      <path d={wide ? "M6.25 3v10" : "M8.75 3v10"} />
    </svg>
  )
}

const mail = [
  { from: "Inès Moreau", subject: "Lisbon offsite: final headcount", time: "09:24" },
  { from: "Kofi Mensah", subject: "Flights for the 14th", time: "08:10" },
  { from: "Aiko Sato", subject: "Hotel confirmation", time: "Tue" },
  { from: "Hollis Grant", subject: "Dinner on Thursday", time: "Mon" },
  { from: "Wren Takahashi", subject: "Photos from Kyoto", time: "Sun" },
]

export default function ResizableDemo() {
  const [controller] = React.useState(createResizableController)
  const [wide, setWide] = React.useState(false)
  const toggle = () => {
    controller.setLayout(wide ? [42, 58] : [30, 70])
    setWide(!wide)
  }
  return (
    <div className="h-[332px] w-[468px] overflow-hidden rounded-[14px] bg-card text-card-foreground shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
      <Resizable controller={controller}>
        <ResizablePanel defaultSize={42} minSize={30} maxSize={62}>
          <div className="flex items-baseline justify-between px-4 pt-3.5 pb-2">
            <h3 className="text-[15px] font-semibold tracking-tight">Inbox</h3>
            <span className="text-[12px] text-muted-foreground tabular-nums">2 unread</span>
          </div>
          <ul className="px-1.5">
            {mail.map((message, index) => (
              <li
                key={message.subject}
                className={
                  "rounded-[8px] px-2.5 py-2 " + (index === 0 ? "bg-accent" : "")
                }
              >
                <div className="flex items-baseline gap-2">
                  <span className="truncate text-[13px] font-medium">{message.from}</span>
                  <span className="ml-auto shrink-0 text-[11px] text-muted-foreground tabular-nums">
                    {message.time}
                  </span>
                </div>
                <div className="mt-0.5 truncate text-[12px] text-muted-foreground">
                  {message.subject}
                </div>
              </li>
            ))}
          </ul>
        </ResizablePanel>
        <ResizableHandle aria-label="Resize inbox" />
        <ResizablePanel minSize={38}>
          <article className="px-5 pt-3.5">
            <div className="flex items-start gap-3">
              <h3 className="text-[15px] font-semibold tracking-tight">
                Lisbon offsite: final headcount
              </h3>
              <button
                type="button"
                data-play="focus"
                aria-label={wide ? "Show more of the inbox" : "Widen the message"}
                aria-pressed={wide}
                onClick={toggle}
                className="-mt-1 -mr-2 ml-auto grid size-7 shrink-0 cursor-pointer place-items-center rounded-[8px] text-muted-foreground outline-none transition-[background-color,color,scale] duration-150 ease-pop hover:bg-accent hover:text-foreground active:scale-[0.94] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card motion-reduce:transition-none"
              >
                <ExpandIcon wide={wide} />
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                IM
              </span>
              <div className="min-w-0">
                <div className="truncate text-[13px] font-medium">Inès Moreau</div>
                <div className="truncate text-[12px] text-muted-foreground">To the Lisbon group · 09:24</div>
              </div>
            </div>
            <p className="mt-4 text-[13px] leading-[1.6]">
              We are twelve for Lisbon. Rooms are booked from the 14th to the 17th, and dinner on
              Thursday is at eight in Alfama.
            </p>
            <p className="mt-3 text-[13px] leading-[1.6]">
              Send me your food notes by Friday and I will pass them on to the kitchen.
            </p>
          </article>
        </ResizablePanel>
      </Resizable>
    </div>
  )
}
