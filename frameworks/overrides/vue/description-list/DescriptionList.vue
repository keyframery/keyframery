<script setup lang="ts">
/* Animated description list on UI SDK's core (src/components/primitives/description-list.tsx) with the Keyframery look (src/components/ui/description-list.tsx):
   a dl of items, each a dt and a dd. layout rows (default) | stacked | grid, columns, truncate.
   - Cascade: items arrive one after another when the list first shows (40ms apart, up to twelve).
   - Press: the copy button sinks and springs back; copied, its icon shrinks into a blur and a check draws itself.
   The cascade, the press, the shrink and blur and the check's drawing scale with --kf-flourish. */
import { computed, useAttrs } from "vue"

import { Speed, type Speed as SpeedValue } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ speed?: SpeedValue; layout?: "rows" | "stacked" | "grid"; columns?: number; truncate?: boolean }>(), { truncate: undefined })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = "@container/dl grid w-full min-w-0 text-[length:var(--description-list-font,13px)] leading-[1.45] data-[layout=grid]:gap-x-8 data-[layout=grid]:gap-y-1 data-[layout=grid]:grid-cols-[repeat(auto-fill,minmax(max(11rem,calc((100%-(var(--description-list-columns,2)-1)*2rem)/var(--description-list-columns,2))),1fr))]"
</script>

<template>
  <Speed :speed="props.speed">
    <parts.Root :layout="props.layout" :columns="props.columns" :truncate="props.truncate" v-bind="forwarded" :class="cn(base, attrs.class as any)">
      <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
    </parts.Root>
  </Speed>
</template>

<style>
@keyframes kf-dl-in { from { opacity: 0; translate: 0 6px; filter: blur(4px) } }
@keyframes kf-dl-tick { from { stroke-dashoffset: 1 } }
[data-slot=description-list]>[data-slot=description-list-item]:nth-of-type(1){--kf-dl:0}
[data-slot=description-list]>[data-slot=description-list-item]:nth-of-type(2){--kf-dl:1}
[data-slot=description-list]>[data-slot=description-list-item]:nth-of-type(3){--kf-dl:2}
[data-slot=description-list]>[data-slot=description-list-item]:nth-of-type(4){--kf-dl:3}
[data-slot=description-list]>[data-slot=description-list-item]:nth-of-type(5){--kf-dl:4}
[data-slot=description-list]>[data-slot=description-list-item]:nth-of-type(6){--kf-dl:5}
[data-slot=description-list]>[data-slot=description-list-item]:nth-of-type(7){--kf-dl:6}
[data-slot=description-list]>[data-slot=description-list-item]:nth-of-type(8){--kf-dl:7}
[data-slot=description-list]>[data-slot=description-list-item]:nth-of-type(9){--kf-dl:8}
[data-slot=description-list]>[data-slot=description-list-item]:nth-of-type(10){--kf-dl:9}
[data-slot=description-list]>[data-slot=description-list-item]:nth-of-type(11){--kf-dl:10}
[data-slot=description-list]>[data-slot=description-list-item]:nth-of-type(12){--kf-dl:11}
[data-slot=description-list]>[data-slot=description-list-item]:nth-of-type(n+13){--kf-dl:12}
</style>
