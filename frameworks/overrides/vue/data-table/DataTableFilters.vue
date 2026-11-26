<script setup lang="ts">
/* A filter chip per filterable column, with the number of rows each value would leave. */
import { Filter } from "@/components/keyframery/filter"
import { cn } from "@/lib/utils"

import { parts, useDataTable } from "./parts"

const props = withDefaults(defineProps<{ class?: string }>(), { class: undefined })
const api = useDataTable()
const setFilter = (id: string, value: string[]) => api.setFilter(id, value, new Event("change"))
</script>

<template>
  <parts.Filters :class="cn('contents', props.class)">
    <template #default="{ state }">
      <Filter
        v-for="item in state.items"
        :key="item.id"
        :data-filter="item.id"
        :label="item.title"
        :options="item.options.map((o) => ({ value: o.value, label: o.label, count: o.count, icon: o.icon as any }))"
        :value="item.selected"
        @value-change="(value: string[]) => setFilter(item.id, value)"
      />
    </template>
  </parts.Filters>
</template>
