import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Pagination, PaginationList } from "@/components/ui/pagination"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export const meta = { name: "Table", group: "Data" }

/* The demo plays itself: sort by total, flip it, select two orders, then turn the page so the
   next rows cascade in. */
export const play = [
  { hover: "[data-play=sort-total]", wait: 700 },
  { click: "[data-play=sort-total] button", wait: 1300 },
  { click: "[data-play=sort-total] button", wait: 1300 },
  { unhover: "[data-play=sort-total]", click: "[data-row='1042'] [role=checkbox]", wait: 700 },
  { click: "[data-row='1039'] [role=checkbox]", wait: 1200 },
  { click: "[data-slot=pagination-next]", wait: 1800 },
  { click: "[data-slot=pagination-previous]", wait: 1400 },
  { click: "[data-play=sort-date] button", wait: 1600 },
]

type Status = "Paid" | "Pending" | "Refunded"
type Order = { id: string; customer: string; city: string; date: string; status: Status; total: number }

const orders: Order[] = [
  { id: "1042", customer: "Maya Chen", city: "Lisbon", date: "2026-11-14", status: "Paid", total: 184 },
  { id: "1041", customer: "Tom Okafor", city: "Leeds", date: "2026-11-14", status: "Pending", total: 62.5 },
  { id: "1040", customer: "Ines Duarte", city: "Porto", date: "2026-11-13", status: "Paid", total: 318 },
  { id: "1039", customer: "Sam Price", city: "Bristol", date: "2026-11-12", status: "Refunded", total: 45 },
  { id: "1038", customer: "Lena Brandt", city: "Berlin", date: "2026-11-12", status: "Paid", total: 129.9 },
  { id: "1037", customer: "Joe Walsh", city: "Dublin", date: "2026-11-11", status: "Paid", total: 76 },
  { id: "1036", customer: "Aiko Mori", city: "Kyoto", date: "2026-11-10", status: "Pending", total: 240 },
  { id: "1035", customer: "Ravi Shah", city: "Leicester", date: "2026-11-09", status: "Paid", total: 58.4 },
  { id: "1034", customer: "Clara Ruiz", city: "Seville", date: "2026-11-09", status: "Paid", total: 412 },
  { id: "1033", customer: "Ola Nord", city: "Oslo", date: "2026-11-08", status: "Refunded", total: 99 },
  { id: "1032", customer: "Ben Carter", city: "York", date: "2026-11-07", status: "Paid", total: 33.2 },
  { id: "1031", customer: "Nia Evans", city: "Cardiff", date: "2026-11-06", status: "Paid", total: 151 },
]

const pageSize = 6
const euro = (n: number) => n.toLocaleString("en-GB", { style: "currency", currency: "EUR" })
const day = (iso: string) => new Date(iso + "T12:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })
const badge: Record<Status, React.ComponentProps<typeof Badge>["variant"]> = { Paid: "success", Pending: "outline", Refunded: "secondary" }

type SortKey = "date" | "total"

export default function TableDemo() {
  const [sort, setSort] = React.useState<{ key: SortKey; dir: "ascending" | "descending" }>({ key: "date", dir: "descending" })
  const [page, setPage] = React.useState(1)
  const [selected, setSelected] = React.useState<string[]>([])

  const sorted = React.useMemo(() => {
    const by = (o: Order) => (sort.key === "total" ? o.total : Date.parse(o.date) + Number(o.id))
    return [...orders].sort((a, b) => (sort.dir === "ascending" ? by(a) - by(b) : by(b) - by(a)))
  }, [sort])
  const rows = sorted.slice((page - 1) * pageSize, page * pageSize)
  const allOnPage = rows.every((r) => selected.includes(r.id))
  const someOnPage = rows.some((r) => selected.includes(r.id))

  const toggleSort = (key: SortKey) =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === "descending" ? "ascending" : "descending" }))
  const toggleRow = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  const togglePage = () =>
    setSelected((s) => (allOnPage ? s.filter((id) => !rows.some((r) => r.id === id)) : [...new Set([...s, ...rows.map((r) => r.id)])]))

  return (
    <div className="@container flex w-full max-w-[620px] flex-col gap-3">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight">Orders</h3>
          <p className="mt-1 text-[12px] text-muted-foreground tabular-nums">
            {selected.length ? `${selected.length} selected` : `${orders.length} this week`}
          </p>
        </div>
      </div>
      <div className="overflow-hidden rounded-[14px] bg-card shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_1px_2px_rgb(0_0_0/0.04)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]">
        <Table aria-label="Orders">
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">
                <Checkbox
                  aria-label="Select every order on this page"
                  checked={allOnPage ? true : someOnPage ? "indeterminate" : false}
                  onCheckedChange={togglePage}
                />
              </TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead
                data-play="sort-date"
                className="@max-[30rem]:hidden"
                sort={sort.key === "date" ? sort.dir : "none"}
                onSort={() => toggleSort("date")}
              >
                Date
              </TableHead>
              <TableHead className="@max-[24rem]:hidden">Status</TableHead>
              <TableHead
                data-play="sort-total"
                className="pr-3 text-right [&_button]:ml-auto"
                sort={sort.key === "total" ? sort.dir : "none"}
                onSort={() => toggleSort("total")}
              >
                Total
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((o) => (
              <TableRow key={o.id} data-row={o.id} selected={selected.includes(o.id)}>
                <TableCell className="pl-4">
                  <Checkbox aria-label={`Select order ${o.id}`} checked={selected.includes(o.id)} onCheckedChange={() => toggleRow(o.id)} />
                </TableCell>
                <TableCell className="font-medium">#{o.id}</TableCell>
                <TableCell>
                  <span className="block">{o.customer}</span>
                  <span className="block text-[12px] text-muted-foreground @max-[30rem]:hidden">{o.city}</span>
                </TableCell>
                <TableCell className="text-muted-foreground @max-[30rem]:hidden">{day(o.date)}</TableCell>
                <TableCell className="@max-[24rem]:hidden">
                  <Badge variant={badge[o.status]}>{o.status}</Badge>
                </TableCell>
                <TableCell className="pr-4 text-right font-medium">{euro(o.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Pagination aria-label="Order pages" total={orders.length} pageSize={pageSize} page={page} onPageChange={setPage} className="self-end">
        <PaginationList />
      </Pagination>
    </div>
  )
}
