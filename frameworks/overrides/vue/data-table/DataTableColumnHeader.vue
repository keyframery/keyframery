<script setup lang="ts">
/* A header that sorts and hides from a small menu: Asc, Desc, Hide. A column that doesn't sort or hide shows its label. */
import { computed } from "vue"

import { Button } from "@/components/keyframery/button"
import { Menu, MenuContent, MenuItem, MenuItemIcon, MenuSeparator, MenuTrigger } from "@/components/keyframery/menu"
import { cn } from "@/lib/utils"

import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from "./icons"
import { onElement, useDataTable } from "./parts"

const props = defineProps<{
  id: string
  label: string
  sort: "ascending" | "descending" | "none"
  sortable: boolean
  hideable: boolean
  align?: "start" | "center" | "end"
}>()
const api = useDataTable()
const SortIcon = computed(() => (props.sort === "ascending" ? ArrowUp : props.sort === "descending" ? ArrowDown : ChevronsUpDown))
const iconClass = computed(() =>
  cn("size-3.5 transition-[opacity,rotate] duration-[calc(420ms*var(--kf-speed,1))] ease-spring motion-reduce:transition-none", props.sort === "none" && "opacity-45"),
)
function onAction(value: string) {
  const event = new Event("select")
  if (value === "asc") api.setSort(props.id, "ascending", event)
  else if (value === "desc") api.setSort(props.id, "descending", event)
  else if (value === "hide") api.hideColumn(props.id, event)
}
</script>

<template>
  <span v-if="!props.sortable && !props.hideable" class="px-0.5">{{ props.label }}</span>
  <Menu v-else @action="onAction">
    <MenuTrigger
      :data-data-table-sort="props.id"
      :aria-label="`${props.label}, ${props.sort === 'none' ? 'not sorted' : `sorted ${props.sort}`}. Sort or hide`"
      class="-mx-1.5 h-7 gap-1 bg-none px-1.5 text-[12px] font-medium text-[color:inherit] shadow-none dark:bg-none dark:shadow-none data-open:bg-accent"
    >
      <template #render="{ props: trigger }">
        <Button variant="ghost" size="sm" v-bind="onElement(trigger)">
          <template v-if="props.align === 'end'"><component :is="SortIcon" :class="iconClass" />{{ props.label }}</template>
          <template v-else>{{ props.label }}<component :is="SortIcon" :class="iconClass" /></template>
        </Button>
      </template>
    </MenuTrigger>
    <MenuContent :align="props.align === 'end' ? 'end' : 'start'" class="w-36">
      <template v-if="props.sortable">
        <MenuItem value="asc" data-value="asc">
          <MenuItemIcon><ArrowUp /></MenuItemIcon>
          Asc
        </MenuItem>
        <MenuItem value="desc" data-value="desc">
          <MenuItemIcon><ArrowDown /></MenuItemIcon>
          Desc
        </MenuItem>
      </template>
      <MenuSeparator v-if="props.sortable && props.hideable" />
      <MenuItem v-if="props.hideable" value="hide" data-value="hide">
        <MenuItemIcon><EyeOff /></MenuItemIcon>
        Hide
      </MenuItem>
    </MenuContent>
  </Menu>
</template>
