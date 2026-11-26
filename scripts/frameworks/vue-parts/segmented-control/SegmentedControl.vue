<script lang="ts">
import type { PartProps } from "@/lib/keyframery"
import type { SegmentedControl as SdkSegmentedControl } from "@ui-sdk/vue/segmented-control"

/* Keyframery's own props (React's names and defaults), handled here; the rest goes to UI SDK as it is. */
type OwnProps = {
  /** How fast the component moves: "fast" (0.6×), "normal" (1×), "slow" (1.4×), or a multiplier like 0.8. */
  speed?: "fast" | "normal" | "slow" | number
}
/** Props of SegmentedControl: everything UI SDK's SegmentedControl takes (its props, its events as on* props, its element's attributes), plus Keyframery's own. */
export type SegmentedControlProps = Omit<PartProps<typeof SdkSegmentedControl>, keyof OwnProps> & OwnProps
</script>

<script setup lang="ts">
/* @@BANNER
   The control draws its own key (the indicator), like the tabs list. Inside the key: a copy of the
   labels in the selected colour, clipped to the key and offset by its moving edges (React:
   Children.map over the items; each copy takes its item's own class). */
import { computed, onBeforeUnmount, onMounted, ref, useAttrs, useSlots } from "vue"
import { SegmentedControl as SegmentedControlPart, SegmentedControlIndicator as SegmentedControlIndicatorPart } from "@ui-sdk/vue/segmented-control"
import { LabelCopies, useSpeed } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const props = defineProps<OwnProps & /* @vue-ignore */ SegmentedControlProps>()
const attrs = useAttrs() as any
/* The speed sits on the control itself (style + provide), no wrapper element. */
const speedStyle = useSpeed(() => props.speed)
const forwarded = computed<any>(() => {
  const { class: _class, ...rest } = attrs
  if (speedStyle.value) return { ...rest, style: [speedStyle.value, rest.style] }
  return rest
})
const slots = useSlots()
const namedSlots = computed(() => Object.keys(slots).filter((name) => name !== "default"))
/* Hold the transitions until UI SDK has measured, so the key is simply there on load. */
const ready = ref(false)
let readyTimer: ReturnType<typeof setTimeout> | undefined
onMounted(() => {
  readyTimer = setTimeout(() => (ready.value = true), 150)
})
onBeforeUnmount(() => clearTimeout(readyTimer))
const root = @@CLASS(SegmentedControl,0,orig)
const key = @@CLASS(SegmentedControl,1,orig)
const clip = @@CLASS(SegmentedControl,2,orig)
const row = @@CLASS(SegmentedControl,3,orig)
const itemBox = @@CONST(ui/segmented-control, itemBox)
</script>

<template>
  <SegmentedControlPart v-bind="forwarded" :class="cn(root, attrs.class as any)">
    <template #default="scope">
      <slot v-bind="scope ?? {}" />
      <SegmentedControlIndicatorPart :data-ready="ready || undefined" :aria-hidden="true" :class="key">
        <span :class="clip">
          <span :data-orientation="attrs.orientation ?? 'horizontal'" :class="row">
            <LabelCopies :nodes="slots.default?.(scope ?? {})" :box-class="itemBox" slot-name="segmented-control-item-copy" child-class />
          </span>
        </span>
      </SegmentedControlIndicatorPart>
    </template>
    <template v-for="name in namedSlots" :key="name" #[name]="s">
      <slot :name="name" v-bind="s ?? {}" />
    </template>
  </SegmentedControlPart>
</template>
