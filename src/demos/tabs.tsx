import * as React from "react"

import { Tabs, TabsList, TabsPanel, TabsPanels, TabsTab } from "@/components/ui/tabs"

export const meta = { name: "Tabs", group: "Navigation" }

/* The demo plays itself: far jumps first, so the key visibly stretches across the list. */
export const play = [
  { click: '[role="tab"]:nth-of-type(4)', wait: 1600 },
  { click: '[role="tab"]:nth-of-type(2)', wait: 1400 },
  { click: '[role="tab"]:nth-of-type(3)', wait: 1400 },
  { click: '[role="tab"]:nth-of-type(1)', wait: 1800 },
]

const people = [
  { initials: "CD", name: "Clare Dawson", role: "Owner" },
  { initials: "RF", name: "Rob Fenwick", role: "Editor" },
  { initials: "NH", name: "Nadia Haddad", role: "Viewer" },
]

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] bg-muted/70 px-3 py-2.5">
      <div className="text-[11px] font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 text-[15px] font-semibold tracking-tight tabular-nums">{value}</div>
    </div>
  )
}

export const controls = {
  orientation: { type: "select", label: "Orientation", options: ["horizontal", "vertical"], default: "horizontal" },
  activation: { type: "select", label: "Activation", options: ["automatic", "manual"], default: "automatic" },
  loop: { type: "switch", label: "Loop", default: true, group: "Behaviour" },
  disabled: { type: "switch", label: "Disabled", default: false, group: "Behaviour" },
  hiddenUntilFound: { type: "switch", label: "Hidden until found", default: false, group: "Behaviour" },
  keepMounted: { type: "switch", label: "Keep mounted", default: false, group: "Behaviour" },
  defaultTab: { type: "select", label: "Default tab", options: ["overview", "activity", "people", "billing"], default: "overview" },
  items: { type: "slider", label: "Tabs", min: 1, max: 4, step: 1, default: 4, unit: "", group: "Layout" },
  peopleCount: { type: "slider", label: "People", min: 1, max: 3, step: 1, default: 3, unit: "", group: "Layout" },
  title: { type: "text", label: "Title", default: "Summer fête" },
  description: { type: "text", label: "Description", default: "Saturday 12 July, on the village green" },
  width: { type: "slider", label: "Width", min: 340, max: 600, step: 1, default: 420, unit: "px", group: "Layout" },
  height: { type: "slider", label: "Tab height", min: 24, max: 48, step: 1, default: 32, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Radius", min: 0, max: 24, step: 1, default: 12, unit: "px", group: "Layout" },
  keyRadius: { type: "slider", label: "Key radius", min: 0, max: 20, step: 1, default: 9, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Gap", min: 0, max: 12, step: 1, default: 2, unit: "px", group: "Layout" },
  track: { type: "color", label: "Track", default: "", group: "Colours" },
  keyFill: { type: "color", label: "Key", default: "", group: "Colours" },
  ink: { type: "color", label: "Ink", default: "", group: "Colours" },
  selectedInk: { type: "color", label: "Selected label", default: "", group: "Colours" },
} as const

export default function TabsDemo({
  orientation = "horizontal",
  activation = "automatic",
  loop = true,
  disabled = false,
  hiddenUntilFound = false,
  keepMounted = false,
  defaultTab = "overview",
  items = 4,
  peopleCount = 3,
  title = "Summer fête",
  description = "Saturday 12 July, on the village green",
  width = 420,
  height = 32,
  radius = 12,
  keyRadius = 9,
  gap = 2,
  track = "",
  keyFill = "",
  ink = "",
  selectedInk = "",
}: {
  orientation?: "horizontal" | "vertical"
  activation?: "automatic" | "manual"
  loop?: boolean
  disabled?: boolean
  hiddenUntilFound?: boolean
  keepMounted?: boolean
  defaultTab?: "overview" | "activity" | "people" | "billing"
  items?: number
  peopleCount?: number
  title?: string
  description?: string
  width?: number
  height?: number
  radius?: number
  keyRadius?: number
  gap?: number
  track?: string
  keyFill?: string
  ink?: string
  selectedInk?: string
} = {}) {
  const theme = {
    "--tabs-height": `${height}px`,
    "--tabs-radius": `${radius}px`,
    "--tabs-key-radius": `${keyRadius}px`,
    "--tabs-gap": `${gap}px`,
    ...(track ? { "--tabs-track": track } : {}),
    ...(keyFill ? { "--tabs-key": keyFill } : {}),
    ...(ink ? { "--tabs-ink": ink } : {}),
    ...(selectedInk ? { "--tabs-selected-ink": selectedInk } : {}),
  } as React.CSSProperties
  return (
    <Tabs key={defaultTab} defaultValue={["overview", "activity", "people", "billing"].slice(0, items).includes(defaultTab) ? defaultTab : "overview"} orientation={orientation} activation={activation} loop={loop} hiddenUntilFound={hiddenUntilFound} style={{ ...theme, maxWidth: width }} className="w-full">
      <TabsList aria-label="Event">
        {[["overview", "Overview"], ["activity", "Activity"], ["people", "People"], ["billing", "Money"]].slice(0, items).map(([value, label]) => <TabsTab key={value} value={value} disabled={disabled}>{label}</TabsTab>)}
      </TabsList>
      <TabsPanels className="h-[168px]">
        <TabsPanel keepMounted={keepMounted} value="overview">
          <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
          <p className="mt-1 text-[13px] text-muted-foreground">{description}</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Stat label="Stalls" value="14 of 20" />
            <Stat label="Raised" value="£1,240" />
            <Stat label="Days left" value="23" />
          </div>
        </TabsPanel>
        <TabsPanel keepMounted={keepMounted} value="activity">
          <ul className="space-y-3 text-[13px]">
            <li className="flex items-baseline justify-between gap-4">
              <span><b className="font-medium">Clare</b> booked the brass band</span>
              <span className="text-muted-foreground tabular-nums">2h</span>
            </li>
            <li className="flex items-baseline justify-between gap-4">
              <span><b className="font-medium">Rob</b> added 3 cake stalls</span>
              <span className="text-muted-foreground tabular-nums">5h</span>
            </li>
            <li className="flex items-baseline justify-between gap-4">
              <span><b className="font-medium">Nadia</b> left a note on parking</span>
              <span className="text-muted-foreground tabular-nums">1d</span>
            </li>
            <li className="flex items-baseline justify-between gap-4">
              <span><b className="font-medium">Clare</b> set the target to £2,000</span>
              <span className="text-muted-foreground tabular-nums">3d</span>
            </li>
          </ul>
        </TabsPanel>
        <TabsPanel keepMounted={keepMounted} value="people">
          <ul className="space-y-2.5">
            {people.slice(0, peopleCount).map((p) => (
              <li key={p.initials} className="flex items-center gap-3 text-[13px]">
                <span className="grid size-8 place-items-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                  {p.initials}
                </span>
                <span className="font-medium">{p.name}</span>
                <span className="ml-auto text-muted-foreground">{p.role}</span>
              </li>
            ))}
          </ul>
        </TabsPanel>
        <TabsPanel keepMounted={keepMounted} value="billing">
          <h3 className="text-[15px] font-semibold tracking-tight">Takings so far</h3>
          <p className="mt-1 text-[13px] text-muted-foreground">Card reader rented until 6pm</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Stat label="Cash" value="£860" />
            <Stat label="Card" value="£380" />
          </div>
        </TabsPanel>
      </TabsPanels>
    </Tabs>
  )
}
