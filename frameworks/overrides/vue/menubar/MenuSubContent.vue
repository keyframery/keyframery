<script setup lang="ts">
/* A submenu's sheet: the same unfold, cascade and glide as the menu. */
import { computed, useAttrs, useSlots } from "vue"
import { MenuSubContent as Part } from "@ui-sdk/vue/menu"
import { useSpeedStyle } from "@/lib/keyframery"
import { cn } from "@/lib/utils"
import { primitiveSheet, sheetLook } from "./classes"

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ sideOffset?: number }>(), { sideOffset: 8 })
const attrs = useAttrs()
const slots = useSlots()
const rest = computed(() => {
  const { class: _class, style: _style, ...r } = attrs
  return r
})
const names = computed(() => Object.keys(slots))
const speedStyle = useSpeedStyle()
</script>

<template>
  <Part v-bind="rest" :side-offset="props.sideOffset" :class="cn(primitiveSheet, cn(sheetLook, attrs.class as any))" :style="[speedStyle, attrs.style as any]">
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
