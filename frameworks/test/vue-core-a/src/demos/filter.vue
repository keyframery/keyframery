<script setup lang="ts">
/* Mirrors src/demos/filter.tsx at its default controls. */
import { computed, h, reactive, type Component } from "vue"

import { Filter, FilterBar, FilterBarReset, type FilterItem } from "@/components/keyframery/filter"

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

/* Lucide icons, as lucide-react draws them at 14px / 1.75. */
const lucide = (name: string, children: [string, Record<string, string>][]): Component => () =>
  h(
    "svg",
    { xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.75", "stroke-linecap": "round", "stroke-linejoin": "round", class: `lucide ${name}`, "aria-hidden": "true" },
    children.map(([tag, attrs]) => h(tag, attrs)),
  )
const circle = ["circle", { cx: "12", cy: "12", r: "10" }] as [string, Record<string, string>]
const CircleCheck = lucide("lucide-circle-check lucide-check-circle-2", [circle, ["path", { d: "m16 9-5.5 5.5L8 12" }]])
const Clock = lucide("lucide-clock", [circle, ["path", { d: "M12 6v6l4 2" }]])
const CircleDashed = lucide(
  "lucide-circle-dashed",
  ["M10.1 2.182a10 10 0 0 1 3.8 0", "M13.9 21.818a10 10 0 0 1-3.8 0", "M17.609 3.721a10 10 0 0 1 2.69 2.7", "M2.182 13.9a10 10 0 0 1 0-3.8", "M20.279 17.609a10 10 0 0 1-2.7 2.69", "M21.818 10.1a10 10 0 0 1 0 3.8", "M3.721 6.391a10 10 0 0 1 2.7-2.69", "M6.391 20.279a10 10 0 0 1-2.69-2.7"].map((d) => ["path", { d }] as [string, Record<string, string>]),
)
const CircleX = lucide("lucide-circle-x lucide-x-circle", [circle, ["path", { d: "m15 9-6 6" }], ["path", { d: "m9 9 6 6" }]])
const Globe = lucide("lucide-globe", [circle, ["path", { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" }], ["path", { d: "M2 12h20" }]])
const Store = lucide("lucide-store", [
  ["path", { d: "M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5" }],
  ["path", { d: "M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244" }],
  ["path", { d: "M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05" }],
])
const Truck = lucide("lucide-truck", [
  ["path", { d: "M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" }],
  ["path", { d: "M15 18H9" }],
  ["path", { d: "M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" }],
  ["circle", { cx: "17", cy: "18", r: "2" }],
  ["circle", { cx: "7", cy: "18", r: "2" }],
])

type Key = "status" | "channel" | "fulfilment"
const facets: { key: Key; label: string; options: { value: string; label: string; icon?: Component }[] }[] = [
  {
    key: "status",
    label: "Status",
    options: [
      { value: "paid", label: "Paid", icon: CircleCheck },
      { value: "pending", label: "Pending", icon: Clock },
      { value: "refunded", label: "Refunded", icon: CircleDashed },
      { value: "failed", label: "Failed", icon: CircleX },
    ],
  },
  {
    key: "channel",
    label: "Channel",
    options: [
      { value: "online", label: "Online store", icon: Globe },
      { value: "pos", label: "In person", icon: Store },
      { value: "wholesale", label: "Wholesale", icon: Truck },
    ],
  },
  { key: "fulfilment", label: "Fulfilment", options: [{ value: "unfulfilled", label: "Unfulfilled" }, { value: "shipped", label: "Shipped" }] },
]
const statusLabel: Record<string, string> = { paid: "Paid", pending: "Pending", refunded: "Refunded", failed: "Failed" }

const chosen = reactive<Record<Key, string[]>>({ status: [], channel: [], fulfilment: [] })
const matches = (order: Order, except?: Key) => (Object.keys(chosen) as Key[]).every((key) => key === except || !chosen[key].length || chosen[key].includes(order[key]))
const rows = computed(() => orders.filter((order) => matches(order)))
const optionsOf = (facet: (typeof facets)[number]): FilterItem[] =>
  facet.options.map((option) => ({
    value: option.value,
    label: option.label,
    icon: option.icon,
    count: orders.filter((order) => matches(order, facet.key) && order[facet.key] === option.value).length,
  }))
</script>

<template>
  <div
    style="--filter-height: 32px; --filter-radius: 9px; --filter-list-width: 240px"
    class="@container w-full max-w-[600px] overflow-hidden rounded-[16px] bg-background shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]"
  >
    <div class="flex items-baseline justify-between px-4 pt-4 pb-3">
      <div class="text-[15px] font-semibold tracking-tight">Orders</div>
      <div class="text-[12px] text-muted-foreground tabular-nums">{{ rows.length }} of {{ orders.length }}</div>
    </div>
    <div class="px-4 pb-3">
      <FilterBar>
        <Filter
          v-for="facet in facets"
          :key="facet.key"
          :label="facet.label"
          :options="optionsOf(facet)"
          :multiple="facet.key !== 'fulfilment'"
          :max-badges="2"
          :hide-search="false"
          :value="chosen[facet.key]"
          @value-change="(value: string[]) => (chosen[facet.key] = value)"
        />
        <FilterBarReset />
      </FilterBar>
    </div>
    <ul class="border-t border-border">
      <li
        v-for="order in rows.slice(0, 5)"
        :key="order.id"
        class="grid grid-cols-[3.25rem_1fr_auto] items-center @md:grid-cols-[3.5rem_1fr_auto_5rem] gap-3 border-b border-border/70 px-4 py-2.5 text-[13px] last:border-b-0"
      >
        <span class="font-mono text-[12px] text-muted-foreground">{{ order.id }}</span>
        <span class="truncate font-medium">{{ order.customer }}</span>
        <span class="hidden text-[12px] text-muted-foreground @md:block">{{ statusLabel[order.status] }}</span>
        <span class="text-right tabular-nums">{{ order.total }}</span>
      </li>
      <li v-if="rows.length === 0" class="px-4 py-8 text-center text-[13px] text-muted-foreground">No orders match these filters.</li>
    </ul>
  </div>
</template>
