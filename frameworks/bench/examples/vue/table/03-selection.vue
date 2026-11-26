<script setup lang="ts">
// Selecting rows
// Put a [Checkbox](/docs/components/checkbox) in the first column and pass `selected` to the row. The header's checkbox shows a dash when only some are ticked.

import { computed, ref } from "vue"

import { Checkbox } from "@/components/keyframery/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/keyframery/table"

const files = [
  { id: "1", name: "Brief.pdf", size: "1.2 MB" },
  { id: "2", name: "Moodboard.fig", size: "18.4 MB" },
  { id: "3", name: "Budget.xlsx", size: "320 KB" },
]

const picked = ref<string[]>(["2"])
const all = computed(() => picked.value.length === files.length)
const toggle = (id: string) => picked.value = picked.value.includes(id) ? picked.value.filter((x) => x !== id) : [...picked.value, id]
</script>

<template>
  <Table class="w-full max-w-[420px]">
    <TableHeader>
      <TableRow>
        <TableHead>
          <Checkbox
            aria-label="Select all files"
            :checked="all ? true : picked.length ? 'indeterminate' : false"
            @checked-change="picked = all ? [] : files.map((f) => f.id)"
          />
        </TableHead>
        <TableHead>Name</TableHead>
        <TableHead class="text-right">Size</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="f in files" :key="f.id" :selected="picked.includes(f.id)">
        <TableCell>
          <Checkbox
            :aria-label="`Select ${f.name}`"
            :checked="picked.includes(f.id)"
            @checked-change="toggle(f.id)"
          />
        </TableCell>
        <TableCell class="font-medium">{{ f.name }}</TableCell>
        <TableCell class="text-right text-muted-foreground">{{ f.size }}</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
