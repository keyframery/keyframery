<script setup lang="ts">
// As links
// `getHref` makes every page a real link, so each page has its own URL and works without JavaScript.

import { Pagination, PaginationList } from "@/components/keyframery/pagination"
</script>

<template>
  <Pagination aria-label="Blog pages" :page-count="8" :default-page="2" :get-href="(page) => `#page-${page}`">
    <PaginationList />
  </Pagination>
</template>
