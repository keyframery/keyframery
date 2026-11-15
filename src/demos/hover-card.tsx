import { HoverCard, HoverCardArrow, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

export const meta = { name: "Hover Card", group: "Overlays" }

/* The demo plays itself: the pointer rests on the link, the card unfolds after its delay with its
   sections cascading in, then the pointer leaves for the author's name and the card goes. */
export const play = [
  { hover: "[data-slot=hover-card-trigger]", wait: 2800 },
  { unhover: "[data-slot=hover-card-trigger]", wait: 0 },
  { hover: "[data-play=away]", wait: 1600 },
]

function Icon({ d, className = "size-3.5" }: { d: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={"shrink-0 " + className}
    >
      <path d={d} />
    </svg>
  )
}

export default function HoverCardDemo() {
  return (
    <div className="w-[380px] rounded-[14px] bg-muted/60 p-4">
      <div className="flex items-center gap-2.5">
        <img src="/demo/face-3.jpg" alt="" className="size-7 rounded-full bg-muted object-cover" />
        <span data-play="away" className="text-[13px] font-medium">Priya Shah</span>
        <span className="ml-auto text-[12px] text-muted-foreground tabular-nums">2h</span>
      </div>
      <div className="mt-3 text-[14px] leading-[22px] text-foreground/85">
        Thursday dinner is booked for all eight of us at{" "}
        <HoverCard>
          <HoverCardTrigger href="#taberna" className="whitespace-nowrap">Taberna da Rua das Flores</HoverCardTrigger>
          <HoverCardContent>
            <HoverCardArrow />
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-muted text-muted-foreground shadow-[inset_0_0_0_1px_rgb(0_0_0/0.04)] dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.05)]">
                <Icon className="size-[18px]" d="M4.5 2.5v3.5a1.75 1.75 0 0 0 3.5 0V2.5M6.25 2.5v11M11.5 13.5v-11c-1.5.5-2.25 2.25-2.25 4.75 0 1 .75 1.5 2.25 1.5" />
              </span>
              <div className="min-w-0">
                <div className="text-[14px] leading-5 font-semibold tracking-tight">Taberna da Rua das Flores</div>
                <div className="text-[12px] text-muted-foreground">Small plates, Chiado</div>
              </div>
            </div>
            <div className="mt-3 leading-5 text-muted-foreground">
              Small plates written on a chalkboard each night. Walk-ins only before 19:00.
            </div>
            <div className="mt-3 flex items-center gap-4 border-t border-border pt-3 text-[12px] tabular-nums">
              <span className="flex items-center gap-1.5">
                <Icon d="m8 2.5 1.6 3.4 3.7.4-2.8 2.5.8 3.7L8 10.6l-3.3 1.9.8-3.7-2.8-2.5 3.7-.4z" />
                <span className="font-medium">4.7</span>
                <span className="text-muted-foreground">(1,284)</span>
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Icon d="M8 4.5V8l2.5 1.5M14 8A6 6 0 1 1 2 8a6 6 0 0 1 12 0Z" />
                Open until 23:00
              </span>
            </div>
          </HoverCardContent>
        </HoverCard>
        , 20:30. The table is under my name.
      </div>
    </div>
  )
}
