<script setup lang="ts">
/* Search, the filter chips, Reset, then anything in the default slot and View. It wraps on a narrow container. */
import { cn } from "@/lib/utils"

import DataTableFilters from "./DataTableFilters.vue"
import DataTableReset from "./DataTableReset.vue"
import DataTableSearch from "./DataTableSearch.vue"
import DataTableView from "./DataTableView.vue"
import { parts } from "./parts"

const props = withDefaults(defineProps<{ searchPlaceholder?: string; class?: string }>(), { searchPlaceholder: undefined, class: undefined })
</script>

<template>
  <parts.Toolbar :class="cn('flex flex-wrap items-center gap-2 [--filter-height:var(--data-table-control,2rem)]', props.class)">
    <DataTableSearch :placeholder="props.searchPlaceholder" />
    <DataTableFilters />
    <DataTableReset />
    <div class="ms-auto flex items-center gap-2">
      <slot />
      <DataTableView />
    </div>
  </parts.Toolbar>
</template>
