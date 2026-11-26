<script setup lang="ts">
/* Bubbles from one sender: each arrives a beat after the one above it, and the corners between them tuck in. */
import { computed, useAttrs } from "vue"

import { Speed, type Speed as SpeedValue } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

import { groupParts as parts } from "./parts"

defineOptions({ inheritAttrs: false })
const props = defineProps<{ speed?: SpeedValue }>()
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = "*:data-[slot=bubble]:[transition-delay:calc((min(sibling-index(),6)-1)*90ms*var(--kf-speed,1)*var(--kf-flourish,1))] flex min-w-0 flex-col gap-1 *:data-[align=start]:not-first:*:data-[slot=bubble-content]:rounded-ss-[4px] *:data-[align=start]:not-last:*:data-[slot=bubble-content]:rounded-es-[4px] *:data-[align=end]:not-first:*:data-[slot=bubble-content]:rounded-se-[4px] *:data-[align=end]:not-last:*:data-[slot=bubble-content]:rounded-ee-[4px]"
</script>

<template>
  <Speed :speed="props.speed">
    <parts.Root v-bind="forwarded" :class="cn(base, attrs.class as any)">
      <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
    </parts.Root>
  </Speed>
</template>
