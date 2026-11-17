import { ChevronRight, FileText, Folder, HardDrive } from "lucide-react"
import * as React from "react"

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Menu, MenuContent, MenuItem, MenuItemIcon, MenuTrigger } from "@/components/ui/menu"

export const meta = { name: "Breadcrumb", group: "Navigation" }

/* The demo plays itself: it opens a folder (a crumb slides in from the right), lists the folders the
   ellipsis stands for, then climbs back up a level. */
export const play = [
  { wait: 900 },
  { click: '[data-folder="shoot"]', wait: 1500 },
  { click: '[aria-label^="Show"]', wait: 1500 },
  { key: "Escape", wait: 900 },
  { click: '[data-crumb="photo"]', wait: 1500 },
  { click: '[data-crumb="refresh"]', wait: 1500 },
  { click: '[data-folder="photo"]', wait: 1500 },
]

export const controls = {
  separator: { type: "select", label: "Separator", options: ["chevron", "slash"], default: "chevron" },
  collapse: { type: "switch", label: "Collapse middle", default: true },
  themeInk: { type: "color", label: "Link colour", default: "", group: "Colours" },
  themeCurrent: { type: "color", label: "Current page", default: "", group: "Colours" },
  themeSeparator: { type: "color", label: "Separator colour", default: "", group: "Colours" },
  themeFont: { type: "slider", label: "Label size", min: 10, max: 20, step: 1, default: 13, unit: "px", group: "Layout" },
  themeGap: { type: "slider", label: "Trail gap", min: 0, max: 16, step: 1, default: 4, unit: "px", group: "Layout" },
  themeItemGap: { type: "slider", label: "Icon gap", min: 0, max: 16, step: 1, default: 6, unit: "px", group: "Layout" },
  themeIconSize: { type: "slider", label: "Icon size", min: 10, max: 24, step: 1, default: 14, unit: "px", group: "Layout" },
  themeRadius: { type: "slider", label: "Link corners", min: 0, max: 12, step: 1, default: 4, unit: "px", group: "Layout" },
} as const

type Node = { id: string; label: string; files: { name: string; meta: string; photo?: string }[] }

const tree: Node[] = [
  { id: "drive", label: "Studio Nord", files: [{ name: "Studio handbook.pdf", meta: "2.1 MB" }] },
  { id: "clients", label: "Clients", files: [{ name: "Rate card 2026.pdf", meta: "340 KB" }] },
  { id: "tram", label: "Lisbon Tram Co.", files: [{ name: "Signed contract.pdf", meta: "1.2 MB" }] },
  { id: "refresh", label: "2026 brand refresh", files: [{ name: "Moodboard.pdf", meta: "18 MB" }] },
  {
    id: "photo",
    label: "Photography",
    files: [
      { name: "Shot list.pdf", meta: "96 KB" },
      { name: "Location scout.jpg", meta: "4.8 MB", photo: "/demo/canal.jpg" },
    ],
  },
  {
    id: "shoot",
    label: "Alfama shoot",
    files: [
      { name: "Tram 28 at dawn.jpg", meta: "12 MB", photo: "/demo/coast-2.jpg" },
      { name: "Rooftop, first light.jpg", meta: "11 MB", photo: "/demo/coast-4.jpg" },
    ],
  },
]

function preventNav(e: React.MouseEvent) {
  e.preventDefault()
}

export default function BreadcrumbDemo({
  separator = "chevron",
  collapse = true,
  themeInk = "",
  themeCurrent = "",
  themeSeparator = "",
  themeFont = 13,
  themeGap = 4,
  themeItemGap = 6,
  themeIconSize = 14,
  themeRadius = 4,
}: {
  separator?: "chevron" | "slash"
  collapse?: boolean
  themeInk?: string
  themeCurrent?: string
  themeSeparator?: string
  themeFont?: number
  themeGap?: number
  themeItemGap?: number
  themeIconSize?: number
  themeRadius?: number
}) {
  const [depth, setDepth] = React.useState(4)
  const trail = tree.slice(0, depth + 1)
  const here = trail[trail.length - 1]
  const next = tree[depth + 1]

  /* Long trails keep the first crumb and the last two; the rest go in the ellipsis's menu. */
  const hidden = collapse && trail.length > 3 ? trail.slice(1, -2) : []
  const shown = hidden.length ? [trail[0], ...trail.slice(-2)] : trail

  const sep = (key: string) => (
    <BreadcrumbSeparator key={`sep-${key}`}>
      {separator === "slash" ? <span className="px-0.5 text-[13px] leading-none">/</span> : undefined}
    </BreadcrumbSeparator>
  )

  /* Leave defaults unset so each part keeps its own theme and size fallback. */
  const theme = {
    ...(themeInk ? { "--breadcrumb-ink": themeInk } : null),
    ...(themeCurrent ? { "--breadcrumb-current": themeCurrent } : null),
    ...(themeSeparator ? { "--breadcrumb-separator": themeSeparator } : null),
    ...(themeFont !== 13 ? { "--breadcrumb-font": `${themeFont}px` } : null),
    ...(themeGap !== 4 ? { "--breadcrumb-gap": `${themeGap}px` } : null),
    ...(themeItemGap !== 6 ? { "--breadcrumb-item-gap": `${themeItemGap}px` } : null),
    ...(themeIconSize !== 14 ? { "--breadcrumb-icon-size": `${themeIconSize}px` } : null),
    ...(themeRadius !== 4 ? { "--breadcrumb-radius": `${themeRadius}px` } : null),
  } as React.CSSProperties

  return (
    <div style={theme} className="@container w-full max-w-[560px] rounded-[18px] bg-background shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
      <div className="flex min-h-14 items-center border-b border-border px-5 py-3">
        <Breadcrumb aria-label="Folder path">
          <BreadcrumbList>
            {shown.flatMap((node, index) => {
              /* The ellipsis keeps its own key, so it stays put while the crumbs around it change. */
              const more =
                index === 1 && hidden.length ? (
                  <React.Fragment key="more">
                      {sep("more")}
                      <BreadcrumbItem>
                        <Menu>
                          <MenuTrigger
                            render={
                              <button
                                type="button"
                                aria-label={`Show ${hidden.length} more folders`}
                                className="cursor-pointer rounded-[7px] text-muted-foreground outline-none transition-[background-color,color] duration-[calc(150ms*var(--kf-speed,1))] ease-house hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-open:bg-accent data-open:text-foreground motion-reduce:transition-none"
                              />
                            }
                          >
                            <BreadcrumbEllipsis />
                          </MenuTrigger>
                          <MenuContent align="start" className="w-52">
                            {hidden.map((h) => (
                              <MenuItem key={h.id} value={h.id} onSelect={() => setDepth(tree.indexOf(h))}>
                                <MenuItemIcon>
                                  <Folder />
                                </MenuItemIcon>
                                {h.label}
                              </MenuItem>
                            ))}
                          </MenuContent>
                        </Menu>
                      </BreadcrumbItem>
                    </React.Fragment>
                ) : null
              const last = node === here
              return [
                more,
                <React.Fragment key={node.id}>
                  {index > 0 ? sep(node.id) : null}
                  <BreadcrumbItem>
                    {last ? (
                      <BreadcrumbPage>
                        {index === 0 ? <HardDrive /> : null}
                        {node.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        href={`/drive/${node.id}`}
                        data-crumb={node.id}
                        onClick={(e) => {
                          preventNav(e)
                          setDepth(tree.indexOf(node))
                        }}
                      >
                        {index === 0 ? <HardDrive /> : null}
                        <span className={index === 0 ? "@max-[26rem]:sr-only" : "max-w-[9rem] truncate @max-[26rem]:max-w-[7rem]"}>{node.label}</span>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>,
              ]
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <ul className="flex flex-col p-2">
        {next ? (
          <li>
            <button
              type="button"
              data-folder={next.id}
              onClick={() => setDepth(depth + 1)}
              className="flex h-12 w-full cursor-pointer items-center gap-3 rounded-[10px] px-3 text-left outline-none transition-[background-color] duration-[calc(150ms*var(--kf-speed,1))] ease-house hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
            >
              <span className="grid size-8 place-items-center rounded-[8px] bg-muted text-muted-foreground [&_svg]:size-4">
                <Folder />
              </span>
              <span className="flex-1 truncate text-[13px] font-medium">{next.label}</span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          </li>
        ) : null}
        {here.files.map((f) => (
          <li key={f.name} className="flex h-12 items-center gap-3 px-3">
            {f.photo ? (
              <img src={f.photo} alt="" className="size-8 shrink-0 rounded-[8px] bg-muted object-cover" />
            ) : (
              <span className="grid size-8 shrink-0 place-items-center rounded-[8px] bg-muted text-muted-foreground [&_svg]:size-4">
                <FileText />
              </span>
            )}
            <span className="flex-1 truncate text-[13px]">{f.name}</span>
            <span className="text-[12px] text-muted-foreground tabular-nums">{f.meta}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
