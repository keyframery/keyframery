<script setup lang="ts">
/* UI SDK calls an item a branch when it finds its own TreeGroup among the item's children. Ours wraps
   that part, so the item looks for either one and says so itself (React's hasGroup). */
import { computed, isVNode, useAttrs, useSlots, type VNode } from "vue"
import { TreeGroup as TreeGroupPart, TreeItem as Part } from "@ui-sdk/vue/tree"
import { cn } from "@/lib/utils"
import TreeGroup from "./TreeGroup.vue"

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ value: string; branch?: boolean }>(), { branch: undefined })
const attrs = useAttrs()
const slots = useSlots()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const names = computed(() => Object.keys(slots).filter((n) => n !== "default"))
const base = "outline-none [&:focus-visible>[data-slot=tree-label]]:ring-2 [&:focus-visible>[data-slot=tree-label]]:ring-ring [&:focus-visible>[data-slot=tree-label]]:ring-offset-2 [&:focus-visible>[data-slot=tree-label]]:ring-offset-background"

function hasGroup(nodes: unknown): boolean {
  if (!Array.isArray(nodes)) return false
  return nodes.some((node) =>
    Array.isArray(node)
      ? hasGroup(node)
      : isVNode(node) && (node.type === TreeGroup || node.type === TreeGroupPart || hasGroup((node as VNode).children)),
  )
}
/* Looks through the item's content for a group before rendering it. The content is read with an empty
   state: the structure, not the state, says whether the item is a branch. */
const blank = new Proxy({}, { get: () => undefined })
function grouped() {
  try {
    return hasGroup(slots.default?.({ state: blank })) || undefined
  } catch {
    return undefined
  }
}
</script>

<template>
  <Part v-bind="rest" :value="props.value" :branch="props.branch ?? grouped()" :class="cn(base, attrs.class as any)">
    <template v-if="$slots.default" #default="s">
      <slot v-bind="s ?? {}" />
    </template>
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
