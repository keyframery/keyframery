<script setup lang="ts">
/* A sheet laid out as a grid; every row is a subgrid, so columns line up. Set the columns with a
   `grid-cols-[…]` class: the default is a name column and a timeline. */
import { computed, provide, useAttrs, useSlots } from "vue"
import { Waterfall as Part, type WaterfallData } from "@ui-sdk/vue/waterfall"
import { speedKey, speedValue, type Speed } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const props = defineProps<{ speed?: Speed; items: WaterfallData }>()
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
const base = cn(
  "relative grid grid-cols-[minmax(8rem,auto)_minmax(0,1fr)] overflow-hidden rounded-[var(--waterfall-radius,14px)] bg-[var(--waterfall-face,var(--card))] py-1 text-[12.5px] text-[color:var(--waterfall-ink,var(--card-foreground))]",
  "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_6px_-2px_rgb(0_0_0/0.08),0_12px_32px_-8px_rgb(0_0_0/0.12)]",
  "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_12px_32px_-8px_rgb(0_0_0/0.7)]",
)
</script>

<template>
  <Part v-bind="rest" :items="props.items" :class="cn(base, attrs.class as any)" :style="style">
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>

<style>
/* kf-waterfall: the keyframes this part animates with (React's <style href="kf-waterfall">), shipped with the component. */
@keyframes kf-waterfall-row{from{opacity:0;translate:0 6px;filter:blur(3px)}}@keyframes kf-waterfall-bar{from{scale:0 1}}@keyframes kf-waterfall-mark{from{opacity:0;clip-path:inset(0 0 100% 0)}}
</style>
