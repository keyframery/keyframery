<script setup lang="ts">
import { computed, provide, useAttrs, useSlots } from "vue"
import { Pagination as Part } from "@ui-sdk/vue/pagination"
import { speedKey, speedValue, type Speed } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const props = defineProps<{ speed?: Speed }>()
const attrs = useAttrs()
const slots = useSlots()
const rest = computed(() => {
  const { class: _class, style: _style, ...r } = attrs
  return r
})
const names = computed(() => Object.keys(slots))
const speed = computed(() => speedValue(props.speed))
provide(speedKey, speed)
const style = computed(() => [attrs.style as any, speed.value === undefined ? undefined : { "--kf-speed": speed.value }])
</script>

<template>
  <Part v-bind="rest" :class="cn('flex w-fit', attrs.class as any)" :style="style">
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
