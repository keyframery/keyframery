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
  { initials: "IM", name: "Inès Moreau", role: "Owner" },
  { initials: "KM", name: "Kofi Mensah", role: "Editor" },
  { initials: "AS", name: "Aiko Sato", role: "Viewer" },
]

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] bg-muted/70 px-3 py-2.5">
      <div className="text-[11px] font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 text-[15px] font-semibold tracking-tight tabular-nums">{value}</div>
    </div>
  )
}

export default function TabsDemo() {
  return (
    <Tabs defaultValue="overview" className="w-[420px]">
      <TabsList aria-label="Trip">
        <TabsTab value="overview">Overview</TabsTab>
        <TabsTab value="activity">Activity</TabsTab>
        <TabsTab value="people">People</TabsTab>
        <TabsTab value="billing">Billing</TabsTab>
      </TabsList>
      <TabsPanels className="h-[168px]">
        <TabsPanel value="overview">
          <h3 className="text-[15px] font-semibold tracking-tight">Lisbon offsite</h3>
          <p className="mt-1 text-[13px] text-muted-foreground">14 to 17 May · Alfama · 12 people</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Stat label="Booked" value="9 of 12" />
            <Stat label="Budget" value="€8,400" />
            <Stat label="Days left" value="23" />
          </div>
        </TabsPanel>
        <TabsPanel value="activity">
          <ul className="space-y-3 text-[13px]">
            <li className="flex items-baseline justify-between gap-4">
              <span><b className="font-medium">Inès</b> booked the Thursday dinner</span>
              <span className="text-muted-foreground tabular-nums">2h</span>
            </li>
            <li className="flex items-baseline justify-between gap-4">
              <span><b className="font-medium">Kofi</b> added flights for 4 people</span>
              <span className="text-muted-foreground tabular-nums">5h</span>
            </li>
            <li className="flex items-baseline justify-between gap-4">
              <span><b className="font-medium">Aiko</b> left a note on the hotel</span>
              <span className="text-muted-foreground tabular-nums">1d</span>
            </li>
            <li className="flex items-baseline justify-between gap-4">
              <span><b className="font-medium">Inès</b> set the budget to €8,400</span>
              <span className="text-muted-foreground tabular-nums">3d</span>
            </li>
          </ul>
        </TabsPanel>
        <TabsPanel value="people">
          <ul className="space-y-2.5">
            {people.map((p) => (
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
        <TabsPanel value="billing">
          <h3 className="text-[15px] font-semibold tracking-tight">Team plan</h3>
          <p className="mt-1 text-[13px] text-muted-foreground">€24 a month · renews on 1 June</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Stat label="Seats used" value="12 of 15" />
            <Stat label="Next invoice" value="€24.00" />
          </div>
        </TabsPanel>
      </TabsPanels>
    </Tabs>
  )
}
