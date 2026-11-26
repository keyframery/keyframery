<script setup lang="ts">
// Wide tables on a phone
// When the columns don't fit, the table scrolls sideways inside its container and the edge you can scroll toward fades. Narrow this window to see it.

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/keyframery/table"

const rows = [
  ["Lisbon", "Portugal", "545,000", "100 km²", "UTC+0", "Euro"],
  ["Kyoto", "Japan", "1,460,000", "828 km²", "UTC+9", "Yen"],
  ["Oslo", "Norway", "709,000", "454 km²", "UTC+1", "Krone"],
]
</script>

<template>
  <div class="w-full max-w-[340px] rounded-[12px] border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead v-for="h in ['City', 'Country', 'People', 'Area', 'Time zone', 'Currency']" :key="h">{{ h }}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="r in rows" :key="r[0]">
          <TableCell v-for="(cell, i) in r" :key="i" :class="i === 0 ? 'font-medium' : undefined">{{ cell }}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
