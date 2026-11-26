<script setup lang="ts">
/* A shortcut: a row of keys that sink together (`pressed`) or follow the real keyboard (`listen`). */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"
import KbdComboKey from "./KbdComboKey.vue"
import { kbdKey, KbdComboRoot } from "./parts"

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    /** The keys, in order: names like "mod", "shift", "alt", "enter", "escape", or a character. */
    keys: string[]
    /** Sinks every key, one after another. */
    pressed?: boolean
    /** Sinks each key while it is held on the real keyboard. */
    listen?: boolean
    /** Class names for each key. */
    kbdClassName?: string
  }>(),
  { pressed: undefined, listen: undefined },
)
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
/* In sequence: each key sinks a beat after the one before it; all pop back together. The stagger
   scales with --kf-flourish. */
const base = cn(
  "inline-flex items-center",
  "data-pressed:[&>[data-slot=kbd-combo-key]]:[transition-delay:calc((min(sibling-index(),6)-1)*calc(70ms*var(--kf-speed,1))*var(--kf-flourish,1))]",
  "gap-1",
)
const keyClass = computed(() => cn(kbdKey, props.kbdClassName))
</script>

<template>
  <KbdComboRoot v-bind="forwarded" :keys="keys" :pressed="pressed" :listen="listen" :class="cn(base, attrs.class as any)">
    <template #default="scope">
      <slot v-bind="scope">
        <KbdComboKey v-for="key in keys" :key="key" :value="key" :class="keyClass" />
      </slot>
    </template>
  </KbdComboRoot>
</template>
