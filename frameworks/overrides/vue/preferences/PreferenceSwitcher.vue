<script setup lang="ts" generic="Value extends string">
/* A segmented control that shows a preference and sets it, one item per value. Its key stretches to the
   value you pick. A global preference is applied to <html> by the switcher itself; for a scoped one,
   wrap the content it styles in `Preferences`. Every other prop goes to the SegmentedControl. */
import type { Preference } from "@ui-sdk/core"
import { computed, useAttrs } from "vue"
import { Preferences, usePreference } from "@ui-sdk/vue/preferences"
import { SegmentedControl, SegmentedControlItem } from "@/components/keyframery/segmented-control"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const props = defineProps<{
  /** The preference to show and set, from `createPreference`. */
  preference: Preference<Value>
  /** What each value is called. A value without a label is shown as written, capitalised (or use the `label` slot). */
  labels?: Partial<Record<Value, string>>
}>()
defineSlots<{ label?: (props: { value: Value }) => any }>()
const attrs = useAttrs()
const rest = computed(() => {
  const { class: _class, style: _style, ...r } = attrs
  return r
})
const state = usePreference(props.preference)
const value = computed(() => (state.value as { value: Value }).value)
const words = (value: string) => value.replace(/[-_]+/g, " ").replace(/^./, (first) => first.toUpperCase())
function onValueChange(next: unknown, details: { event?: Event }) {
  if (next) props.preference.set(next as Value, { reason: "press", event: details?.event } as never)
}
const theme = {
  "--segmented-control-track": "var(--preferences-track,var(--muted))",
  "--segmented-control-key": "var(--preferences-key,var(--kf-preferences-key))",
  "--segmented-control-ink": "var(--preferences-ink,var(--muted-foreground))",
  "--segmented-control-selected-ink": "var(--preferences-selected-ink,var(--foreground))",
  "--segmented-control-height": "var(--preferences-height,2rem)",
  "--segmented-control-radius": "var(--preferences-radius,12px)",
  "--segmented-control-key-radius": "var(--preferences-key-radius,9px)",
  "--segmented-control-gap": "var(--preferences-gap,0.125rem)",
}
const appearance = "[--kf-preferences-key:var(--background)] dark:[--kf-preferences-key:var(--accent)]"
</script>

<template>
  <Preferences v-if="props.preference.global" :preferences="[props.preference]">
    <SegmentedControl v-bind="rest" :value="value" :class="cn(appearance, attrs.class as any)" :style="[theme, attrs.style as any]" @value-change="onValueChange">
      <SegmentedControlItem v-for="option in props.preference.values" :key="option" :value="option">
        <slot name="label" :value="option">{{ props.labels?.[option] ?? words(option) }}</slot>
      </SegmentedControlItem>
    </SegmentedControl>
  </Preferences>
  <SegmentedControl v-else v-bind="rest" :value="value" :class="cn(appearance, attrs.class as any)" :style="[theme, attrs.style as any]" @value-change="onValueChange">
    <SegmentedControlItem v-for="option in props.preference.values" :key="option" :value="option">
      <slot name="label" :value="option">{{ props.labels?.[option] ?? words(option) }}</slot>
    </SegmentedControlItem>
  </SegmentedControl>
</template>
