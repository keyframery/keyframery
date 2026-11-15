import * as React from "react"

import {
  createScrollAreaController,
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "@/components/ui/scroll-area"

export const meta = { name: "Scroll Area", group: "Layout" }

/* The demo plays itself: the pointer arrives and the scrollbar fades in, the thumb thickens
   under it, and the list runs to its last guest and back. */
export const play = [
  { hover: '[data-slot="scroll-area"]', wait: 900 },
  { hover: '[data-slot="scroll-area-scrollbar"]', wait: 1000 },
  { click: '[data-play="last"]', wait: 1400 },
  { unhover: '[data-slot="scroll-area-scrollbar"]', wait: 700 },
  { click: '[data-play="first"]', wait: 1400 },
  { unhover: '[data-slot="scroll-area"]', wait: 1600 },
]

function Chevron({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="size-3.5">
      <path d={d} />
    </svg>
  )
}

const jump =
  "grid size-7 cursor-pointer place-items-center rounded-[8px] text-muted-foreground outline-none transition-[background-color,color,scale] duration-150 ease-pop hover:bg-accent hover:text-foreground active:scale-[0.94] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card motion-reduce:transition-none"

const guests = [
  { name: "Clare Dawson", note: "Hosting", reply: "Going" },
  { name: "Ben Morley", note: "Plus one", reply: "Going" },
  { name: "Nadia Haddad", note: "Vegetarian", reply: "Going" },
  { name: "Rob Fenwick", note: "Arrives Friday", reply: "Maybe" },
  { name: "Ellie Shaw", note: "Plus one", reply: "Going" },
  { name: "Gareth Price", note: "Bringing dessert", reply: "Going" },
  { name: "Priya Nair", note: "Vegan", reply: "Going" },
  { name: "Mateo Álvarez", note: "Driving up from Bristol", reply: "Going" },
  { name: "Freya Lindqvist", note: "Plus one", reply: "Maybe" },
  { name: "Omar Haddad", note: "No shellfish", reply: "Going" },
  { name: "Chloe Bennett", note: "Leaves early", reply: "Going" },
  { name: "Jun Park", note: "Plus one", reply: "No reply" },
  { name: "Sofia Ricci", note: "Bringing wine", reply: "Going" },
  { name: "Noah Fischer", note: "Arrives Saturday", reply: "Going" },
  { name: "Amara Okafor", note: "Gluten free", reply: "Going" },
  { name: "Lucas Martin", note: "Plus one", reply: "Maybe" },
  { name: "Elif Demir", note: "Vegetarian", reply: "Going" },
  { name: "Daniel Cohen", note: "Playing guitar", reply: "Going" },
  { name: "Hana Kimura", note: "Plus one", reply: "Going" },
  { name: "Marco Bianchi", note: "Taking photos", reply: "Going" },
  { name: "Leila Farahani", note: "Arrives Friday", reply: "No reply" },
  { name: "Oskar Nilsson", note: "No nuts", reply: "Going" },
  { name: "Grace Liu", note: "Plus one", reply: "Maybe" },
  { name: "Rafael Costa", note: "Bringing flowers", reply: "Going" },
]

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")

export default function ScrollAreaDemo() {
  const [controller] = React.useState(createScrollAreaController)
  /* Scripted pointer events cannot set :hover, so the demo mirrors it as data-hovered. */
  const [overBar, setOverBar] = React.useState(false)
  return (
    <div className="w-[320px] rounded-[14px] bg-card p-1.5 text-card-foreground shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
      <div className="flex items-center justify-between gap-3 py-1.5 pr-1 pl-2.5">
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight">Garden party</h3>
          <p className="mt-0.5 text-[12px] text-muted-foreground tabular-nums">18 of 24 going</p>
        </div>
        <div className="flex items-center gap-0.5">
          <button type="button" data-play="first" aria-label="First guest" className={jump} onClick={() => controller.scrollToStart({ behavior: "smooth" })}>
            <Chevron d="M4.5 9.75 8 6.25l3.5 3.5" />
          </button>
          <button type="button" data-play="last" aria-label="Last guest" className={jump} onClick={() => controller.scrollToEnd({ behavior: "smooth" })}>
            <Chevron d="M4.5 6.25 8 9.75l3.5-3.5" />
          </button>
        </div>
      </div>
      <ScrollArea controller={controller} className="h-[284px] rounded-[9px]">
        <ScrollAreaViewport role="region" aria-label="Guest list">
          <ScrollAreaContent>
            <ul>
              {guests.map((guest) => (
                <li key={guest.name} className="flex h-12 items-center gap-3 px-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                    {initials(guest.name)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] leading-[1.3] font-medium">{guest.name}</span>
                    <span className="block truncate text-[12px] leading-[1.3] text-muted-foreground">{guest.note}</span>
                  </span>
                  <span
                    className={
                      "mr-2 ml-auto shrink-0 text-[12px] " +
                      (guest.reply === "Going" ? "font-medium text-foreground" : "text-muted-foreground")
                    }
                  >
                    {guest.reply}
                  </span>
                </li>
              ))}
            </ul>
          </ScrollAreaContent>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar
          data-hovered={overBar || undefined}
          onPointerEnter={() => setOverBar(true)}
          onPointerLeave={() => setOverBar(false)}
        >
          <ScrollAreaThumb />
        </ScrollAreaScrollbar>
      </ScrollArea>
    </div>
  )
}
