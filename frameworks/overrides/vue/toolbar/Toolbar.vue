<script setup lang="ts">
/* The bar. Glide: one highlight rests on the button, link or toggle under the pointer (or with keyboard
   focus) and glides to the next one; it is the bar's `::before`. Colours ease as the pointer arrives; a
   press springs back with a pop. */
import { computed, provide, useAttrs, useSlots } from "vue"
import { Toolbar as Part } from "@ui-sdk/vue/toolbar"
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

/* Everything the highlight can rest on. Inputs keep their own field look. */
const ITEM = '[data-slot="toolbar-button"],[data-slot="toolbar-link"],[data-slot="toggle"]'
const MARK = "data-kf-toolbar-hl"
/* Moves the mark to `item`, or hides the highlight where it is (so it can glide on from there). */
function mark(root: HTMLElement, item: Element | null) {
  if (!item || item.hasAttribute("data-disabled")) {
    root.setAttribute("data-kf-idle", "")
    return
  }
  for (const old of root.querySelectorAll(`[${MARK}]`)) if (old !== item) old.removeAttribute(MARK)
  item.setAttribute(MARK, "")
  root.removeAttribute("data-kf-idle")
  /* The first time, the highlight appears in place; from then on it glides. */
  if (!root.hasAttribute("data-kf-glide")) setTimeout(() => root.setAttribute("data-kf-glide", ""), 40)
}
function itemFrom(root: HTMLElement, target: EventTarget | null) {
  const item = target instanceof Element ? target.closest(ITEM) : null
  return item && root.contains(item) ? item : null
}
let hovering = false
function onPointerOver(event: PointerEvent) {
  hovering = true
  const root = event.currentTarget as HTMLElement
  const item = itemFrom(root, event.target)
  if (item) mark(root, item)
}
function onPointerLeave(event: PointerEvent) {
  hovering = false
  const root = event.currentTarget as HTMLElement
  mark(root, itemFrom(root, root.querySelector(":focus-visible")))
}
function onFocusIn(event: FocusEvent) {
  const root = event.currentTarget as HTMLElement
  const target = event.target as Element
  if (target.matches(":focus-visible")) mark(root, itemFrom(root, target))
}
function onFocusOut(event: FocusEvent) {
  const root = event.currentTarget as HTMLElement
  if (!hovering && !root.contains(event.relatedTarget as Node | null)) mark(root, null)
}
function onClick(event: MouseEvent) {
  const root = event.currentTarget as HTMLElement
  const item = itemFrom(root, event.target)
  if (item) mark(root, item)
}

const base = cn(
  cn(
    "relative isolate [anchor-scope:--kf-toolbar-hl]",
    "[&_[data-kf-toolbar-hl]]:[anchor-name:--kf-toolbar-hl]",
    "before:pointer-events-none before:absolute before:-z-10 before:bg-[color-mix(in_oklch,currentColor_9%,transparent)]",
    "before:[position-anchor:--kf-toolbar-hl] before:top-[anchor(top)] before:right-[anchor(right)] before:bottom-[anchor(bottom)] before:left-[anchor(left)]",
    "before:scale-100 before:opacity-100 before:transition-[opacity,scale] before:duration-[calc(200ms*var(--kf-speed,1))] before:ease-house",
    "data-kf-glide:before:[transition:top_calc(360ms*var(--kf-speed,1))_var(--ease-spring),right_calc(360ms*var(--kf-speed,1))_var(--ease-spring),bottom_calc(360ms*var(--kf-speed,1))_var(--ease-spring),left_calc(360ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(200ms*var(--kf-speed,1))_var(--ease-house),scale_calc(200ms*var(--kf-speed,1))_var(--ease-house)]",
    "data-kf-idle:before:scale-[calc(1-0.08*var(--kf-flourish,1))] data-kf-idle:before:opacity-0 not-has-[[data-kf-toolbar-hl]]:before:opacity-0",
    "motion-reduce:before:[transition:none]!",
  ),
  cn(
    "flex items-center gap-[var(--toolbar-gap,0.125rem)] data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
    "w-fit rounded-[var(--toolbar-radius,12px)] bg-[var(--toolbar-face,var(--popover))] p-1 text-[color:var(--toolbar-ink,var(--popover-foreground))]",
    "before:rounded-[var(--toolbar-item-radius,8px)] before:bg-[var(--toolbar-accent,var(--accent))] dark:before:bg-[color-mix(in_oklab,var(--toolbar-accent,var(--accent))_70%,transparent)]",
    "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_6px_-2px_rgb(0_0_0/0.08),0_12px_32px_-8px_rgb(0_0_0/0.18)]",
    "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_12px_32px_-8px_rgb(0_0_0/0.7)]",
  ),
)
</script>

<template>
  <Part v-bind="rest" :class="cn(base, attrs.class as any)" :style="style"
    @pointerover="onPointerOver" @pointerleave="onPointerLeave" @focusin="onFocusIn" @focusout="onFocusOut" @click="onClick">
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
