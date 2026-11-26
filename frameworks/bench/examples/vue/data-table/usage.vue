<script setup lang="ts">
import { DataTable, type DataTableColumnDef } from "@/components/keyframery/data-table"

type Order = { id: string; customer: string; status: string; total: number }
const orders: Order[] = [
  { id: "1042", customer: "Maya Chen", status: "Paid", total: 184 },
  { id: "1041", customer: "Tom Okafor", status: "Pending", total: 62.5 },
]
const columns: DataTableColumnDef<Order>[] = [
  { id: "id", header: "Order", searchable: true },
  { id: "customer", header: "Customer", searchable: true },
  { id: "status", header: "Status", filter: { options: [{ value: "Paid" }, { value: "Pending" }] } },
  { id: "total", header: "Total", align: "end" },
]
</script>

<template>
  <DataTable label="Orders" :data="orders" :columns="columns" />
</template>
