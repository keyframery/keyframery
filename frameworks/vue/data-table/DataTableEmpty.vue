<script setup lang="ts">
/* "No results", with a button that clears the search and the filters. */
import { Button } from "@/components/keyframery/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/keyframery/empty"

import { SearchX } from "./icons"
import { parts, useDataTable } from "./parts"

const props = withDefaults(defineProps<{ title?: string; description?: string; class?: string }>(), { title: "No results", description: undefined, class: undefined })
const api = useDataTable()
</script>

<template>
  <parts.Empty :class="props.class">
    <template #default="{ state }">
      <Empty class="py-12">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchX class="size-5" />
          </EmptyMedia>
          <EmptyTitle>{{ props.title }}</EmptyTitle>
          <EmptyDescription>
            {{ props.description ?? (state.search.trim() ? `Nothing matches “${state.search.trim()}”.` : "No rows match these filters.") }}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent v-if="state.filtered">
          <Button size="sm" data-data-table-clear="" @click="(event: MouseEvent) => api.resetFilters(event)">Clear filters</Button>
        </EmptyContent>
      </Empty>
    </template>
  </parts.Empty>
</template>
