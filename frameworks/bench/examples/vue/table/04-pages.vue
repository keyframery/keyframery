<script setup lang="ts">
// With pages
// Give each row a stable `key`. When the page changes, the new rows cascade in; after a sort, rows that only moved stay still.

import { computed, ref } from "vue"

import { Pagination, PaginationList } from "@/components/keyframery/pagination"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/keyframery/table"

const logs = Array.from({ length: 24 }, (_, i) => ({ id: 2400 - i, path: ["/", "/pricing", "/docs", "/blog", "/login"][i % 5], ms: 40 + ((i * 37) % 300) }))
const pageSize = 6

const page = ref(1)
const rows = computed(() => logs.slice((page.value - 1) * pageSize, page.value * pageSize))
</script>

<template>
  <div class="flex w-full max-w-[440px] flex-col gap-3">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Request</TableHead>
          <TableHead>Path</TableHead>
          <TableHead class="text-right">Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="r in rows" :key="r.id">
          <TableCell class="text-muted-foreground">#{{ r.id }}</TableCell>
          <TableCell class="font-medium">{{ r.path }}</TableCell>
          <TableCell class="text-right">{{ r.ms }} ms</TableCell>
        </TableRow>
      </TableBody>
    </Table>
    <Pagination
      v-model:page="page"
      aria-label="Log pages"
      :total="logs.length"
      :page-size="pageSize"
      class="self-center"
    >
      <PaginationList />
    </Pagination>
  </div>
</template>
