import * as React from "react"

import { Accordion, AccordionHeader, AccordionItem, AccordionPanel, AccordionTrigger } from "@/components/ui/accordion"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuLinkIcon,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu"

export const meta = { name: "Navigation Menu", group: "Navigation" }

/* The demo plays itself: far jumps first, so the marker stretches across the bar while the
   panel springs to its new size and the links cascade in; then it closes back to Trips.
   On a phone the bar has no room for the menu: a breadcrumb says where you are, and the menu
   button drops the same sections down as an accordion. */
const trigger = (n: number) => `[data-slot=navigation-menu-item]:nth-child(${n}) > [data-slot=navigation-menu-trigger]`
const section = (v: string) => `[data-mobile-nav] [data-section=${v}] [data-slot=accordion-trigger]`
export const play = [
  { click: trigger(1), wait: 1300, only: "wide" as const },
  { click: trigger(3), wait: 1300, only: "wide" as const },
  { click: trigger(2), wait: 1300, only: "wide" as const },
  { click: trigger(2), wait: 1600, only: "wide" as const },
  { click: "[data-menu-button]", wait: 1000, only: "narrow" as const },
  { click: section("destinations"), wait: 1400, only: "narrow" as const },
  { click: section("stays"), wait: 1400, only: "narrow" as const },
  { click: section("stays"), wait: 900, only: "narrow" as const },
  { click: "[data-menu-button]", wait: 1600, only: "narrow" as const },
]

const destinations = [
  { title: "Portugal", hint: "Lisbon, Porto, the Algarve" },
  { title: "Japan", hint: "Kyoto, Naoshima, Hokkaido" },
  { title: "Morocco", hint: "Marrakech, Fes, the Atlas" },
  { title: "Norway", hint: "Lofoten, Bergen, Tromsø" },
]

const stays = [
  { title: "Small hotels", hint: "Under 20 rooms, chosen by us", icon: "M3 13.5V4.5l5-2 5 2v9M6 13.5v-3h4v3M6 6.5h.01M10 6.5h.01" },
  { title: "Apartments", hint: "Kitchens and long stays", icon: "M3.5 13.5V3h9v10.5M2.5 13.5h11M6 5.5h1M9 5.5h1M6 8h1M9 8h1M7 13.5V11h2v2.5" },
  { title: "Cabins", hint: "Off-grid, near water", icon: "M2.5 7.5 8 3l5.5 4.5M4 6.5v7h8v-7M7 13.5v-3h2v3" },
]

const about = [
  { title: "Our story", hint: "Slow travel since 2014" },
  { title: "Journal", hint: "Field notes from the road" },
  { title: "Help", hint: "Changes, refunds, contact" },
]

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <ul className={"m-0 grid list-none gap-0.5 p-0 " + (className ?? "")}>{children}</ul>
}

function Row({ title, hint, icon }: { title: string; hint: string; icon?: string }) {
  return (
    <li>
      <NavigationMenuLink href="#">
        {icon && (
          <NavigationMenuLinkIcon>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d={icon} />
            </svg>
          </NavigationMenuLinkIcon>
        )}
        <span className="flex min-w-0 flex-col">
          <span className="font-medium">{title}</span>
          <span className="text-[12px] leading-4 text-muted-foreground">{hint}</span>
        </span>
      </NavigationMenuLink>
    </li>
  )
}

/* The phone menu: the same sections, each one opening in place. */
function MobileMenu({ open, items }: { open: boolean; items: number }) {
  const sections = [
    { value: "destinations", label: "Destinations", links: destinations },
    { value: "stays", label: "Stays", links: stays },
    { value: "about", label: "About", links: about },
  ]
  return (
    <nav
      aria-label="Main"
      data-mobile-nav
      data-open={open || undefined}
      inert={!open}
      className="absolute inset-x-0 top-14 z-20 origin-top rounded-[14px] bg-background px-4 pb-2 opacity-0 shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_16px_40px_-16px_rgb(0_0_0/0.25)] transition-[opacity,scale,translate] duration-[calc(180ms*var(--kf-speed,1))] ease-house -translate-y-1 scale-[0.98] data-open:translate-y-0 data-open:scale-100 data-open:opacity-100 data-open:duration-[calc(320ms*var(--kf-speed,1))] data-open:ease-spring motion-reduce:transition-none dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_16px_40px_-16px_rgb(0_0_0/0.7)]"
    >
      <Accordion>
        {sections.map((s) => (
          <AccordionItem key={s.value} value={s.value} data-section={s.value}>
            <AccordionHeader>
              <AccordionTrigger>{s.label}</AccordionTrigger>
            </AccordionHeader>
            <AccordionPanel>
              <ul className="-mt-1 grid gap-3 pb-1">
                {s.links.slice(0, items).map((l) => (
                  <li key={l.title}>
                    <a href="#" className="flex flex-col rounded-[6px] outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <span className="font-medium text-foreground">{l.title}</span>
                      <span className="text-[12px] text-muted-foreground">{l.hint}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
      <a href="#" aria-current="page" className="flex h-12 items-center text-[14px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring">
        Trips
      </a>
    </nav>
  )
}

export const controls = {
  orientation: { type: "select", label: "Orientation", default: "horizontal", options: ["horizontal", "vertical"] },
  side: { type: "select", label: "Panel side", default: "auto", options: ["auto", "top", "right", "bottom", "left"] },
  align: { type: "select", label: "Panel alignment", default: "start", options: ["start", "center", "end"] },
  openOnHover: { type: "switch", label: "Open on hover", default: true, group: "Behaviour" },
  closeOnSelect: { type: "switch", label: "Close on link", default: true, group: "Behaviour" },
  disabled: { type: "switch", label: "Disabled triggers", default: false, group: "Behaviour" },
  current: { type: "switch", label: "Current Trips link", default: true, group: "Behaviour" },
  keepMounted: { type: "switch", label: "Keep panels mounted", default: false, group: "Behaviour" },
  hiddenUntilFound: { type: "switch", label: "Find closed panels", default: false, group: "Behaviour" },
  brand: { type: "text", label: "Brand", default: "Wayfare" },
  headline: { type: "text", label: "Headline", default: "Twelve quiet places to spend October." },
  action: { type: "text", label: "Action", default: "Plan a trip" },
  items: { type: "slider", label: "Links per section", default: 4, min: 1, max: 4, step: 1, unit: "", group: "Layout" },
  width: { type: "slider", label: "Width", default: 640, min: 340, max: 720, step: 1, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Trigger gap", default: 2, min: 0, max: 12, step: 1, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Panel corners", default: 14, min: 0, max: 28, step: 1, unit: "px", group: "Layout" },
  surface: { type: "color", label: "Panel", default: "", group: "Colours" },
  ink: { type: "color", label: "Text", default: "", group: "Colours" },
  muted: { type: "color", label: "Trigger text", default: "", group: "Colours" },
  highlight: { type: "color", label: "Highlight", default: "", group: "Colours" },
} as const

export default function NavigationMenuDemo({
  orientation = "horizontal",
  side = "auto",
  align = "start",
  openOnHover = true,
  closeOnSelect = true,
  disabled = false,
  current = true,
  keepMounted = false,
  hiddenUntilFound = false,
  brand = "Wayfare",
  headline = "Twelve quiet places to spend October.",
  action = "Plan a trip",
  items = 4,
  width = 640,
  gap = 2,
  radius = 14,
  surface = "",
  ink = "",
  muted = "",
  highlight = "",
}: {
  orientation?: "horizontal" | "vertical"
  side?: "auto" | "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  openOnHover?: boolean
  closeOnSelect?: boolean
  disabled?: boolean
  current?: boolean
  keepMounted?: boolean
  hiddenUntilFound?: boolean
  brand?: string
  headline?: string
  action?: string
  items?: number
  width?: number
  gap?: number
  radius?: number
  surface?: string
  ink?: string
  muted?: string
  highlight?: string
}) {
  const theme = {
    "--navigation-menu-radius": `${radius}px`,
    "--navigation-menu-item-radius": `${radius * 9 / 14}px`,
    "--navigation-menu-gap": `${gap}px`,
    ...(surface ? { "--navigation-menu-surface": surface } : {}),
    ...(ink ? { "--navigation-menu-ink": ink } : {}),
    ...(muted ? { "--navigation-menu-muted": muted } : {}),
    ...(highlight ? { "--navigation-menu-highlight": highlight } : {}),
  } as React.CSSProperties
  const [menu, setMenu] = React.useState(false)
  return (
    <div style={{ ...theme, maxWidth: width }} className="@container relative flex h-[420px] w-full max-w-[640px] flex-col">
      <header className="flex h-12 items-center gap-4 rounded-[14px] bg-background px-2 ps-4 shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_1px_2px_rgb(0_0_0/0.04)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
        <span className="text-[15px] font-semibold tracking-tight">{brand}</span>
        <NavigationMenu orientation={orientation} openOnHover={openOnHover} closeOnSelect={closeOnSelect} aria-label="Main" className="@max-[36rem]:hidden">
          <NavigationMenuList>
            <NavigationMenuItem value="destinations">
              <NavigationMenuTrigger disabled={disabled}>Destinations</NavigationMenuTrigger>
              <NavigationMenuContent keepMounted={keepMounted} hiddenUntilFound={hiddenUntilFound}>
                <Panel className="w-[440px] grid-cols-2">
                  {destinations.slice(0, items).map((d) => (
                    <Row key={d.title} {...d} />
                  ))}
                </Panel>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem value="stays">
              <NavigationMenuTrigger disabled={disabled}>Stays</NavigationMenuTrigger>
              <NavigationMenuContent keepMounted={keepMounted} hiddenUntilFound={hiddenUntilFound}>
                <Panel className="w-[300px]">
                  {stays.slice(0, items).map((s) => (
                    <Row key={s.title} {...s} />
                  ))}
                </Panel>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem value="about">
              <NavigationMenuTrigger disabled={disabled}>About</NavigationMenuTrigger>
              <NavigationMenuContent keepMounted={keepMounted} hiddenUntilFound={hiddenUntilFound}>
                <Panel className="w-[240px]">
                  {about.slice(0, items).map((a) => (
                    <Row key={a.title} {...a} />
                  ))}
                </Panel>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#" current={current}>
                Trips
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
          <NavigationMenuIndicator />
          <NavigationMenuViewport side={side === "auto" ? undefined : side} align={align} />
        </NavigationMenu>
        <a
          href="#"
          className="ms-auto inline-flex h-8 items-center rounded-[9px] bg-primary px-3 text-[13px] leading-none font-medium text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.25)] outline-none transition-[translate,scale] duration-[calc(100ms*var(--kf-speed,1))] ease-house focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px active:scale-[0.985]"
        >
          {action}
        </a>
        <button
          type="button"
          data-menu-button
          aria-label={menu ? "Close menu" : "Menu"}
          aria-expanded={menu}
          onClick={() => setMenu((m) => !m)}
          className="-ms-2 hidden size-8 cursor-pointer place-items-center rounded-[9px] text-foreground outline-none transition-[scale,background-color] duration-[calc(200ms*var(--kf-speed,1))] ease-pop hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring active:scale-90 aria-expanded:bg-accent motion-reduce:transition-none @max-[36rem]:grid"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden className="size-4">
            <path
              d={menu ? "M4 4l8 8M12 4l-8 8" : "M2.5 5h11M2.5 11h11"}
              className="transition-[d] duration-[calc(260ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none"
            />
          </svg>
        </button>
      </header>
      <nav aria-label="Breadcrumb" className="mt-3 hidden px-1 @max-[36rem]:block">
        <ol className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <li>
            <a href="#" className="rounded-[4px] outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
              Journal
            </a>
          </li>
          <li aria-hidden>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-3 opacity-60">
              <path d="m6 4 4 4-4 4" />
            </svg>
          </li>
          <li aria-current="page" className="font-medium text-foreground">
            Autumn, slowly
          </li>
        </ol>
      </nav>
      <MobileMenu open={menu} items={items} />
      <div className="flex flex-1 flex-col justify-end px-4 pb-6 @max-[36rem]:px-1 @max-[36rem]:pb-2">
        <p className="text-[12px] font-medium text-muted-foreground @max-[36rem]:hidden">Autumn, slowly</p>
        <h2 className="mt-1.5 max-w-[420px] text-[28px] leading-[1.1] font-semibold tracking-tight @max-[36rem]:text-[24px]">
          {headline}
        </h2>
        <p className="mt-2.5 max-w-[400px] text-[14px] text-muted-foreground">
          Small hotels, long trains and one good meal a day, planned around the light.
        </p>
      </div>
    </div>
  )
}
