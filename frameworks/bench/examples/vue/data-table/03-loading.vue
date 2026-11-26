<script setup lang="ts">
// Loading
// `loading` keeps the toolbar and headers and draws skeleton rows at the table's own geometry, one per row of the page.

import { DataTable, type DataTableColumnDef } from "@/components/keyframery/data-table"

type Invoice = { id: string; client: string; due: string; amount: number }
const columns: DataTableColumnDef<Invoice>[] = [
  { id: "id", header: "Invoice", searchable: true },
  { id: "client", header: "Client", searchable: true },
  { id: "due", header: "Due" },
  { id: "amount", header: "Amount", align: "end" },
]
</script>

<template>
  <DataTable
    label="Invoices"
    class="w-full max-w-[640px]"
    :data="[]"
    :columns="columns"
    loading
    :default-page-size="5"
  />
</template>
