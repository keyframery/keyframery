<script setup lang="ts">
// After a search
// `announce` reads the title and description to screen readers when the empty state appears, so a search that finds nothing is heard, not only seen.

import { ref } from "vue"
import { SearchX } from "@lucide/vue"

import { Button } from "@/components/keyframery/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/keyframery/empty"

const query = ref("velvet")
</script>

<template>
  <p v-if="!query" class="text-[13px] text-muted-foreground">All 112 fabrics</p>
  <Empty v-else announce class="max-w-[420px]">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <SearchX />
      </EmptyMedia>
      <EmptyTitle>No fabrics match “{{ query }}”</EmptyTitle>
      <EmptyDescription>Check the spelling, or look through the swatch book by colour.</EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <Button size="sm" @click="query = ''">Clear search</Button>
    </EmptyContent>
  </Empty>
</template>
