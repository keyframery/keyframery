import { CircleCheck, CircleDashed, Download, Package, Truck, XCircle } from "lucide-react"
import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { DataTable, DataTableBulkAction, type DataTableColumnDef } from "@/components/ui/data-table"
import { MenuItem, MenuSeparator } from "@/components/ui/menu"

export const meta = { name: "Data table", group: "Data" }

/* The demo plays itself: search for a customer, filter by payment, sort by total, select three
   orders so the bulk bar rises, clear them, turn the page, and go back to the newest first. */
export const play = [
  { type: "Ma", into: "[data-data-table-search]", wait: 500 },
  { type: "Mar", into: "[data-data-table-search]", wait: 1500 },
  { click: "[aria-label='Clear search']", wait: 900 },
  { click: '[data-filter="payment"] [data-slot="combobox-trigger"]', wait: 900 },
  { click: '[data-slot="combobox-item"][data-value="Paid"]', wait: 1000 },
  { click: '[data-filter="payment"] [data-slot="combobox-trigger"]', wait: 900 },
  { click: "[data-data-table-sort='total']", wait: 800 },
  { click: "[data-slot='menu-item'][data-value='desc']", wait: 1500 },
  { click: "tbody tr:nth-child(1) [data-data-table-select]", wait: 400 },
  { click: "tbody tr:nth-child(2) [data-data-table-select]", wait: 400 },
  { click: "tbody tr:nth-child(4) [data-data-table-select]", wait: 1800 },
  { click: "[data-data-table-bulk-clear]", wait: 1000 },
  { click: "[data-data-table-next]", wait: 1700 },
  { click: "[data-data-table-reset]", wait: 1200 },
  { click: "[data-data-table-sort='date']", wait: 800 },
  { click: "[data-slot='menu-item'][data-value='desc']", wait: 1800 },
]

/* What the Customize panel under the preview offers. The demo takes the same names as props. */
export const controls = {
  title: { type: "text", label: "Title", default: "Orders" },
  searchPlaceholder: { type: "text", label: "Search placeholder", default: "Search orders or customers" },
  pageSize: { type: "select", label: "Page size", options: ["5", "8", "10", "20"], default: "8" },
  selectable: { type: "switch", label: "Selectable rows", default: true, group: "Behaviour" },
  rowMenu: { type: "switch", label: "Row menu", default: true, group: "Behaviour" },
  loading: { type: "switch", label: "Loading", default: false, group: "Behaviour" },
  hidden: { type: "select", label: "Hidden column", options: ["none", "date", "items", "fulfilment"], default: "none", group: "Behaviour" },
  sticky: { type: "switch", label: "Sticky order column", default: true, group: "Behaviour" },
  width: { type: "slider", label: "Width", min: 560, max: 1000, step: 1, default: 940, unit: "px", group: "Layout" },
  rowHeight: { type: "slider", label: "Row height", min: 36, max: 56, step: 1, default: 44, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Corners", min: 0, max: 24, step: 1, default: 14, unit: "px", group: "Layout" },
  surface: { type: "color", label: "Surface", default: "", group: "Colours" },
  border: { type: "color", label: "Border", default: "", group: "Colours" },
  accent: { type: "color", label: "Row tint", default: "", group: "Colours" },
  bar: { type: "color", label: "Bulk bar", default: "", group: "Colours" },
} as const

/* ---------------------------------------------------------------- the orders */

type Payment = "Paid" | "Pending" | "Refunded" | "Failed"
type Fulfilment = "Unfulfilled" | "Packed" | "Shipped" | "Delivered"
type Order = { id: string; number: number; customer: string; date: string; payment: Payment; fulfilment: Fulfilment; items: number; total: number }

/* A small seeded generator, run once when the file loads: the same 120 orders every time. */
function seeded(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const firstNames = ["Maya", "Tom", "Ines", "Sam", "Lena", "Joe", "Aiko", "Ravi", "Clara", "Ola", "Ben", "Nia", "Marco", "Priya", "Hugo", "Elif", "Mariam", "Theo", "Zara", "Luca", "Noor", "Felix", "Marta", "Kofi"]
const lastNames = ["Chen", "Okafor", "Duarte", "Price", "Brandt", "Walsh", "Mori", "Shah", "Ruiz", "Nord", "Carter", "Evans", "Rossi", "Iyer", "Laurent", "Demir", "Haddad", "Becker", "Ali", "Moretti", "Khan", "Novak", "Silva", "Mensah"]

function makeOrders(): Order[] {
  const random = seeded(1042)
  const pick = <T,>(list: readonly T[]) => list[Math.floor(random() * list.length)]
  const today = Date.UTC(2026, 10, 19)
  let day = 0
  return Array.from({ length: 120 }, (_, i) => {
    day += random() < 0.55 ? 0 : 1
    const age = day
    /* Newer orders are less far along. */
    const fulfilment: Fulfilment = age < 2 ? pick(["Unfulfilled", "Unfulfilled", "Packed"] as const) : age < 6 ? pick(["Packed", "Shipped", "Shipped", "Unfulfilled"] as const) : pick(["Shipped", "Delivered", "Delivered", "Delivered"] as const)
    const roll = random()
    const payment: Payment = roll < 0.72 ? "Paid" : roll < 0.86 ? "Pending" : roll < 0.95 ? "Refunded" : "Failed"
    const items = 1 + Math.floor(random() * random() * 6)
    const total = Math.round((items * (14 + random() * 86) + (random() < 0.3 ? 4.9 : 0)) * 100) / 100
    const number = 1160 - i
    return {
      id: String(number),
      number,
      customer: `${pick(firstNames)} ${pick(lastNames)}`,
      date: new Date(today - age * 86400000).toISOString().slice(0, 10),
      payment,
      fulfilment,
      items,
      total,
    }
  })
}

const seedOrders = makeOrders()

const euro = new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR" })
const dayFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" })

const paymentBadge: Record<Payment, "success" | "outline" | "secondary" | "destructive"> = { Paid: "success", Pending: "outline", Refunded: "secondary", Failed: "destructive" }
const fulfilmentIcon: Record<Fulfilment, React.ReactNode> = {
  Unfulfilled: <CircleDashed size={16} strokeWidth={1.75} aria-hidden />,
  Packed: <Package size={16} strokeWidth={1.75} aria-hidden />,
  Shipped: <Truck size={16} strokeWidth={1.75} aria-hidden />,
  Delivered: <CircleCheck size={16} strokeWidth={1.75} aria-hidden />,
}

function columnsFor(sticky: boolean): DataTableColumnDef<Order>[] {
  return [
    { id: "number", header: "Order", accessor: (o) => `#${o.number}`, sortValue: (o) => o.number, searchable: true, hideable: false, sticky, cell: (o) => <span className="font-medium">#{o.number}</span> },
    { id: "customer", header: "Customer", searchable: true, cell: (o) => <span className="font-medium">{o.customer}</span> },
    { id: "date", header: "Date", hideBelow: "md", cell: (o) => <span className="text-muted-foreground">{dayFormat.format(new Date(o.date))}</span> },
    {
      id: "payment",
      header: "Payment",
      filter: { options: (["Paid", "Pending", "Refunded", "Failed"] as const).map((value) => ({ value })) },
      cell: (o) => <Badge variant={paymentBadge[o.payment]}>{o.payment}</Badge>,
    },
    {
      id: "fulfilment",
      header: "Fulfilment",
      hideBelow: "sm",
      filter: { options: (["Unfulfilled", "Packed", "Shipped", "Delivered"] as const).map((value) => ({ value, icon: fulfilmentIcon[value] })) },
      sortValue: (o) => ["Unfulfilled", "Packed", "Shipped", "Delivered"].indexOf(o.fulfilment),
      cell: (o) => (
        <span className="flex items-center gap-1.5 text-muted-foreground [&_svg]:shrink-0">
          {fulfilmentIcon[o.fulfilment]}
          <span className="text-foreground">{o.fulfilment}</span>
        </span>
      ),
    },
    { id: "items", header: "Items", align: "end", hideBelow: "lg" },
    { id: "total", header: "Total", align: "end", cell: (o) => <span className="font-medium">{euro.format(o.total)}</span> },
  ]
}

export default function DataTableDemo({
  title = "Orders",
  searchPlaceholder = "Search orders or customers",
  pageSize = "8",
  selectable = true,
  rowMenu = true,
  loading = false,
  hidden = "none",
  sticky = true,
  width = 940,
  rowHeight = 44,
  radius = 14,
  surface = "",
  border = "",
  accent = "",
  bar = "",
}: {
  title?: string
  searchPlaceholder?: string
  pageSize?: "5" | "8" | "10" | "20"
  selectable?: boolean
  rowMenu?: boolean
  loading?: boolean
  hidden?: "none" | "date" | "items" | "fulfilment"
  sticky?: boolean
  width?: number
  rowHeight?: number
  radius?: number
  surface?: string
  border?: string
  accent?: string
  bar?: string
}) {
  const [orders, setOrders] = React.useState(seedOrders)
  const [selected, setSelected] = React.useState<string[]>([])
  const columns = React.useMemo(() => columnsFor(sticky), [sticky])

  const update = (ids: string[], change: (o: Order) => Order | null) =>
    setOrders((now) => now.flatMap((o) => (ids.includes(o.id) ? (change(o) ?? []) : [o])))

  const theme = {
    maxWidth: width,
    "--data-table-row-height": `${rowHeight}px`,
    "--data-table-radius": `${radius}px`,
    ...(surface ? { "--data-table-surface": surface } : null),
    ...(border ? { "--data-table-border": border } : null),
    ...(accent ? { "--data-table-accent": accent } : null),
    ...(bar ? { "--data-table-bar": bar } : null),
  } as React.CSSProperties

  return (
    <div style={theme} className="flex w-full flex-col gap-4 self-start">
      <div>
        <div className="text-[15px] font-semibold tracking-tight">{title}</div>
        <div className="mt-1 text-[12px] text-muted-foreground tabular-nums">{orders.length} orders in the last 8 weeks</div>
      </div>
      <DataTable<Order>
        key={`${pageSize}-${hidden}`}
        label={title}
        data={orders}
        columns={columns}
        loading={loading}
        selectable={selectable}
        defaultSort={{ id: "date", direction: "descending" }}
        defaultPageSize={Number(pageSize)}
        pageSizes={[5, 8, 10, 20, 50]}
        defaultHiddenColumns={hidden === "none" ? [] : [hidden]}
        selected={selected}
        onSelectedChange={(next) => setSelected(next)}
        searchPlaceholder={searchPlaceholder}
        rowActions={
          rowMenu
            ? (o) => (
                <>
                  <MenuItem value="view">View order</MenuItem>
                  <MenuItem value="ship" disabled={o.fulfilment === "Shipped" || o.fulfilment === "Delivered"} onSelect={() => update([o.id], (x) => ({ ...x, fulfilment: "Shipped" }))}>
                    Mark as shipped
                  </MenuItem>
                  <MenuItem value="refund" disabled={o.payment !== "Paid"} onSelect={() => update([o.id], (x) => ({ ...x, payment: "Refunded" }))}>
                    Refund
                  </MenuItem>
                  <MenuSeparator />
                  <MenuItem value="cancel" destructive onSelect={() => update([o.id], () => null)}>
                    Cancel order
                  </MenuItem>
                </>
              )
            : undefined
        }
        bulkActions={(ids) => (
          <>
            <DataTableBulkAction
              data-bulk="ship"
              icon={<Truck size={16} strokeWidth={1.75} aria-hidden />}
              label="Mark as shipped"
              onClick={() => update(ids, (x) => (x.fulfilment === "Delivered" ? x : { ...x, fulfilment: "Shipped" }))}
            />
            <DataTableBulkAction data-bulk="export" icon={<Download size={16} strokeWidth={1.75} aria-hidden />} label="Export" />
            <DataTableBulkAction
              tone="destructive"
              data-bulk="cancel"
              icon={<XCircle size={16} strokeWidth={1.75} aria-hidden />}
              label="Cancel"
              onClick={() => {
                update(ids, () => null)
                setSelected([])
              }}
            />
          </>
        )}
      />
    </div>
  )
}
