<script setup lang="ts">
/* Pass `items` to write the menu as data. Like UI SDK, the root then renders the content for you, unless
   you place a MenuContent of your own. A popover on wide screens and a sheet from the bottom edge on small
   touch screens (UI SDK's presentation="auto"). Pass presentation="popover" to keep it floating everywhere. */
import { computed, isVNode, provide, reactive, useAttrs, useSlots, type VNode, Fragment } from "vue"
import { Menu as Part, type MenuData } from "@ui-sdk/vue/menu"
import { speedKey, speedValue, type Speed as SpeedValue, Speed } from "@/lib/keyframery"
import { menuSharedKey, type MenuPartKind } from "./context"
import MenuContent from "./MenuContent.vue"
import MenuSheet from "./MenuSheet.vue"

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ speed?: SpeedValue; presentation?: "auto" | "popover" | "sheet"; items?: MenuData }>(), {
  presentation: "auto",
  items: undefined,
})
const attrs = useAttrs()
const slots = useSlots()
const names = computed(() => Object.keys(slots).filter((n) => n !== "default"))
provide(speedKey, computed(() => speedValue(props.speed)))

const placed = reactive({ content: 0, trigger: 0, context: 0 })
function register(kind: MenuPartKind) {
  placed[kind]++
  return () => {
    placed[kind]--
  }
}
const fromPointer = computed(() => placed.context > 0 && placed.trigger === 0)
provide(menuSharedKey, { items: computed(() => props.items), register, fromPointer })

/* Top-level content only, like React's Children.toArray. */
function hasContentChild(nodes: unknown): boolean {
  if (!Array.isArray(nodes)) return false
  return nodes.some((n) => isVNode(n) && (n.type === MenuContent || (n.type === Fragment && hasContentChild((n as VNode).children))))
}
function showSheet() {
  return !!props.items && !(placed.content > 0 || hasContentChild(slots.default?.()))
}
</script>

<template>
  <Speed :speed="props.speed">
    <Part v-bind="attrs" :presentation="props.presentation" :items="props.items">
      <template #default="s">
        <slot v-bind="s ?? {}" />
        <MenuSheet v-if="showSheet()" />
      </template>
      <template v-for="n in names" :key="n" #[n]="s">
        <slot :name="n" v-bind="s ?? {}" />
      </template>
    </Part>
  </Speed>
</template>
