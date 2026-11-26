<script setup lang="ts">
/* The search field, with a clear button while it holds text. */
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/keyframery/input-group"
import { cn } from "@/lib/utils"

import { Search, X } from "./icons"
import { parts, useDataTable } from "./parts"

const props = withDefaults(defineProps<{ placeholder?: string; class?: string }>(), { placeholder: "Search…", class: undefined })
const api = useDataTable()
const setSearch = (value: string, details?: { event?: Event }) => api.setSearch(value, details?.event ?? new Event("input"))
</script>

<template>
  <parts.Search :class="cn('w-[15rem] @max-[40rem]/data-table:w-full', props.class)">
    <template #default="{ state }">
      <InputGroup class="h-[var(--data-table-control,2rem)] min-h-0 [--input-group-height:var(--data-table-control,2rem)]">
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          data-data-table-search=""
          :aria-label="state.label"
          :placeholder="props.placeholder ?? 'Search…'"
          :value="state.value"
          :disabled="state.disabled"
          @value-change="setSearch"
        />
        <InputGroupAddon v-if="state.value" align="inline-end">
          <InputGroupButton size="icon-xs" aria-label="Clear search" @click="(event: MouseEvent) => api.clearSearch(event)">
            <X />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </template>
  </parts.Search>
</template>
