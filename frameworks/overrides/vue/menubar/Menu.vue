<script setup lang="ts">
/* One menu of the bar. Pass `items` to write it as data. Like UI SDK, the root then renders the content
   for you, unless you place a MenuContent of your own. */
import { computed, Fragment, isVNode, provide, ref, useAttrs, useSlots, type VNode } from "vue"
import { Menu as Part, type MenuData } from "@ui-sdk/vue/menu"
import { menuDataKey } from "./context"
import MenuContent from "./MenuContent.vue"
import MenuSheet from "./MenuSheet.vue"

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ items?: MenuData }>(), { items: undefined })
const attrs = useAttrs()
const slots = useSlots()
const names = computed(() => Object.keys(slots).filter((n) => n !== "default"))
const placed = ref(0)
function place() {
  placed.value++
  return () => {
    placed.value--
  }
}
provide(menuDataKey, { items: computed(() => props.items), place })
function hasContentChild(nodes: unknown): boolean {
  if (!Array.isArray(nodes)) return false
  return nodes.some((n) => isVNode(n) && (n.type === MenuContent || (n.type === Fragment && hasContentChild((n as VNode).children))))
}
function showSheet() {
  return !!props.items && !(placed.value > 0 || hasContentChild(slots.default?.()))
}
</script>

<template>
  <Part v-bind="attrs" :items="props.items">
    <template #default="s">
      <slot v-bind="s ?? {}" />
      <MenuSheet v-if="showSheet()" />
    </template>
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
