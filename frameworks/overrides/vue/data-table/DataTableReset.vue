<script setup lang="ts">
/* Clears the search and every filter. It slides in only while something is filtered (inert while hidden). */
import { Button } from "@/components/keyframery/button"
import { cn } from "@/lib/utils"

import { X } from "./icons"
import { parts, resetMotion, useDataTable } from "./parts"

const props = withDefaults(defineProps<{ class?: string }>(), { class: undefined })
const api = useDataTable()
</script>

<template>
  <parts.Reset :class="cn(resetMotion, props.class)">
    <template #default="{ state }">
      <div :inert="!state.shown">
        <Button
          variant="ghost"
          size="sm"
          data-data-table-reset=""
          class="h-[var(--data-table-control,2rem)] bg-none shadow-none dark:bg-none dark:shadow-none"
          @click="(event: MouseEvent) => api.resetFilters(event)"
        >
          <slot>Reset</slot>
          <X />
        </Button>
      </div>
    </template>
  </parts.Reset>
</template>
