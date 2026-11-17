import { ChevronRight, Coffee, Grape, Leaf, Cherry, Sprout } from "lucide-react"
import * as React from "react"

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item"

export const meta = { name: "Item", group: "Display" }

/* The highlight glides down the box under the pointer, one row is opened, then the add-ons tab
   brings a new list in, row by row, and the box comes back the same way. */
export const play = [
  { hover: '[data-row="raspberries"]', wait: 700 },
  { unhover: '[data-row="raspberries"]', hover: '[data-row="grapes"]', wait: 650 },
  { unhover: '[data-row="grapes"]', hover: '[data-row="garlic"]', wait: 650 },
  { unhover: '[data-row="garlic"]', hover: '[data-row="tea"]', wait: 900 },
  { unhover: '[data-row="tea"]', hover: '[data-row="grapes"]', wait: 1000 },
  { unhover: '[data-row="grapes"]', click: '[data-tab="addons"]', wait: 1500 },
  { hover: '[data-row="beans"]', wait: 1100 },
  { unhover: '[data-row="beans"]', click: '[data-tab="box"]', wait: 1600 },
]

export const controls = {
  variant: { type: "select", label: "Variant", options: ["default", "outline", "muted"], default: "default" },
  size: { type: "select", label: "Size", options: ["default", "sm"], default: "default" },
  media: { type: "select", label: "Media", options: ["image", "icon"], default: "image" },
  themeFace: { type: "color", label: "Muted row surface", default: "", group: "Colours" },
  themeInk: { type: "color", label: "Row text", default: "", group: "Colours" },
  themeMuted: { type: "color", label: "Row details", default: "", group: "Colours" },
  themeRadius: { type: "slider", label: "Row corners", min: 0, max: 24, step: 1, default: 12, unit: "px", group: "Layout" },
  themeFont: { type: "slider", label: "Title size", min: 10, max: 20, step: 0.5, default: 13.5, unit: "px", group: "Layout" },
  themeGap: { type: "slider", label: "Row gap", min: 4, max: 24, step: 1, default: 14, unit: "px", group: "Layout" },
  themePadding: { type: "slider", label: "Row padding", min: 4, max: 24, step: 1, default: 14, unit: "px", group: "Layout" },
} as const

type Row = { id: string; title: string; note: string; price: string; photo: string; icon: React.ComponentType }

const box: Row[] = [
  { id: "raspberries", title: "Raspberries", note: "Wye Valley, 250 g punnet", price: "£3.40", photo: "/demo/food-2.jpg", icon: Cherry },
  { id: "grapes", title: "Red grapes", note: "Last of the season, 500 g", price: "£2.90", photo: "/demo/food-4.jpg", icon: Grape },
  { id: "garlic", title: "Smoked garlic", note: "Two bulbs, with Tellicherry pepper", price: "£4.10", photo: "/demo/food-3.jpg", icon: Sprout },
  { id: "tea", title: "Assam, second flush", note: "Loose leaf, 100 g tin", price: "£6.50", photo: "/demo/food-5.jpg", icon: Leaf },
]

const addons: Row[] = [
  { id: "beans", title: "House espresso", note: "Whole beans, roasted Monday", price: "£7.80", photo: "/demo/food-1.jpg", icon: Coffee },
  { id: "extra", title: "Second punnet", note: "Raspberries, picked Wednesday", price: "£3.40", photo: "/demo/food-6.jpg", icon: Cherry },
]

const tabs = [
  { id: "box", label: "In the box" },
  { id: "addons", label: "Add-ons" },
] as const

export default function ItemDemo({
  variant = "default",
  size = "default",
  media = "image",
  themeFace = "",
  themeInk = "",
  themeMuted = "",
  themeRadius = 12,
  themeFont = 13.5,
  themeGap = 14,
  themePadding = 14,
}: {
  variant?: "default" | "outline" | "muted"
  size?: "default" | "sm"
  media?: "image" | "icon"
  themeFace?: string
  themeInk?: string
  themeMuted?: string
  themeRadius?: number
  themeFont?: number
  themeGap?: number
  themePadding?: number
}) {
  const [tab, setTab] = React.useState<"box" | "addons">("box")
  const rows = tab === "box" ? box : addons
  const spaced = variant !== "default"

  /* Leave defaults unset so each part keeps its own theme and size fallback. */
  const theme = {
    ...(themeFace ? { "--item-face": themeFace } : null),
    ...(themeInk ? { "--item-ink": themeInk } : null),
    ...(themeMuted ? { "--item-muted": themeMuted } : null),
    ...(themeRadius !== 12 ? { "--item-radius": `${themeRadius}px` } : null),
    ...(themeFont !== 13.5 ? { "--item-font": `${themeFont}px` } : null),
    ...(themeGap !== 14 ? { "--item-gap": `${themeGap}px` } : null),
    ...(themePadding !== 14 ? { "--item-padding": `${themePadding}px` } : null),
  } as React.CSSProperties

  return (
    <div style={theme} className="@container w-full max-w-[420px]">
      <div className="rounded-[18px] bg-background p-2 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-12px_rgb(0_0_0/0.14)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
        <div className="flex items-end justify-between gap-3 px-3.5 pt-3 pb-2.5 @max-[26rem]:flex-col @max-[26rem]:items-start">
          <div className="min-w-0">
            <div className="text-[15px] font-semibold tracking-tight">Thursday's market box</div>
            <div className="mt-1 text-[12px] text-muted-foreground">Delivered 21 Nov, 7 to 9am</div>
          </div>
          <div className="flex shrink-0 gap-0.5 rounded-[10px] bg-muted p-0.5 shadow-[inset_0_1px_2px_rgb(0_0_0/0.07)] dark:shadow-[inset_0_1px_2px_rgb(0_0_0/0.5)]">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                data-tab={t.id}
                aria-pressed={tab === t.id}
                onClick={() => setTab(t.id)}
                className="h-7 cursor-pointer rounded-[8px] px-2.5 text-[12px] font-medium text-muted-foreground outline-none transition-[color,background-color,box-shadow] duration-[calc(150ms*var(--kf-speed,1))] ease-house hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.08)] dark:aria-pressed:bg-accent motion-reduce:transition-none @max-[22rem]:px-2"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <ItemGroup key={tab} aria-label={tab === "box" ? "In the box" : "Add-ons"} className={spaced ? "gap-1.5" : undefined}>
          {rows.map((row, i) => {
            const Icon = row.icon
            return (
              <React.Fragment key={row.id}>
                {i > 0 && !spaced && <ItemSeparator />}
                <Item data-row={row.id} variant={variant} size={size} render={<button type="button" />}>
                  <ItemMedia variant={media}>
                    {media === "image" ? <img src={row.photo} alt="" /> : <Icon />}
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{row.title}</ItemTitle>
                    <ItemDescription className="@max-[22rem]:line-clamp-1">{row.note}</ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <span className="text-[13px] font-medium tabular-nums">{row.price}</span>
                    <ChevronRight className="@max-[22rem]:hidden" />
                  </ItemActions>
                </Item>
              </React.Fragment>
            )
          })}
        </ItemGroup>
      </div>
    </div>
  )
}
