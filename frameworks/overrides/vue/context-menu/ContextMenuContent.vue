<script setup lang="ts">
/* Opens right at the pointer, so only a hair of offset, and unfolds straight out of it. */
import { computed, useAttrs, useSlots } from "vue"
import { MenuContent } from "@/components/keyframery/menu"
import { useSpeedStyle } from "@/lib/keyframery"
import { cn } from "@/lib/utils"
import { contextMenuMotion, contextTheme } from "./classes"

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ sideOffset?: number }>(), { sideOffset: 2 })
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
  <MenuContent v-bind="rest" :side-offset="props.sideOffset" :class="cn(cn(contextMenuMotion, contextTheme), attrs.class as any)" :style="[speedStyle, attrs.style as any]">
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </MenuContent>
</template>
