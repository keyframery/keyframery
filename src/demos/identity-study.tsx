import { Tabs, TabsIndicator, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs"
import * as React from "react"

import { cn } from "@/lib/utils"

/* A study, not a component: the same three controls in three candidate identities, side by side. */
export const meta = { name: "Identity study", group: "Study" }

type Look = {
  id: string
  title: string
  radius: string
  well: string
  key: string
  active: string
  lit: boolean
  primary: string
  secondary: string
  trackOn: string
  trackOff: string
  thumb: string
}

const wellInset =
  "bg-muted shadow-[inset_0_1px_2px_rgb(0_0_0/0.07),inset_0_0_0_1px_rgb(0_0_0/0.035)] dark:shadow-[inset_0_1px_2px_rgb(0_0_0/0.5),inset_0_0_0_1px_rgb(255_255_255/0.04)]"
const raised =
  "bg-background shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)] dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]"

const looks: Look[] = [
  {
    id: "quiet",
    title: "A · Quiet",
    radius: "rounded-[9px]",
    well: cn("rounded-[12px]", wellInset),
    key: cn("rounded-[9px]", raised),
    active: "text-foreground",
    lit: false,
    primary:
      "rounded-[9px] bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.25)]",
    secondary: cn("rounded-[9px]", raised),
    trackOn: "bg-primary",
    trackOff: wellInset,
    thumb: "bg-background shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.2)]",
  },
  {
    id: "lit",
    title: "B · Lit",
    radius: "rounded-[9px]",
    well: "rounded-[12px] bg-muted shadow-[inset_0_1.5px_3px_rgb(0_0_0/0.1),inset_0_0_0_1px_rgb(0_0_0/0.045)] dark:shadow-[inset_0_2px_4px_rgb(0_0_0/0.6),inset_0_0_0_1px_rgb(255_255_255/0.04)]",
    key: cn("rounded-[9px]", raised),
    active: "text-foreground",
    lit: true,
    primary:
      "rounded-[9px] text-primary-foreground bg-[linear-gradient(180deg,color-mix(in_oklch,var(--primary)_86%,white),var(--primary))] shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_0_0_1px_var(--primary),0_2px_5px_-1px_rgb(0_0_0/0.35)] dark:bg-[linear-gradient(180deg,white,var(--primary))]",
    secondary: cn("rounded-[9px]", raised),
    trackOn: "bg-primary",
    trackOff:
      "bg-muted shadow-[inset_0_1.5px_3px_rgb(0_0_0/0.1),inset_0_0_0_1px_rgb(0_0_0/0.045)] dark:shadow-[inset_0_2px_4px_rgb(0_0_0/0.6),inset_0_0_0_1px_rgb(255_255_255/0.04)]",
    thumb: "bg-background shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.25)]",
  },
  {
    id: "ink",
    title: "C · Ink",
    radius: "rounded-full",
    well: "rounded-full bg-background shadow-[0_0_0_1px_rgb(0_0_0/0.1)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.16)]",
    key: "rounded-full bg-foreground",
    active: "text-background",
    lit: false,
    primary: "rounded-full bg-foreground text-background",
    secondary:
      "rounded-full bg-background shadow-[0_0_0_1px_rgb(0_0_0/0.12)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.18)]",
    trackOn: "bg-foreground",
    trackOff: "bg-background shadow-[inset_0_0_0_1px_rgb(0_0_0/0.14)] dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.2)]",
    thumb: "bg-background shadow-[0_0_0_1px_rgb(0_0_0/0.1)]",
  },
]

const light = "var(--light,var(--ring))"

/* The lit edge: a hairline of light on the top edge of whatever is selected or on. */
function LitEdge({ className }: { className?: string }) {
  return (
    <>
      <span
        className={cn("pointer-events-none absolute inset-x-[14%] top-0 h-px", className)}
        style={{ background: `linear-gradient(90deg, transparent, ${light}, transparent)` }}
      />
      <span
        className={cn("pointer-events-none absolute inset-x-[10%] top-0 h-3", className)}
        style={{
          background: `radial-gradient(70% 100% at 50% 0%, color-mix(in oklch, ${light} 22%, transparent), transparent)`,
        }}
      />
    </>
  )
}

const tabBox =
  "inline-flex h-8 shrink-0 items-center justify-center px-3 text-[13px] leading-none font-medium whitespace-nowrap"
const names = ["Overview", "Activity", "People"]

function StudyTabs({ look }: { look: Look }) {
  return (
    <Tabs defaultValue="Overview" className="flex flex-col">
      <TabsList aria-label={look.title} className={cn("relative isolate flex w-fit items-center gap-0.5 p-1", look.well)}>
        {names.map((n) => (
          <TabsTab
            key={n}
            value={n}
            className={cn(
              tabBox,
              look.radius,
              "cursor-pointer text-muted-foreground outline-none transition-colors duration-150 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            {n}
          </TabsTab>
        ))}
        <TabsIndicator
          aria-hidden
          className={cn(
            "pointer-events-none absolute z-10",
            look.key,
            "top-[var(--active-tab-top,50%)] right-[var(--active-tab-right,50%)] bottom-[var(--active-tab-bottom,50%)] left-[var(--active-tab-left,50%)]",
            "[--ease:cubic-bezier(0.22,1,0.36,1)] [--tl:440ms] [--tr:440ms]",
            "data-[activation-direction=left]:[--tl:250ms] data-[activation-direction=right]:[--tr:250ms]",
            "[transition:left_var(--tl)_var(--ease),right_var(--tr)_var(--ease)] data-[activation-direction=none]:[transition:none]",
          )}
        >
          <span className="absolute inset-0 overflow-hidden rounded-[inherit]">
            {look.lit ? <LitEdge /> : null}
            <span
              className={cn(
                "absolute flex items-center gap-0.5 p-1",
                look.active,
                "top-[calc(var(--active-tab-top,0px)*-1)] left-[calc(var(--active-tab-left,0px)*-1)]",
                "h-[calc(var(--active-tab-top,0px)+var(--active-tab-height,0px)+var(--active-tab-bottom,0px))]",
                "w-[calc(var(--active-tab-left,0px)+var(--active-tab-width,0px)+var(--active-tab-right,0px))]",
                "[transition:left_var(--tl)_var(--ease)]",
              )}
            >
              {names.map((n) => (
                <span key={n} className={tabBox}>
                  {n}
                </span>
              ))}
            </span>
          </span>
        </TabsIndicator>
      </TabsList>
      <div className="mt-3 grid h-10 text-[13px] text-muted-foreground">
        <TabsPanel value="Overview" className="[grid-area:1/1]">14 to 17 May · Alfama · 12 people</TabsPanel>
        <TabsPanel value="Activity" className="[grid-area:1/1]">Inès booked the Thursday dinner</TabsPanel>
        <TabsPanel value="People" className="[grid-area:1/1]">Inès, Kofi, Aiko and 9 more</TabsPanel>
      </div>
    </Tabs>
  )
}

function StudySwitch({ look, label, initial }: { look: Look; label: string; initial: boolean }) {
  const [on, setOn] = React.useState(initial)
  return (
    <label className="flex items-center justify-between gap-6 text-[13px] font-medium">
      {label}
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => setOn((v) => !v)}
        className={cn(
          "relative h-[22px] w-[38px] shrink-0 cursor-pointer overflow-hidden rounded-full outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          on ? look.trackOn : look.trackOff,
        )}
      >
        {look.lit && on ? <LitEdge /> : null}
        <span
          className={cn(
            "absolute top-[3px] left-[3px] size-4 rounded-full transition-[translate] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            look.thumb,
            on && "translate-x-4",
          )}
        />
      </button>
    </label>
  )
}

function Column({ look }: { look: Look }) {
  const btn =
    "relative inline-flex h-8 cursor-pointer items-center justify-center overflow-hidden px-3.5 text-[13px] leading-none font-medium outline-none transition-[translate,scale] duration-100 active:translate-y-px active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
  return (
    <div className="flex w-[292px] flex-col gap-6">
      <div className="text-[12px] font-medium text-muted-foreground">{look.title}</div>
      <StudyTabs look={look} />
      <div className="flex gap-2">
        <button type="button" className={cn(btn, look.primary, "group")}>
          {look.lit ? <LitEdge className="opacity-70 transition-opacity duration-200 group-hover:opacity-100" /> : null}
          <span className="relative">Book trip</span>
        </button>
        <button type="button" className={cn(btn, look.secondary)}>
          Save draft
        </button>
      </div>
      <div className="flex flex-col gap-3">
        <StudySwitch look={look} label="Email me the itinerary" initial />
        <StudySwitch look={look} label="Share with the group" initial={false} />
      </div>
    </div>
  )
}

export default function IdentityStudy() {
  return (
    <div
      className="flex gap-12"
      style={{ "--light": "oklch(0.66 0.19 255)" } as React.CSSProperties}
    >
      {looks.map((look) => (
        <Column key={look.id} look={look} />
      ))}
    </div>
  )
}
