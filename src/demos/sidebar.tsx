import * as React from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export const meta = { name: "Sidebar", group: "Navigation" }

/* The key glides down and across groups, a group folds, and the sidebar narrows to a rail and back. */
export const play = [
  { click: '[data-page="today"]', wait: 1300 },
  { click: '[data-page="kitchen"]', wait: 1500 },
  { click: '[data-page="inbox"]', wait: 1400 },
  { click: '[data-slot="sidebar-trigger"]', wait: 1600 },
  { click: '[data-page="garden"]', wait: 1300 },
  { click: '[data-slot="sidebar-trigger"]', wait: 1600 },
  { click: '[data-group="projects"]', wait: 1200 },
  { click: '[data-group="projects"]', wait: 1400 },
]

const icons = {
  inbox: "M2.5 9.5h3l1 1.5h3l1-1.5h3M2.5 9.5l1.6-5.2a1 1 0 0 1 1-.8h5.8a1 1 0 0 1 1 .8l1.6 5.2v3a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1z",
  today: "M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14M3.8 3.8l1 1M11.2 11.2l1 1M3.8 12.2l1-1M11.2 4.8l1-1M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z",
  upcoming: "M3 4.5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM3 7h10M5.5 2v2.5M10.5 2v2.5",
  project: "M5.5 3 4.5 13M11.5 3l-1 10M3 6h10.5M2.5 10h10.5",
  settings: "M2.5 4.5h6M11.5 4.5h2M2.5 11.5h2M7.5 11.5h6M10 3v3M6 10v3",
}

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  )
}

type Page = { id: string; title: string; icon: string; count?: number; tasks: [string, string][] }

const top: Page[] = [
  {
    id: "inbox",
    title: "Inbox",
    icon: icons.inbox,
    count: 4,
    tasks: [
      ["Reply to the landlord about the boiler", "Today"],
      ["Book the MOT", "Fri"],
      ["Return the hedge trimmer to Gareth", ""],
    ],
  },
  {
    id: "today",
    title: "Today",
    icon: icons.today,
    count: 3,
    tasks: [
      ["Pick up the prescription", "Before 6pm"],
      ["Call Mum", ""],
      ["Pay the window cleaner", "£18"],
    ],
  },
  {
    id: "upcoming",
    title: "Upcoming",
    icon: icons.upcoming,
    tasks: [
      ["Dentist", "Tue 10:40"],
      ["Bins out", "Wed night"],
      ["Ellie’s birthday", "Sat"],
    ],
  },
]

const projects: Page[] = [
  {
    id: "kitchen",
    title: "Kitchen refit",
    icon: icons.project,
    tasks: [
      ["Choose the worktop", "Oak or quartz"],
      ["Measure for the extractor", ""],
      ["Second quote from Dawson’s", "Waiting"],
    ],
  },
  {
    id: "garden",
    title: "Garden",
    icon: icons.project,
    tasks: [
      ["Order the bulbs", "By October"],
      ["Fix the shed latch", ""],
      ["Move the rhubarb", ""],
    ],
  },
  {
    id: "tax",
    title: "Tax return",
    icon: icons.project,
    tasks: [
      ["Find the P60", ""],
      ["Add up the mileage", ""],
      ["File it", "31 Jan"],
    ],
  },
]

const pages = [...top, ...projects]

export default function SidebarDemo() {
  const [active, setActive] = React.useState("inbox")
  const [done, setDone] = React.useState<Record<string, boolean>>({})
  const page = pages.find((p) => p.id === active) ?? pages[0]

  const item = (p: Page) => (
    <SidebarMenuItem key={p.id}>
      <SidebarMenuButton data-page={p.id} isActive={active === p.id} tooltip={p.title} onClick={() => setActive(p.id)}>
        <Icon d={p.icon} />
        <SidebarLabel>{p.title}</SidebarLabel>
        {p.count ? <SidebarMenuBadge>{p.count}</SidebarMenuBadge> : null}
      </SidebarMenuButton>
    </SidebarMenuItem>
  )

  return (
    <SidebarProvider className="h-[380px] w-[600px] overflow-hidden rounded-[16px] bg-background shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_2px_4px_-2px_rgb(0_0_0/0.06),0_16px_40px_-16px_rgb(0_0_0/0.18)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_16px_40px_-16px_rgb(0_0_0/0.7)]">
      <Sidebar aria-label="Lists">
        <SidebarHeader>
          <SidebarTrigger className="h-8 w-10" />
          <span className="truncate text-[13px] font-semibold tracking-tight transition-[opacity,filter] duration-[calc(240ms*var(--kf-speed,1))] ease-house group-data-collapsed/sidebar-provider:opacity-0 group-data-collapsed/sidebar-provider:blur-[3px] motion-reduce:transition-none">
            Personal
          </span>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>{top.map(item)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup collapsible>
            <SidebarGroupLabel data-group="projects">Projects</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{projects.map(item)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Settings">
                <Icon d={icons.settings} />
                <SidebarLabel>Settings</SidebarLabel>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-col px-6 py-5">
        <style href="kf-sidebar-demo" precedence="default">
          {"@keyframes kf-sidebar-page{from{opacity:0;translate:0 8px;filter:blur(4px)}}"}
        </style>
        <div
          key={page.id}
          className="animate-[kf-sidebar-page_calc(420ms*var(--kf-speed,1))_var(--ease-spring)] motion-reduce:animate-none"
        >
          <div className="flex items-baseline justify-between gap-4">
            <div className="text-[17px] font-semibold tracking-tight">{page.title}</div>
            <span className="text-[12px] text-muted-foreground tabular-nums">
              {page.tasks.filter(([t]) => !done[t]).length} left
            </span>
          </div>
          <ul className="mt-4">
            {page.tasks.map(([task, note]) => (
              <li key={task} className="flex items-center gap-3 border-b border-border/70 py-2.5 last:border-0">
                <button
                  type="button"
                  aria-pressed={!!done[task]}
                  aria-label={`Mark “${task}” done`}
                  onClick={() => setDone((d) => ({ ...d, [task]: !d[task] }))}
                  className="grid size-4 shrink-0 cursor-pointer place-items-center rounded-full shadow-[inset_0_0_0_1.5px_color-mix(in_oklab,var(--foreground)_28%,transparent)] transition-[background-color,box-shadow,scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop outline-none active:scale-90 focus-visible:ring-2 focus-visible:ring-ring aria-pressed:bg-foreground aria-pressed:shadow-none motion-reduce:transition-none"
                >
                  {done[task] && (
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="size-2.5 text-background">
                      <path d="m3.5 8.5 3 3 6-7" />
                    </svg>
                  )}
                </button>
                <span className={`min-w-0 flex-1 truncate text-[13px] ${done[task] ? "text-muted-foreground line-through" : ""}`}>{task}</span>
                {note && <span className="shrink-0 text-[12px] text-muted-foreground tabular-nums">{note}</span>}
              </li>
            ))}
          </ul>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
