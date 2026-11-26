<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { WaterfallRow as Part } from "@ui-sdk/vue/waterfall"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const props = defineProps<{ value: string }>()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const slots = useSlots()
const names = computed(() => Object.keys(slots))
const base = "[--kf-wf-i:attr(aria-posinset_type(<integer>),1)] [--kf-wf-delay:calc((min(var(--kf-wf-i),10)-1)*calc(36ms*var(--kf-speed,1))*var(--kf-flourish,1))] animate-[kf-waterfall-row_calc(420ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_backwards] [animation-delay:var(--kf-wf-delay)] motion-reduce:animate-none! col-span-full grid grid-cols-subgrid items-center gap-x-[var(--waterfall-gap,0.75rem)] px-3 h-[var(--waterfall-height,2rem)] cursor-default hover:bg-foreground/[0.03] data-selected:bg-accent dark:data-selected:bg-accent/70 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
</script>

<template>
  <Part v-bind="rest" :value="props.value" :class="cn(base, attrs.class as any)">
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
