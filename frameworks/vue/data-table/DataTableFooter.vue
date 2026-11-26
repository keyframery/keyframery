<script setup lang="ts">
/* The selection count, "Rows per page", "Page X of Y" and the pages. First and last leave on a narrow container. */
import {
  Pagination,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationLink,
  PaginationList,
  PaginationNext,
  PaginationPrevious,
  PaginationRoll,
} from "@/components/keyframery/pagination"
import { Select, SelectContent, SelectItem, SelectItemIndicator, SelectItemText, SelectTrigger, SelectValue } from "@/components/keyframery/select"
import { cn } from "@/lib/utils"

import { parts, useDataTable } from "./parts"

const props = withDefaults(defineProps<{ class?: string; label?: string }>(), { class: undefined, label: "rows" })
const api = useDataTable()
const setPageSize = (value: string | null) => value && api.setPageSize(Number(value), new Event("change"))
const setPage = (page: number) => api.setPage(page, new Event("change"))
</script>

<template>
  <parts.Footer :class="cn('flex flex-wrap items-center gap-x-6 gap-y-3 px-1 text-[13px] text-muted-foreground tabular-nums', props.class)">
    <template #default="{ state }">
      <div class="me-auto @max-[40rem]/data-table:hidden">
        <template v-if="state.selectable && state.selectedCount"><PaginationRoll :value="state.selectedCount" /> of {{ state.total }} selected</template>
        <template v-else><PaginationRoll :value="state.total" /> {{ props.label }}</template>
      </div>
      <div class="flex items-center gap-2 @max-[30rem]/data-table:hidden">
        <span class="font-medium text-foreground">Rows per page</span>
        <Select :value="String(state.pageSize)" @value-change="setPageSize">
          <SelectTrigger aria-label="Rows per page" data-data-table-page-size="" class="h-8 w-[4.5rem] [--select-height:2rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="size in state.pageSizes" :key="size" :value="String(size)">
              <SelectItemText>{{ size }}</SelectItemText>
              <SelectItemIndicator />
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="font-medium text-foreground @max-[40rem]/data-table:me-auto">Page <PaginationRoll :value="state.page" /> of {{ state.pageCount }}</div>
      <Pagination aria-label="Pages" :total="state.total" :page-size="state.pageSize" :page="state.page" @page-change="setPage">
        <PaginationList class="@max-[30rem]/data-table:before:opacity-0!">
          <template #default="{ state: list }">
            <PaginationItem class="@max-[40rem]/data-table:hidden">
              <PaginationFirst aria-label="First page" />
            </PaginationItem>
            <PaginationItem>
              <PaginationPrevious aria-label="Previous page" data-data-table-previous="" />
            </PaginationItem>
            <PaginationItem v-for="item in list.items" :key="item" class="@max-[30rem]/data-table:hidden">
              <PaginationLink v-if="typeof item === 'number'" :page="item" />
              <PaginationEllipsis v-else />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext aria-label="Next page" data-data-table-next="" />
            </PaginationItem>
            <PaginationItem class="@max-[40rem]/data-table:hidden">
              <PaginationLast aria-label="Last page" />
            </PaginationItem>
          </template>
        </PaginationList>
      </Pagination>
    </template>
  </parts.Footer>
</template>
