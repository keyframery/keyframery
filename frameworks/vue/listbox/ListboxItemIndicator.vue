<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { ListboxItemIndicator as Part } from "@ui-sdk/vue/listbox"
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
const base = "[&_:is(path,polyline)]:[stroke-dasharray:24] [&_:is(path,polyline)]:[stroke-dashoffset:24] [&_:is(path,polyline)]:transition-[stroke-dashoffset] [&_:is(path,polyline)]:duration-[calc(260ms*var(--kf-speed,1)*var(--kf-flourish,1))] [&_:is(path,polyline)]:ease-house data-selected:[&_:is(path,polyline)]:[stroke-dashoffset:0] data-selected:[&_:is(path,polyline)]:delay-[calc(75ms*var(--kf-speed,1)*var(--kf-flourish,1))] data-selected:[&_:is(path,polyline)]:starting:[stroke-dashoffset:24] group-data-kf-ready/kf-lb:data-selected:[animation:kf-pop-in_calc(380ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-pop)] motion-reduce:[&_:is(path,polyline)]:transition-none motion-reduce:animate-none! ms-auto grid size-4 shrink-0 place-items-center text-[color:var(--listbox-ink,var(--foreground))] [&_svg]:size-4 group-aria-multiselectable/listbox:rounded-[5px] group-aria-multiselectable/listbox:text-primary-foreground group-aria-multiselectable/listbox:[&_svg]:size-3 group-aria-multiselectable/listbox:shadow-[inset_0_0_0_1px_rgb(0_0_0/0.18)] dark:group-aria-multiselectable/listbox:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.2)] group-aria-multiselectable/listbox:transition-[background-color,box-shadow] group-aria-multiselectable/listbox:duration-[calc(150ms*var(--kf-speed,1))] group-aria-multiselectable/listbox:data-selected:bg-[var(--listbox-selected,var(--primary))] group-aria-multiselectable/listbox:data-selected:shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.2)] dark:group-aria-multiselectable/listbox:data-selected:shadow-[inset_0_1px_0_rgb(255_255_255/0.6)] group-aria-multiselectable/listbox:[&_svg]:[stroke-width:2] group-data-disabled/item:opacity-50 motion-reduce:transition-none!"
</script>

<template>
  <Part v-bind="rest" :keep-mounted="props.keepMounted" :class="cn(base, attrs.class as any)">
    <template #default="s">
      <slot v-bind="s ?? {}">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m3.5 8.5 3 3 6-7" />
      </svg>
      </slot>
    </template>
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
