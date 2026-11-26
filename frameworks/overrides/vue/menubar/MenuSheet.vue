<script setup lang="ts">
/* The sheet itself. With no content it renders the root's `items`. */
import { computed, inject, useAttrs, useSlots } from "vue"
import { MenuContent as Part } from "@ui-sdk/vue/menu"
import { useSpeedStyle } from "@/lib/keyframery"
import { cn } from "@/lib/utils"
import { primitiveSheet, sheetLook } from "./classes"
import { menuDataKey } from "./context"
import MenuItems from "./MenuItems.vue"

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ sideOffset?: number; align?: "start" | "center" | "end" }>(), { sideOffset: 6, align: "start" })
const attrs = useAttrs()
const slots = useSlots()
const rest = computed(() => {
  const { class: _class, style: _style, ...r } = attrs
  return r
})
const names = computed(() => Object.keys(slots).filter((n) => n !== "default"))
const shared = inject(menuDataKey, null)
const speedStyle = useSpeedStyle()
</script>

<template>
  <Part v-bind="rest" :side-offset="props.sideOffset" :align="props.align"
    :class="cn(primitiveSheet, cn(sheetLook, attrs.class as any))" :style="[speedStyle, attrs.style as any]">
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
