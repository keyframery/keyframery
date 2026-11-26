<script setup lang="ts">
// Basic
// Give it `total` and `pageSize` and it works out the pages, with ellipses for the long gaps.

import { ref } from "vue"

import { Pagination, PaginationList } from "@/components/keyframery/pagination"

const page = ref(4)
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <Pagination v-model:page="page" aria-label="Results pages" :total="240" :page-size="20">
      <PaginationList />
    </Pagination>
    <span class="text-[12px] text-muted-foreground tabular-nums">Page {{ page }} of 12</span>
  </div>
</template>
