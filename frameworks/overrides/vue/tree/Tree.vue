<script setup lang="ts">
/* The tree. Glide: the selected row's key springs from row to row when the selection moves; it is the
   tree's `::after`. A lighter hover highlight glides under the pointer and keyboard focus as the tree's
   `::before`. Without content it renders its rows from `items` or `paths`. */
import { computed, onBeforeUnmount, onMounted, provide, ref, useAttrs, useSlots } from "vue"
import { Tree as Part, treeFromPaths, type TreeItemData } from "@ui-sdk/vue/tree"
import { speedKey, speedValue, type Speed } from "@/lib/keyframery"
import { cn } from "@/lib/utils"
import { checkableKey } from "./context"
import TreeItems from "./TreeItems.vue"

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

const on = (v: unknown) => v !== undefined && v !== false && v !== null
provide(checkableKey, computed(() => on(attrs.checkable)))
const data = computed<TreeItemData[] | undefined>(
  () => (attrs.items as TreeItemData[] | undefined) ?? (attrs.paths ? treeFromPaths(attrs.paths as string[]) : undefined),
)

/* Hold the selection's glide until the rows are laid out, so the key is simply there on load. */
const ready = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
onMounted(() => (timer = setTimeout(() => (ready.value = true), 150)))
onBeforeUnmount(() => clearTimeout(timer))

const ROW = '[data-slot="tree-label"]'
const MARK = "data-kf-tree-hl"
/* Moves the hover mark to `row`, or hides the highlight where it is (so it can glide on from there). */
function mark(root: HTMLElement, row: Element | null) {
  if (!row || row.hasAttribute("data-disabled")) {
    root.setAttribute("data-kf-idle", "")
    return
  }
  for (const old of root.querySelectorAll(`[${MARK}]`)) if (old !== row) old.removeAttribute(MARK)
  row.setAttribute(MARK, "")
  root.removeAttribute("data-kf-idle")
  if (!root.hasAttribute("data-kf-glide")) setTimeout(() => root.setAttribute("data-kf-glide", ""), 40)
}
/* The row under the pointer, or the row of the focused item (focus stays on the item). */
function rowFrom(root: HTMLElement, target: EventTarget | null) {
  if (!(target instanceof Element)) return null
  const row = target.closest(ROW) ?? (target.matches('[data-slot="tree-item"]') ? target.querySelector(`:scope > ${ROW}`) : null)
  return row && root.contains(row) ? row : null
}
let hovering = false
function onPointerOver(event: PointerEvent) {
  hovering = true
  const root = event.currentTarget as HTMLElement
  const row = rowFrom(root, event.target)
  if (row) mark(root, row)
}
function onPointerLeave(event: PointerEvent) {
  hovering = false
  const root = event.currentTarget as HTMLElement
  mark(root, rowFrom(root, root.querySelector(":focus-visible")))
}
function onFocusIn(event: FocusEvent) {
  const root = event.currentTarget as HTMLElement
  const target = event.target as Element
  if (!hovering && target.matches(":focus-visible")) mark(root, rowFrom(root, target))
}
function onFocusOut(event: FocusEvent) {
  const root = event.currentTarget as HTMLElement
  if (!hovering && !root.contains(event.relatedTarget as Node | null)) mark(root, null)
}

const base = cn(
  cn(
    "relative isolate [anchor-scope:--kf-tree-hl,--kf-tree-sel]",
    "[&_[data-kf-tree-hl]]:[anchor-name:--kf-tree-hl]",
    "[&_[data-slot=tree-label]:is([data-selected],[data-current])]:[anchor-name:--kf-tree-sel]",
    "[&_[data-slot=tree-label][data-kf-tree-hl]:is([data-selected],[data-current])]:[anchor-name:--kf-tree-hl,--kf-tree-sel]",
    "before:pointer-events-none before:absolute before:-z-10 before:bg-[color-mix(in_oklch,currentColor_6%,transparent)]",
    "before:[position-anchor:--kf-tree-hl] before:top-[anchor(top)] before:right-[anchor(right)] before:bottom-[anchor(bottom)] before:left-[anchor(left)]",
    "before:transition-[opacity,scale] before:duration-[calc(200ms*var(--kf-speed,1))] before:ease-house",
    "data-kf-glide:before:[transition:top_calc(360ms*var(--kf-speed,1))_var(--ease-spring),right_calc(360ms*var(--kf-speed,1))_var(--ease-spring),bottom_calc(360ms*var(--kf-speed,1))_var(--ease-spring),left_calc(360ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(200ms*var(--kf-speed,1))_var(--ease-house),scale_calc(200ms*var(--kf-speed,1))_var(--ease-house)]",
    "data-kf-idle:before:scale-[0.96] data-kf-idle:before:opacity-0 not-has-[[data-kf-tree-hl]]:before:opacity-0",
    "after:pointer-events-none after:absolute after:-z-10 after:bg-[color-mix(in_oklch,currentColor_10%,transparent)]",
    "after:[position-anchor:--kf-tree-sel] after:top-[anchor(top)] after:right-[anchor(right)] after:bottom-[anchor(bottom)] after:left-[anchor(left)]",
    "after:transition-[opacity] after:duration-[calc(200ms*var(--kf-speed,1))] after:ease-house",
    "data-kf-ready:after:[transition:top_calc(380ms*var(--kf-speed,1))_var(--ease-spring),right_calc(380ms*var(--kf-speed,1))_var(--ease-spring),bottom_calc(380ms*var(--kf-speed,1))_var(--ease-spring),left_calc(380ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(200ms*var(--kf-speed,1))_var(--ease-house)]",
    "not-has-[[data-slot=tree-label]:is([data-selected],[data-current])]:after:opacity-0",
    "has-[[data-ending-style]_[data-slot=tree-label]:is([data-selected],[data-current])]:after:opacity-0",
    "motion-reduce:before:[transition:none]! motion-reduce:after:[transition:none]!",
  ),
  cn(
    "flex min-w-0 flex-col text-[13px] outline-none",
    "before:rounded-[var(--tree-radius,8px)] before:bg-[color-mix(in_oklab,var(--tree-accent,var(--accent))_45%,transparent)] dark:before:bg-[color-mix(in_oklab,var(--tree-accent,var(--accent))_40%,transparent)]",
    "after:rounded-[var(--tree-radius,8px)] after:bg-[var(--tree-accent,var(--accent))] dark:after:bg-[var(--tree-accent,var(--accent))]",
  ),
)
</script>

<template>
  <Part v-bind="rest" :data-kf-ready="ready || undefined" :class="cn(base, attrs.class as any)" :style="style"
    @pointerover="onPointerOver" @pointerleave="onPointerLeave" @focusin="onFocusIn" @focusout="onFocusOut">
    <template #default="s">
      <slot v-bind="s ?? {}">
        <TreeItems v-if="data" :items="data" />
      </slot>
    </template>
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
