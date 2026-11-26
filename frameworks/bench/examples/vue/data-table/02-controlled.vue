<script setup lang="ts">
// State in your hands
// Every piece of state is controlled or not: here the search, the filters, the sort and the page live in the page's own state, the way you would keep them in the URL.

import { ref } from "vue"

import { DataTable, type DataTableColumnDef, type DataTableFilterValues, type DataTableSort } from "@/components/keyframery/data-table"

type Trip = { id: string; city: string; month: string; nights: number }
const trips: Trip[] = ["Lisbon", "Porto", "Kyoto", "Oslo", "Seville", "Dublin", "Bristol", "Berlin"].flatMap((city, i) =>
  ["Mar", "Jun", "Sep"].map((month, j) => ({ id: `${city}-${month}`, city, month, nights: 2 + ((i + j * 3) % 6) })),
)
const columns: DataTableColumnDef<Trip>[] = [
  { id: "city", header: "City", searchable: true },
  { id: "month", header: "Month", filter: { options: ["Mar", "Jun", "Sep"].map((value) => ({ value })) }, sortValue: (t) => ["Mar", "Jun", "Sep"].indexOf(t.month) },
  { id: "nights", header: "Nights", align: "end" },
]

const search = ref("")
const filters = ref<DataTableFilterValues>({ month: ["Jun"] })
const sort = ref<DataTableSort>({ id: "nights", direction: "descending" })
const page = ref(1)
</script>

<template>
  <div class="flex w-full max-w-[560px] flex-col gap-3">
    <DataTable
      v-model:page="page"
      v-model:search="search"
      v-model:filters="filters"
      v-model:sort="sort"
      label="Trips"
      :data="trips"
      :columns="columns"
      :selectable="false"
      :default-page-size="5"
    />
    <code class="text-[12px] text-muted-foreground">?q={{ search }}&month={{ (filters.month ?? []).join(',') }}&sort={{ sort ? `${sort.id}.${sort.direction}` : '' }}&page={{ page }}</code>
  </div>
</template>
