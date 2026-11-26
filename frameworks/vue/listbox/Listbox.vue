<script setup lang="ts">
/* The frame is a field that holds rows; it takes the field's focus ring while a row inside has keyboard
   focus. Glide: one highlight springs from row to row (CSS anchors), to the row under the pointer or the
   focused row. Without content, the root's `items` render as styled rows. */
import { computed, onBeforeUnmount, onMounted, provide, ref, useAttrs, useSlots } from "vue"
import { Listbox as Part } from "@ui-sdk/vue/listbox"
import { speedKey, speedValue, type Speed } from "@/lib/keyframery"
import { cn } from "@/lib/utils"
import ListboxItems from "./ListboxItems.vue"

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

/* Hold the pop until after the first paint, so chosen rows don't pop on load. */
const ready = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
onMounted(() => (timer = setTimeout(() => (ready.value = true), 150)))
onBeforeUnmount(() => clearTimeout(timer))

const base = cn(
  cn(
    "group/kf-lb relative isolate [anchor-scope:--kf-hl]",
    "before:pointer-events-none before:absolute before:-z-10 before:hidden before:bg-[color-mix(in_oklch,currentColor_9%,transparent)]",
    "before:[position-anchor:--kf-hl] before:top-[anchor(top)] before:right-[anchor(right)] before:bottom-[anchor(bottom)] before:left-[anchor(left)]",
    "before:[transition:top_calc(260ms*var(--kf-speed,1))_var(--ease-spring),right_calc(260ms*var(--kf-speed,1))_var(--ease-spring),bottom_calc(260ms*var(--kf-speed,1))_var(--ease-spring),left_calc(260ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(150ms*var(--kf-speed,1))_var(--ease-house)]",
    "has-[[data-slot=listbox-item]:hover]:before:block focus-within:has-[[data-highlighted]]:before:block starting:before:opacity-0",
    "motion-reduce:before:[transition:none]!",
  ),
  cn(
    "group/listbox flex max-h-72 flex-col gap-px overflow-y-auto overscroll-contain rounded-[var(--listbox-radius,12px)] bg-[var(--listbox-surface,var(--background))] p-1.5 text-[13px] outline-none scroll-py-1.5",
    "data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:overflow-x-auto data-[orientation=horizontal]:overflow-y-hidden",
    "shadow-[0_0_0_1px_rgb(0_0_0/0.09),0_1px_2px_rgb(0_0_0/0.05)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1)]",
    "transition-shadow duration-[calc(150ms*var(--kf-speed,1))] motion-reduce:transition-none!",
    "before:rounded-[var(--listbox-item-radius,8px)] before:bg-[var(--listbox-highlight,var(--accent))]",
    "hover:shadow-[0_0_0_1px_rgb(0_0_0/0.16),0_1px_2px_rgb(0_0_0/0.05)] dark:hover:shadow-[0_0_0_1px_rgb(255_255_255/0.16)]",
    "has-focus-visible:shadow-[0_0_0_1px_var(--ring)] has-focus-visible:ring-[3px] has-focus-visible:ring-ring/25 dark:has-focus-visible:shadow-[0_0_0_1px_var(--ring)]",
    "focus-visible:shadow-[0_0_0_1px_var(--ring)] focus-visible:ring-[3px] focus-visible:ring-ring/25 dark:focus-visible:shadow-[0_0_0_1px_var(--ring)]",
    "aria-invalid:shadow-[0_0_0_1px_var(--destructive)] dark:aria-invalid:shadow-[0_0_0_1px_var(--destructive)]",
    "data-disabled:cursor-not-allowed data-disabled:opacity-50 data-readonly:bg-muted/40",
  ),
)
</script>

<template>
  <Part v-bind="rest" :data-kf-ready="ready || undefined" :class="cn(base, attrs.class as any)" :style="style">
    <template v-if="$slots.default || attrs.items" #default="s">
      <slot v-bind="s ?? {}">
        <ListboxItems :items="s.state.items" />
      </slot>
    </template>
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>

<style>
/* kf-listbox-pop: the keyframes this part animates with (React's <style href="kf-listbox-pop">), shipped with the component. */
@keyframes kf-pop-in{from{scale:0.6}}
</style>
