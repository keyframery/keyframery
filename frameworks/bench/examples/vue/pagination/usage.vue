<script setup lang="ts">
import { Pagination, PaginationList } from "@/components/keyframery/pagination"
</script>

<template>
  <Pagination aria-label="Pages" :total="120" :page-size="10">
    <PaginationList />
  </Pagination>
</template>
