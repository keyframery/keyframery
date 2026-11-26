<script setup lang="ts">
/* "View": a menu of the columns, each with a check while it shows. */
import { Menu, MenuCheckboxItem, MenuContent, MenuGroup, MenuGroupLabel, MenuItemIndicator, MenuTrigger } from "@/components/keyframery/menu"

import { Settings2 } from "./icons"
import { parts, useDataTable } from "./parts"

const props = withDefaults(defineProps<{ class?: string; label?: string }>(), { class: undefined, label: "View" })
const api = useDataTable()
const toggle = (id: string, checked: boolean) => (checked ? api.showColumn(id, new Event("change")) : api.hideColumn(id, new Event("change")))
</script>

<template>
  <parts.View :class="props.class">
    <template #default="{ state }">
      <Menu>
        <MenuTrigger data-data-table-view="" class="h-[var(--data-table-control,2rem)] @max-[30rem]/data-table:px-2">
          <Settings2 />
          <span class="@max-[30rem]/data-table:sr-only">{{ props.label }}</span>
        </MenuTrigger>
        <MenuContent align="end" class="w-48">
          <MenuGroup>
            <MenuGroupLabel>Toggle columns</MenuGroupLabel>
            <MenuCheckboxItem
              v-for="column in state.columns"
              :key="column.id"
              :value="column.id"
              :checked="column.visible"
              @checked-change="(checked: boolean) => toggle(column.id, checked)"
            >
              {{ column.label }}
              <MenuItemIndicator />
            </MenuCheckboxItem>
          </MenuGroup>
        </MenuContent>
      </Menu>
    </template>
  </parts.View>
</template>
