<script setup lang="ts">
/* The field. The ring follows whichever segment has focus; invalid wins over focus.
   Glide: one highlight sits under the segment with focus and glides to the next segment as focus moves,
   typed or tabbed. It is the root's `before:`; give it your own colour and radius with `before:` classes. */
import { computed, provide, useAttrs, useSlots } from "vue"
import { TimeInput as Part } from "@ui-sdk/vue/time-input"
import { speedKey, speedValue, type Speed } from "@/lib/keyframery"
import { cn } from "@/lib/utils"
import TimeInputSegment from "./TimeInputSegment.vue"

defineOptions({ inheritAttrs: false })
const props = defineProps<{ speed?: Speed }>()
const attrs = useAttrs()
const slots = useSlots()
const rest = computed(() => {
  const { class: _class, style: _style, ...r } = attrs
  return r
})
const names = computed(() => Object.keys(slots).filter((n) => n !== "default"))
const speed = computed(() => speedValue(props.speed))
provide(speedKey, speed)
const style = computed(() => [attrs.style as any, speed.value === undefined ? undefined : { "--kf-speed": speed.value }])
const base = "relative isolate [anchor-scope:--kf-seg,--kf-seg-rest] before:pointer-events-none before:absolute before:-z-10 before:opacity-0 before:content-[''] before:[position-anchor:--kf-seg] before:top-[anchor(--kf-seg_top,anchor(--kf-seg-rest_top))] before:right-[anchor(--kf-seg_right,anchor(--kf-seg-rest_right))] before:bottom-[anchor(--kf-seg_bottom,anchor(--kf-seg-rest_bottom))] before:left-[anchor(--kf-seg_left,anchor(--kf-seg-rest_left))] before:[transition:top_calc(280ms*var(--kf-speed,1))_var(--ease-spring),right_calc(280ms*var(--kf-speed,1))_var(--ease-spring),bottom_calc(280ms*var(--kf-speed,1))_var(--ease-spring),left_calc(280ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(160ms*var(--kf-speed,1))_var(--ease-house)] has-[input:focus]:before:opacity-100 motion-reduce:before:[transition:none]! rounded-[var(--time-input-radius,10px)] bg-[var(--time-input-face,var(--background))] text-[13px] [--field-line:rgb(0_0_0/0.09)] dark:[--field-line:rgb(255_255_255/0.1)] shadow-[0_0_0_1px_var(--field-line),0_1px_2px_rgb(0_0_0/0.05)] dark:shadow-[0_0_0_1px_var(--field-line)] transition-[box-shadow,background-color] duration-[calc(150ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none! hover:[--field-line:rgb(0_0_0/0.16)] dark:hover:[--field-line:rgb(255_255_255/0.18)] inline-flex h-[var(--time-input-height,2.25rem)] w-fit min-w-0 cursor-text items-center px-2 text-[color:var(--time-input-ink,var(--foreground))] tabular-nums has-[input:focus-visible]:ring-[3px] has-[input:focus-visible]:ring-ring/25 has-[input:focus-visible]:[--field-line:var(--ring)] dark:has-[input:focus-visible]:[--field-line:var(--ring)] data-invalid:ring-destructive/25! data-invalid:[--field-line:var(--destructive)]! data-readonly:bg-[var(--time-input-face,color-mix(in_oklab,var(--muted)_50%,transparent))] before:rounded-[var(--time-input-segment-radius,6px)] before:bg-[var(--time-input-accent,var(--accent))] data-disabled:cursor-not-allowed data-disabled:bg-[var(--time-input-face,var(--muted))] data-disabled:text-[color:var(--time-input-ink,var(--muted-foreground))] data-disabled:[--field-line:rgb(0_0_0/0.06)] dark:data-disabled:[--field-line:rgb(255_255_255/0.06)]"
</script>

<template>
  <Part v-bind="rest" :class="cn(base, attrs.class as any)" :style="style">
    <template #default="s">
      <slot v-bind="s ?? {}">
        <TimeInputSegment v-for="segment in s.state.segments" :key="segment.key" :segment="segment" />
      </slot>
    </template>
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
