<script setup lang="ts">
/* Mirrors src/demos/data-table.tsx at its default controls: 120 seeded orders, sorted by date, 8 a page,
   selectable rows, a row menu and bulk actions. */
import { h, ref, type VNode } from "vue"

import { Badge } from "@/components/keyframery/badge"
import { DataTable, DataTableBulkAction, type DataTableColumnDef } from "@/components/keyframery/data-table"
import { MenuItem, MenuSeparator } from "@/components/keyframery/menu"

type Payment = "Paid" | "Pending" | "Refunded" | "Failed"
type Fulfilment = "Unfulfilled" | "Packed" | "Shipped" | "Delivered"
type Order = { id: string; number: number; customer: string; date: string; payment: Payment; fulfilment: Fulfilment; items: number; total: number }

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
    const fulfilment: Fulfilment = age < 2 ? pick(["Unfulfilled", "Unfulfilled", "Packed"] as const) : age < 6 ? pick(["Packed", "Shipped", "Shipped", "Unfulfilled"] as const) : pick(["Shipped", "Delivered", "Delivered", "Delivered"] as const)
    const roll = random()
    const payment: Payment = roll < 0.72 ? "Paid" : roll < 0.86 ? "Pending" : roll < 0.95 ? "Refunded" : "Failed"
    const items = 1 + Math.floor(random() * random() * 6)
    const total = Math.round((items * (14 + random() * 86) + (random() < 0.3 ? 4.9 : 0)) * 100) / 100
    const number = 1160 - i
    return { id: String(number), number, customer: `${pick(firstNames)} ${pick(lastNames)}`, date: new Date(today - age * 86400000).toISOString().slice(0, 10), payment, fulfilment, items, total }
  })
}

const euro = new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR" })
const dayFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" })
const paymentBadge: Record<Payment, "success" | "outline" | "secondary" | "destructive"> = { Paid: "success", Pending: "outline", Refunded: "secondary", Failed: "destructive" }

/* lucide icons, same markup as lucide-react at size 16, stroke 1.75. */
const lucide = (names: string, nodes: [string, Record<string, string>][]) => (): VNode =>
  h("svg", { xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 1.75, "stroke-linecap": "round", "stroke-linejoin": "round", class: `lucide ${names}`, "aria-hidden": "true" }, nodes.map(([t, a]) => h(t, a)))
const CircleDashed = lucide("lucide-circle-dashed", ["M10.1 2.182a10 10 0 0 1 3.8 0", "M13.9 21.818a10 10 0 0 1-3.8 0", "M17.609 3.721a10 10 0 0 1 2.69 2.7", "M2.182 13.9a10 10 0 0 1 0-3.8", "M20.279 17.609a10 10 0 0 1-2.7 2.69", "M21.818 10.1a10 10 0 0 1 0 3.8", "M3.721 6.391a10 10 0 0 1 2.7-2.69", "M6.391 20.279a10 10 0 0 1-2.69-2.7"].map((d) => ["path", { d }] as [string, Record<string, string>]))
const Package = lucide("lucide-package", [["path", { d: "M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" }], ["path", { d: "M12 22V12" }], ["polyline", { points: "3.29 7 12 12 20.71 7" }], ["path", { d: "m7.5 4.27 9 5.15" }]])
const Truck = lucide("lucide-truck", [["path", { d: "M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" }], ["path", { d: "M15 18H9" }], ["path", { d: "M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" }], ["circle", { cx: "17", cy: "18", r: "2" }], ["circle", { cx: "7", cy: "18", r: "2" }]])
const CircleCheck = lucide("lucide-circle-check lucide-check-circle-2", [["circle", { cx: "12", cy: "12", r: "10" }], ["path", { d: "m16 9-5.5 5.5L8 12" }]])
const Download = lucide("lucide-download", [["path", { d: "M12 15V3" }], ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }], ["path", { d: "m7 10 5 5 5-5" }]])
const XCircle = lucide("lucide-circle-x lucide-x-circle", [["circle", { cx: "12", cy: "12", r: "10" }], ["path", { d: "m15 9-6 6" }], ["path", { d: "m9 9 6 6" }]])
const fulfilmentIcon: Record<Fulfilment, () => VNode> = { Unfulfilled: CircleDashed, Packed: Package, Shipped: Truck, Delivered: CircleCheck }

const columns: DataTableColumnDef<Order>[] = [
  { id: "number", header: "Order", accessor: (o) => `#${o.number}`, sortValue: (o) => o.number, searchable: true, hideable: false, sticky: true, cell: (o) => h("span", { class: "font-medium" }, `#${o.number}`) },
  { id: "customer", header: "Customer", searchable: true, cell: (o) => h("span", { class: "font-medium" }, o.customer) },
  { id: "date", header: "Date", hideBelow: "md", cell: (o) => h("span", { class: "text-muted-foreground" }, dayFormat.format(new Date(o.date))) },
  {
    id: "payment",
    header: "Payment",
    filter: { options: (["Paid", "Pending", "Refunded", "Failed"] as const).map((value) => ({ value })) },
    cell: (o) => h(Badge, { variant: paymentBadge[o.payment] }, () => o.payment),
  },
  {
    id: "fulfilment",
    header: "Fulfilment",
    hideBelow: "sm",
    filter: { options: (["Unfulfilled", "Packed", "Shipped", "Delivered"] as const).map((value) => ({ value, icon: fulfilmentIcon[value]() })) },
    sortValue: (o) => ["Unfulfilled", "Packed", "Shipped", "Delivered"].indexOf(o.fulfilment),
    cell: (o) => h("span", { class: "flex items-center gap-1.5 text-muted-foreground [&_svg]:shrink-0" }, [fulfilmentIcon[o.fulfilment](), h("span", { class: "text-foreground" }, o.fulfilment)]),
  },
  { id: "items", header: "Items", align: "end", hideBelow: "lg" },
  { id: "total", header: "Total", align: "end", cell: (o) => h("span", { class: "font-medium" }, euro.format(o.total)) },
]

const orders = ref(makeOrders())
const selected = ref<string[]>([])
const update = (ids: string[], change: (o: Order) => Order | null) => {
  orders.value = orders.value.flatMap((o) => (ids.includes(o.id) ? (change(o) ?? []) : [o]))
}
</script>

<template>
  <div style="max-width: 940px; --data-table-row-height: 44px; --data-table-radius: 14px" class="flex w-full flex-col gap-4 self-start">
    <div>
      <div class="text-[15px] font-semibold tracking-tight">Orders</div>
      <div class="mt-1 text-[12px] text-muted-foreground tabular-nums">{{ orders.length }} orders in the last 8 weeks</div>
    </div>
    <DataTable
      label="Orders"
      :data="orders"
      :columns="columns"
      :loading="false"
      :selectable="true"
      :default-sort="{ id: 'date', direction: 'descending' }"
      :default-page-size="8"
      :page-sizes="[5, 8, 10, 20, 50]"
      :default-hidden-columns="[]"
      :selected="selected"
      search-placeholder="Search orders or customers"
      @selected-change="(next: string[]) => (selected = next)"
    >
      <template #row-actions="{ row: o }">
        <MenuItem value="view">View order</MenuItem>
        <MenuItem value="ship" :disabled="o.fulfilment === 'Shipped' || o.fulfilment === 'Delivered'" @select="update([o.id], (x) => ({ ...x, fulfilment: 'Shipped' }))">Mark as shipped</MenuItem>
        <MenuItem value="refund" :disabled="o.payment !== 'Paid'" @select="update([o.id], (x) => ({ ...x, payment: 'Refunded' }))">Refund</MenuItem>
        <MenuSeparator />
        <MenuItem value="cancel" destructive @select="update([o.id], () => null)">Cancel order</MenuItem>
      </template>
      <template #bulk-actions="{ selected: ids }">
        <DataTableBulkAction data-bulk="ship" label="Mark as shipped" @click="update(ids, (x) => (x.fulfilment === 'Delivered' ? x : { ...x, fulfilment: 'Shipped' }))">
          <template #icon><component :is="Truck" /></template>
        </DataTableBulkAction>
        <DataTableBulkAction data-bulk="export" label="Export">
          <template #icon><component :is="Download" /></template>
        </DataTableBulkAction>
        <DataTableBulkAction tone="destructive" data-bulk="cancel" label="Cancel" @click="update(ids, () => null); selected = []">
          <template #icon><component :is="XCircle" /></template>
        </DataTableBulkAction>
      </template>
    </DataTable>
  </div>
</template>
