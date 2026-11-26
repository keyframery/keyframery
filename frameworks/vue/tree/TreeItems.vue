<script setup lang="ts">
/* Rows from data: what `<Tree :items="..." />` renders when it has no content of its own. */
import { computed, inject } from "vue"
import type { TreeItemData } from "@ui-sdk/vue/tree"
import { checkableKey } from "./context"
import TreeGroup from "./TreeGroup.vue"
import TreeItem from "./TreeItem.vue"
import TreeItemCheckbox from "./TreeItemCheckbox.vue"
import TreeItemIndicator from "./TreeItemIndicator.vue"
import TreeItemLabel from "./TreeItemLabel.vue"
import TreeItems from "./TreeItems.vue"

const props = defineProps<{ items: TreeItemData[] }>()
const checkableRef = inject(checkableKey, null)
const checkable = computed(() => checkableRef?.value ?? false)
</script>

<template>
  <TreeItem v-for="item in props.items" :key="item.value" :value="item.value" :branch="item.children !== undefined" :disabled="item.disabled">
    <TreeItemLabel>
      <template v-if="item.href" #render="{ props: p, children }">
        <a v-bind="p" :href="item.href"><component :is="children" /></a>
      </template>
      <TreeItemIndicator v-if="item.children" />
      <TreeItemCheckbox v-if="checkable" />
      <span class="truncate">{{ item.label }}</span>
    </TreeItemLabel>
    <TreeGroup v-if="item.children">
      <TreeItems :items="item.children" />
    </TreeGroup>
  </TreeItem>
</template>
