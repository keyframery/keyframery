import { CookingPot } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

export const meta = { name: "Empty", group: "Feedback" }

/* The demo plays itself: a search that finds nothing brings the empty state in, part after part;
   clearing it brings the recipes back. */
export const play = [
  { type: "saffron", into: '[data-play="search"]', wait: 2900 },
  { click: '[data-play="clear"]', wait: 1700 },
]

export const controls = {
  media: { type: "select", label: "Media", options: ["icon", "default"], default: "icon" },
  announce: { type: "switch", label: "Announce", default: true },
  themeFace: { type: "color", label: "Icon surface", default: "", group: "Colours" },
  themeInk: { type: "color", label: "Icon and links", default: "", group: "Colours" },
  themeMuted: { type: "color", label: "Description colour", default: "", group: "Colours" },
  themeRadius: { type: "slider", label: "Icon corners", min: 0, max: 24, step: 1, default: 13, unit: "px", group: "Layout" },
  themeFont: { type: "slider", label: "Title size", min: 12, max: 24, step: 1, default: 15, unit: "px", group: "Layout" },
  themeGap: { type: "slider", label: "Section gap", min: 8, max: 36, step: 1, default: 20, unit: "px", group: "Layout" },
  themePadding: { type: "slider", label: "Empty-state padding", min: 8, max: 48, step: 1, default: 24, unit: "px", group: "Layout" },
  themeMediaSize: { type: "slider", label: "Icon tile size", min: 28, max: 72, step: 1, default: 48, unit: "px", group: "Layout" },
} as const

const recipes = [
  { id: "buns", name: "Cardamom morning buns", meta: "1 hr 20 · makes 12", photo: "/demo/food-1.jpg", tags: "cardamom butter flour" },
  { id: "fool", name: "Raspberry fool", meta: "15 min · serves 4", photo: "/demo/food-2.jpg", tags: "raspberry cream sugar" },
  { id: "onions", name: "Quick-pickled red onions", meta: "10 min · one jar", photo: "/demo/food-3.jpg", tags: "onion vinegar peppercorn" },
]

function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true" className="size-4">
      <circle cx="7.25" cy="7.25" r="4.25" />
      <path d="m10.5 10.5 3 3" />
    </svg>
  )
}

export default function EmptyDemo({
  media = "icon",
  announce = true,
  themeFace = "",
  themeInk = "",
  themeMuted = "",
  themeRadius = 13,
  themeFont = 15,
  themeGap = 20,
  themePadding = 24,
  themeMediaSize = 48,
}: {
  media?: "icon" | "default"
  announce?: boolean
  themeFace?: string
  themeInk?: string
  themeMuted?: string
  themeRadius?: number
  themeFont?: number
  themeGap?: number
  themePadding?: number
  themeMediaSize?: number
}) {
  const [query, setQuery] = React.useState("")
  const q = query.trim().toLowerCase()
  const found = recipes.filter((r) => !q || `${r.name} ${r.tags}`.toLowerCase().includes(q))

  /* Leave defaults unset so each part keeps its own theme and size fallback. */
  const theme = {
    ...(themeFace ? { "--empty-face": themeFace } : null),
    ...(themeInk ? { "--empty-ink": themeInk } : null),
    ...(themeMuted ? { "--empty-muted": themeMuted } : null),
    ...(themeRadius !== 13 ? { "--empty-radius": `${themeRadius}px` } : null),
    ...(themeFont !== 15 ? { "--empty-font": `${themeFont}px` } : null),
    ...(themeGap !== 20 ? { "--empty-gap": `${themeGap}px` } : null),
    ...(themePadding !== 24 ? { "--empty-padding": `${themePadding}px` } : null),
    ...(themeMediaSize !== 48 ? { "--empty-media-size": `${themeMediaSize}px` } : null),
  } as React.CSSProperties

  return (
    <div style={theme} className="@container w-full max-w-[420px]">
      <div className="flex h-[400px] flex-col rounded-[18px] bg-background p-2 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-12px_rgb(0_0_0/0.14)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
        <div className="px-3 pt-3 pb-2 text-[15px] font-semibold tracking-tight">Saved recipes</div>
        <label className="mx-1 flex h-9 items-center gap-2 rounded-[10px] bg-background px-3 text-muted-foreground shadow-[0_0_0_1px_rgb(0_0_0/0.09),0_1px_2px_rgb(0_0_0/0.05)] transition-shadow duration-[calc(150ms*var(--kf-speed,1))] ease-house focus-within:shadow-[0_0_0_1px_var(--ring),0_0_0_4px_color-mix(in_oklch,var(--ring)_25%,transparent)] motion-reduce:transition-none dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1)]">
          <SearchIcon />
          <input
            data-play="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 48 recipes"
            aria-label="Search recipes"
            className="h-full min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>

        {found.length ? (
          <ul className="mt-2">
            {found.map((r) => (
              <li key={r.id} className="flex items-center gap-3 rounded-[12px] px-3 py-2.5">
                <img src={r.photo} alt="" className="size-11 shrink-0 rounded-[10px] object-cover" />
                <div className="min-w-0">
                  <div className="truncate text-[13px] leading-tight font-medium">{r.name}</div>
                  <div className="mt-1 text-[12px] leading-tight text-muted-foreground">{r.meta}</div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <Empty announce={announce} className="p-[var(--empty-padding,1.5rem)]">
            <EmptyHeader>
              {media === "icon" ? (
                <EmptyMedia variant="icon">
                  <CookingPot />
                </EmptyMedia>
              ) : (
                <EmptyMedia className="-space-x-3">
                  <img src="/demo/food-5.jpg" alt="" className="size-11 -rotate-6 rounded-[11px] object-cover ring-2 ring-background dark:ring-card" />
                  <img src="/demo/food-6.jpg" alt="" className="relative z-10 size-12 rounded-[12px] object-cover ring-2 ring-background dark:ring-card" />
                  <img src="/demo/food-4.jpg" alt="" className="size-11 rotate-6 rounded-[11px] object-cover ring-2 ring-background dark:ring-card" />
                </EmptyMedia>
              )}
              <EmptyTitle>No recipes with “{query.trim()}”</EmptyTitle>
              <EmptyDescription>None of your 48 saved recipes use it yet. Try the paella from Casa Rufino's book.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button size="sm" data-play="clear" onClick={() => setQuery("")}>
                Clear search
              </Button>
              <Button size="sm" variant="primary">
                Browse cookbooks
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </div>
    </div>
  )
}
