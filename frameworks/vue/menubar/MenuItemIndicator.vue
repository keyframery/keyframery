<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { MenuItemIndicator as Part } from "@ui-sdk/vue/menu"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const props = withDefaults(defineProps<{ keepMounted?: boolean }>(), { keepMounted: true })
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const slots = useSlots()
const names = computed(() => Object.keys(slots).filter((n) => n !== 'default'))
const base = "[&_:is(path,polyline)]:[stroke-dasharray:24] [&_:is(path,polyline)]:[stroke-dashoffset:24] [&_:is(path,polyline)]:transition-[stroke-dashoffset] [&_:is(path,polyline)]:duration-[calc(260ms*var(--kf-speed,1)*var(--kf-flourish,1))] [&_:is(path,polyline)]:ease-house data-checked:[&_:is(path,polyline)]:[stroke-dashoffset:0] data-checked:[&_:is(path,polyline)]:delay-[calc(100ms*var(--kf-speed,1)*var(--kf-flourish,1))] data-checked:[&_:is(path,polyline)]:starting:[stroke-dashoffset:24] group-data-starting-style/kf-menu:[&_:is(path,polyline)]:[stroke-dashoffset:24]! motion-reduce:[&_:is(path,polyline)]:transition-none order-last ms-auto flex size-4 shrink-0 items-center justify-center ps-0 [&>svg]:size-4"
</script>

<template>
  <Part v-bind="rest" :keep-mounted="props.keepMounted" :class="cn(base, attrs.class as any)">
    <template #default="s">
      <slot v-bind="s ?? {}">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="size-4">
        <path d="m3.5 8.5 3 3 6-7" />
      </svg>
      </slot>
    </template>
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
