<script setup lang="ts">
/* An opened fold: grows from the fold row's height (`--diff-fold-height`) to its lines, which fade in. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const props = defineProps<{ value: string }>()
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = cn(
  "grid grid-rows-[1fr] starting:grid-rows-[0fr] starting:min-h-[var(--diff-fold-height,2rem)]",
  "transition-[grid-template-rows,min-height] duration-[calc(380ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none",
)
</script>

<template>
  <parts.Expanded :value="props.value" v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template #default="scope">
      <div
        data-slot="diff-viewer-expanded-lines"
        class="min-h-0 overflow-hidden opacity-100 transition-opacity delay-[calc(60ms*var(--kf-speed,1))] duration-[calc(320ms*var(--kf-speed,1))] ease-house starting:opacity-0 motion-reduce:transition-none"
      >
        <slot v-bind="scope ?? {}" />
      </div>
    </template>
  </parts.Expanded>
</template>
