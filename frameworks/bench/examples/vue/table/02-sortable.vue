<script setup lang="ts">
// Sortable columns
// Give a header `sort` and `onSort` and it becomes a button with an arrow that turns over on a spring. It sets `aria-sort` for screen readers.

import { computed, ref } from "vue"

import { type SortDirection, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/keyframery/table"

const people = [
  { name: "Maya Chen", team: "Design", joined: 2021 },
  { name: "Tom Okafor", team: "Engineering", joined: 2019 },
  { name: "Ines Duarte", team: "Product", joined: 2023 },
  { name: "Sam Price", team: "Engineering", joined: 2022 },
]
type Key = "name" | "joined"

const sort = ref<{ key: Key; dir: Exclude<SortDirection, "none"> }>({ key: "name", dir: "ascending" })
const rows = computed(() => [...people].sort((a, b) => {
    const order = a[sort.value.key] < b[sort.value.key] ? -1 : a[sort.value.key] > b[sort.value.key] ? 1 : 0
    return sort.value.dir === "ascending" ? order : -order
  }))
const by = (key: Key) => () => sort.value = { key, dir: sort.value.key === key && sort.value.dir === "ascending" ? "descending" : "ascending" }
</script>

<template>
  <Table class="w-full max-w-[460px]">
    <TableHeader>
      <TableRow>
        <TableHead :sort="sort.key === 'name' ? sort.dir : 'none'" @sort="by('name')">Name</TableHead>
        <TableHead>Team</TableHead>
        <TableHead :sort="sort.key === 'joined' ? sort.dir : 'none'" @sort="by('joined')">Joined</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="p in rows" :key="p.name">
        <TableCell class="font-medium">{{ p.name }}</TableCell>
        <TableCell>{{ p.team }}</TableCell>
        <TableCell>{{ p.joined }}</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
