<script setup lang="ts">
/* The menu, opened by a right-click or a long press on ContextMenuTrigger. Supplies the context sheet for
   the menu's `items` shorthand as well as composed content. */
import { computed, Fragment, isVNode, useAttrs, useSlots, type VNode } from "vue"
import { Menu, MenuContent } from "@/components/keyframery/menu"
import { contextTheme } from "./classes"
import ContextMenuContent from "./ContextMenuContent.vue"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const slots = useSlots()
const names = computed(() => Object.keys(slots).filter((n) => n !== "default"))
function hasContent(nodes: unknown): boolean {
  if (!Array.isArray(nodes)) return false
  return nodes.some(
    (n) => isVNode(n) && (n.type === ContextMenuContent || n.type === MenuContent || (n.type === Fragment && hasContent((n as VNode).children))),
  )
}
</script>

<template>
  <Menu v-bind="attrs">
    <template #default="s">
      <slot v-bind="s ?? {}" />
      <MenuContent v-if="attrs.items && !hasContent($slots.default?.())" :class="contextTheme" />
    </template>
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Menu>
</template>
