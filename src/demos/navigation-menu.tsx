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
   panel springs to its new size and the links cascade in; then it closes back to Trips. */
const trigger = (n: number) => `[data-slot=navigation-menu-item]:nth-child(${n}) > [data-slot=navigation-menu-trigger]`
export const play = [
  { click: trigger(1), wait: 1300 },
  { click: trigger(3), wait: 1300 },
  { click: trigger(2), wait: 1300 },
  { click: trigger(2), wait: 1600 },
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

export default function NavigationMenuDemo() {
  return (
    <div className="flex h-[420px] w-[640px] flex-col">
      <header className="flex h-12 items-center gap-4 rounded-[14px] bg-background px-2 ps-4 shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_1px_2px_rgb(0_0_0/0.04)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
        <span className="text-[15px] font-semibold tracking-tight">Wayfare</span>
        <NavigationMenu aria-label="Main">
          <NavigationMenuList>
            <NavigationMenuItem value="destinations">
              <NavigationMenuTrigger>Destinations</NavigationMenuTrigger>
              <NavigationMenuContent>
                <Panel className="w-[440px] grid-cols-2">
                  {destinations.map((d) => (
                    <Row key={d.title} {...d} />
                  ))}
                </Panel>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem value="stays">
              <NavigationMenuTrigger>Stays</NavigationMenuTrigger>
              <NavigationMenuContent>
                <Panel className="w-[300px]">
                  {stays.map((s) => (
                    <Row key={s.title} {...s} />
                  ))}
                </Panel>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem value="about">
              <NavigationMenuTrigger>About</NavigationMenuTrigger>
              <NavigationMenuContent>
                <Panel className="w-[240px]">
                  {about.map((a) => (
                    <Row key={a.title} {...a} />
                  ))}
                </Panel>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#" current>
                Trips
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
          <NavigationMenuIndicator />
          <NavigationMenuViewport />
        </NavigationMenu>
        <a
          href="#"
          className="ms-auto inline-flex h-8 items-center rounded-[9px] bg-primary px-3 text-[13px] leading-none font-medium text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.25)] outline-none transition-[translate,scale] duration-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px active:scale-[0.985]"
        >
          Plan a trip
        </a>
      </header>
      <div className="flex flex-1 flex-col justify-end px-4 pb-6">
        <p className="text-[12px] font-medium text-muted-foreground">Autumn, slowly</p>
        <h2 className="mt-1.5 max-w-[420px] text-[28px] leading-[1.1] font-semibold tracking-tight">
          Twelve quiet places to spend October.
        </h2>
        <p className="mt-2.5 max-w-[400px] text-[14px] text-muted-foreground">
          Small hotels, long trains and one good meal a day, planned around the light.
        </p>
      </div>
    </div>
  )
}
