import { CircleCheck, CircleDashed, CircleX, Clock, Globe, Store, Truck } from "lucide-react"
import * as React from "react"

import { Filter, FilterBar, FilterBarReset, type FilterItem } from "@/components/ui/filter"

export const meta = { name: "Filter", group: "Forms" }

/* Open Status, pick two, open Channel, pick one, then reset the bar. */
export const play = [
  { click: '[data-slot="filter"][aria-label="Status"] [data-slot="combobox-trigger"]', wait: 900 },
  { click: '[data-slot="combobox-item"][data-value="paid"]', wait: 700 },
  { click: '[data-slot="combobox-item"][data-value="pending"]', wait: 900 },
  { click: '[data-slot="filter"][aria-label="Status"] [data-slot="combobox-trigger"]', wait: 900 },
  { click: '[data-slot="filter"][aria-label="Channel"] [data-slot="combobox-trigger"]', wait: 900 },
  { click: '[data-slot="combobox-item"][data-value="online"]', wait: 900 },
  { click: '[data-slot="filter"][aria-label="Channel"] [data-slot="combobox-trigger"]', wait: 1800 },
  { click: '[data-slot="filter-bar-reset"]', wait: 1400 },
]

export const controls = {
  label: { type: "text", label: "First filter", default: "Status" },
  multiple: { type: "switch", label: "Multiple selection", default: true },
  filters: { type: "slider", label: "Number of filters", min: 1, max: 3, step: 1, default: 3 },
  maxBadges: { type: "slider", label: "Badges before a count", min: 1, max: 4, step: 1, default: 2 },
  counts: { type: "switch", label: "Counts", default: true, group: "Options" },
  icons: { type: "switch", label: "Icons", default: true, group: "Options" },
  search: { type: "switch", label: "Search field", default: true, group: "Options" },
  reset: { type: "switch", label: "Reset button", default: true, group: "Options" },
  height: { type: "slider", label: "Chip height", min: 28, max: 40, step: 1, default: 32, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Corners", min: 0, max: 18, step: 1, default: 9, unit: "px", group: "Layout" },
  listWidth: { type: "slider", label: "List width", min: 200, max: 320, step: 4, default: 240, unit: "px", group: "Layout" },
  border: { type: "color", label: "Outline", default: "", group: "Colours" },
  accent: { type: "color", label: "Checked box", default: "", group: "Colours" },
  badge: { type: "color", label: "Badges", default: "", group: "Colours" },
  face: { type: "color", label: "Sheet", default: "", group: "Colours" },
} as const

type Order = { id: string; customer: string; total: string; status: string; channel: string; fulfilment: string }

const orders: Order[] = [
  { id: "#1048", customer: "Maya Okafor", total: "$184.00", status: "paid", channel: "online", fulfilment: "shipped" },
  { id: "#1047", customer: "Jonas Berg", total: "$62.50", status: "pending", channel: "pos", fulfilment: "unfulfilled" },
  { id: "#1046", customer: "Priya Nair", total: "$310.20", status: "paid", channel: "online", fulfilment: "unfulfilled" },
  { id: "#1045", customer: "Leo Martin", total: "$48.00", status: "refunded", channel: "online", fulfilment: "shipped" },
  { id: "#1044", customer: "Ana Ruiz", total: "$129.90", status: "paid", channel: "wholesale", fulfilment: "shipped" },
  { id: "#1043", customer: "Sam Carter", total: "$75.00", status: "failed", channel: "online", fulfilment: "unfulfilled" },
  { id: "#1042", customer: "Hana Sato", total: "$212.40", status: "pending", channel: "online", fulfilment: "unfulfilled" },
  { id: "#1041", customer: "Owen Price", total: "$96.10", status: "paid", channel: "pos", fulfilment: "shipped" },
  { id: "#1040", customer: "Ines Costa", total: "$58.00", status: "paid", channel: "online", fulfilment: "shipped" },
]

const icon = { size: 14, strokeWidth: 1.75 }

const facets = [
  {
    key: "status",
    label: "Status",
    options: [
      { value: "paid", label: "Paid", icon: <CircleCheck {...icon} /> },
      { value: "pending", label: "Pending", icon: <Clock {...icon} /> },
      { value: "refunded", label: "Refunded", icon: <CircleDashed {...icon} /> },
      { value: "failed", label: "Failed", icon: <CircleX {...icon} /> },
    ],
  },
  {
    key: "channel",
    label: "Channel",
    options: [
      { value: "online", label: "Online store", icon: <Globe {...icon} /> },
      { value: "pos", label: "In person", icon: <Store {...icon} /> },
      { value: "wholesale", label: "Wholesale", icon: <Truck {...icon} /> },
    ],
  },
  {
    key: "fulfilment",
    label: "Fulfilment",
    options: [
      { value: "unfulfilled", label: "Unfulfilled" },
      { value: "shipped", label: "Shipped" },
    ],
  },
] as const

type Key = (typeof facets)[number]["key"]

const statusLabel: Record<string, string> = { paid: "Paid", pending: "Pending", refunded: "Refunded", failed: "Failed" }

export default function FilterDemo({
  label = "Status",
  multiple = true,
  filters = 3,
  maxBadges = 2,
  counts = true,
  icons = true,
  search = true,
  reset = true,
  height = 32,
  radius = 9,
  listWidth = 240,
  border = "",
  accent = "",
  badge = "",
  face = "",
}: {
  label?: string
  multiple?: boolean
  filters?: number
  maxBadges?: number
  counts?: boolean
  icons?: boolean
  search?: boolean
  reset?: boolean
  height?: number
  radius?: number
  listWidth?: number
  border?: string
  accent?: string
  badge?: string
  face?: string
}) {
  const [chosen, setChosen] = React.useState<Record<Key, string[]>>({ status: [], channel: [], fulfilment: [] })

  const matches = (order: Order, except?: Key) =>
    (Object.keys(chosen) as Key[]).every((key) => key === except || !chosen[key].length || chosen[key].includes(order[key]))
  const rows = orders.filter((order) => matches(order))

  const style = {
    "--filter-height": `${height}px`,
    "--filter-radius": `${radius}px`,
    "--filter-list-width": `${listWidth}px`,
    ...(border ? { "--filter-border": border } : null),
    ...(accent ? { "--filter-accent": accent } : null),
    ...(badge ? { "--filter-badge": badge } : null),
    ...(face ? { "--filter-face": face } : null),
  } as React.CSSProperties

  return (
    <div
      style={style}
      className="@container w-full max-w-[600px] overflow-hidden rounded-[16px] bg-background shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]"
    >
      <div className="flex items-baseline justify-between px-4 pt-4 pb-3">
        <div className="text-[15px] font-semibold tracking-tight">Orders</div>
        <div className="text-[12px] text-muted-foreground tabular-nums">
          {rows.length} of {orders.length}
        </div>
      </div>
      <div className="px-4 pb-3">
        <FilterBar>
          {facets.slice(0, filters).map((facet, index) => {
            const options: FilterItem[] = facet.options.map((option) => ({
              value: option.value,
              label: option.label,
              icon: icons && "icon" in option ? option.icon : undefined,
              count: counts ? orders.filter((order) => matches(order, facet.key) && order[facet.key] === option.value).length : undefined,
            }))
            return (
              <Filter
                key={facet.key}
                label={index === 0 ? label : facet.label}
                options={options}
                multiple={index === 0 ? multiple : facet.key !== "fulfilment"}
                maxBadges={maxBadges}
                hideSearch={!search}
                value={chosen[facet.key]}
                onValueChange={(value) => setChosen((now) => ({ ...now, [facet.key]: value }))}
              />
            )
          })}
          {reset && <FilterBarReset />}
        </FilterBar>
      </div>
      <ul className="border-t border-border">
        {rows.slice(0, 5).map((order) => (
          <li key={order.id} className="grid grid-cols-[3.25rem_1fr_auto] items-center @md:grid-cols-[3.5rem_1fr_auto_5rem] gap-3 border-b border-border/70 px-4 py-2.5 text-[13px] last:border-b-0">
            <span className="font-mono text-[12px] text-muted-foreground">{order.id}</span>
            <span className="truncate font-medium">{order.customer}</span>
            <span className="hidden text-[12px] text-muted-foreground @md:block">{statusLabel[order.status]}</span>
            <span className="text-right tabular-nums">{order.total}</span>
          </li>
        ))}
        {rows.length === 0 && <li className="px-4 py-8 text-center text-[13px] text-muted-foreground">No orders match these filters.</li>}
      </ul>
    </div>
  )
}
