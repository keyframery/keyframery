<script setup lang="ts">
/* The sheet itself. With no content it renders the root's `items`. A menu that only opens from a
   right-click area sits right at the pointer and unfolds out of it. */
import { computed, inject, useAttrs, useSlots } from "vue"
import { MenuContent as Part } from "@ui-sdk/vue/menu"
import { useSpeedStyle } from "@/lib/keyframery"
import { cn } from "@/lib/utils"
import { contextMenuMotion, primitiveSheet, sheetLook } from "./classes"
import { menuSharedKey } from "./context"
import MenuItems from "./MenuItems.vue"

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ sideOffset?: number }>(), { sideOffset: undefined })
const attrs = useAttrs()
const slots = useSlots()
const rest = computed(() => {
  const { class: _class, style: _style, ...r } = attrs
  return r
})
const names = computed(() => Object.keys(slots).filter((n) => n !== "default"))
const shared = inject(menuSharedKey, null)
const fromPointer = computed(() => shared?.fromPointer.value ?? false)
const speedStyle = useSpeedStyle()
</script>

<template>
  <Part v-bind="rest" :side-offset="props.sideOffset ?? (fromPointer ? 2 : 6)"
    :class="cn(primitiveSheet, cn(sheetLook, fromPointer && contextMenuMotion, attrs.class as any))" :style="[speedStyle, attrs.style as any]">
    <template v-if="$slots.default || shared?.items.value" #default="s">
      <slot v-bind="s ?? {}">
        <MenuItems v-if="shared?.items.value" :items="shared.items.value" />
      </slot>
    </template>
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
