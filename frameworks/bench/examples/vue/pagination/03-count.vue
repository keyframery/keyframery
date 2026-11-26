<script setup lang="ts">
// Rolling count
// `PaginationRoll` rolls a number to its new value, for a “21 to 40 of 240” line.

import { computed, ref } from "vue"

import { Pagination, PaginationList, PaginationRoll } from "@/components/keyframery/pagination"

const total = 240
const pageSize = 20

const page = ref(2)
const first = computed(() => (page.value - 1) * pageSize + 1)
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <span class="text-[13px] text-muted-foreground tabular-nums">
      <PaginationRoll :value="first" /> to <PaginationRoll :value="Math.min(first + pageSize - 1, total)" /> of {{ total }}
    </span>
    <Pagination v-model:page="page" aria-label="Results pages" :total="total" :page-size="pageSize">
      <PaginationList />
    </Pagination>
  </div>
</template>
