<script setup lang="ts">
/* Mirrors src/demos/table.tsx with its default controls. */
import { computed, ref } from "vue"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/keyframery/table"
import { Checkbox } from "@/components/keyframery/checkbox"
import { Pagination, PaginationList } from "@/components/keyframery/pagination"
import { Badge } from "@/components/keyframery/badge"

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
const euro = (n: number) => n.toLocaleString("en-GB", { style: "currency", currency: "EUR" })
const day = (iso: string) => new Date(iso + "T12:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })
const badge = { Paid: "success", Pending: "outline", Refunded: "secondary" } as const
type SortKey = "date" | "total"
const pageSize = 6
const sort = ref<{ key: SortKey; dir: "ascending" | "descending" }>({ key: "date", dir: "descending" })
const page = ref(1)
const selected = ref<string[]>([])
const rows = computed(() => {
  const by = (o: Order) => (sort.value.key === "total" ? o.total : Date.parse(o.date) + Number(o.id))
  const sorted = [...orders].sort((a, b) => (sort.value.dir === "ascending" ? by(a) - by(b) : by(b) - by(a)))
  return sorted.slice((page.value - 1) * pageSize, page.value * pageSize)
})
const allOnPage = computed(() => rows.value.every((r) => selected.value.includes(r.id)))
const someOnPage = computed(() => rows.value.some((r) => selected.value.includes(r.id)))
const toggleSort = (key: SortKey) => (sort.value = { key, dir: sort.value.key === key && sort.value.dir === "descending" ? "ascending" : "descending" })
const toggleRow = (id: string) => (selected.value = selected.value.includes(id) ? selected.value.filter((x) => x !== id) : [...selected.value, id])
const togglePage = () =>
  (selected.value = allOnPage.value ? selected.value.filter((id) => !rows.value.some((r) => r.id === id)) : [...new Set([...selected.value, ...rows.value.map((r) => r.id)])])
</script>

<template>
  <div data-demo="table" style="--table-height: 44px; --table-padding: 12px; --table-radius: 7px; max-width: 620px; gap: 12px" class="@container flex w-full flex-col">
    <div class="flex items-baseline justify-between gap-4">
      <div>
        <h3 class="text-[15px] font-semibold tracking-tight">Orders</h3>
        <p class="mt-1 text-[12px] text-muted-foreground tabular-nums">{{ selected.length ? `${selected.length} selected` : `${orders.length} this week` }}</p>
      </div>
    </div>
    <div class="overflow-hidden rounded-[14px] bg-card shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_1px_2px_rgb(0_0_0/0.04)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]">
      <Table aria-label="Orders">
        <TableHeader>
          <TableRow>
            <TableHead class="pl-4">
              <Checkbox aria-label="Select every order on this page" :checked="allOnPage ? true : someOnPage ? 'indeterminate' : false" @checked-change="togglePage" />
            </TableHead>
            <TableHead>Order</TableHead>
            <TableHead :style="{ textAlign: 'left' }">Customer</TableHead>
            <TableHead data-play="sort-date" class="@max-[30rem]:hidden" :sort="sort.key === 'date' ? sort.dir : 'none'" @sort="toggleSort('date')">Date</TableHead>
            <TableHead class="@max-[24rem]:hidden">Status</TableHead>
            <TableHead data-play="sort-total" class="pr-3 text-right [&_button]:ml-auto" :sort="sort.key === 'total' ? sort.dir : 'none'" @sort="toggleSort('total')">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="o in rows" :key="o.id" :data-row="o.id" :selected="selected.includes(o.id)">
            <TableCell class="pl-4">
              <Checkbox :aria-label="`Select order ${o.id}`" :checked="selected.includes(o.id)" @checked-change="toggleRow(o.id)" />
            </TableCell>
            <TableCell class="font-medium">#{{ o.id }}</TableCell>
            <TableCell :style="{ textAlign: 'left' }">
              <span class="block">{{ o.customer }}</span>
              <span class="block text-[12px] text-muted-foreground @max-[30rem]:hidden">{{ o.city }}</span>
            </TableCell>
            <TableCell class="text-muted-foreground @max-[30rem]:hidden">{{ day(o.date) }}</TableCell>
            <TableCell class="@max-[24rem]:hidden"><Badge :variant="badge[o.status]">{{ o.status }}</Badge></TableCell>
            <TableCell class="pr-4 text-right font-medium">{{ euro(o.total) }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
    <Pagination aria-label="Order pages" :total="orders.length" :page-size="pageSize" :page="page" class="self-end" @page-change="(p: number) => (page = p)">
      <PaginationList />
    </Pagination>
  </div>
</template>
