<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { TimeInputSegment as Part, type TimeInputSegmentData } from "@ui-sdk/vue/time-input"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const props = defineProps<{ segment: TimeInputSegmentData }>()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const slots = useSlots()
const names = computed(() => Object.keys(slots))
const base = "first:[anchor-name:--kf-seg-rest] focus:[anchor-name:--kf-seg] first:focus:[anchor-name:--kf-seg,--kf-seg-rest] h-6 rounded-[var(--time-input-segment-radius,6px)] bg-transparent px-[3px] text-center text-[13px] leading-none font-medium text-[color:var(--time-input-ink,var(--foreground))] tabular-nums outline-none [field-sizing:content] caret-transparent selection:bg-transparent data-[type=day]:min-w-[calc(2ch+6px)] data-[type=month]:min-w-[calc(2ch+6px)] data-[type=hour]:min-w-[calc(2ch+6px)] data-[type=minute]:min-w-[calc(2ch+6px)] data-[type=second]:min-w-[calc(2ch+6px)] data-[type=year]:min-w-[calc(4ch+6px)] data-[type=dayPeriod]:min-w-[calc(2.2em+6px)] transition-colors duration-[calc(150ms*var(--kf-speed,1))] motion-reduce:transition-none! focus:text-[color:var(--time-input-ink,var(--accent-foreground))] placeholder:text-muted-foreground/70 data-empty:text-muted-foreground/70 data-[type=literal]:flex data-[type=literal]:items-center data-[type=literal]:px-px data-[type=literal]:font-normal data-[type=literal]:text-muted-foreground/70 data-[type=dayPeriod]:ml-1 data-[type=dayPeriod]:uppercase data-invalid:not-data-[type=literal]:text-destructive data-disabled:pointer-events-none data-disabled:text-[color:var(--time-input-ink,var(--muted-foreground))]"
</script>

<template>
  <Part v-bind="rest" :segment="props.segment" :class="cn(base, attrs.class as any)">
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
