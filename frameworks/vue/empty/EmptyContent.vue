<script setup lang="ts">
/* Each action rises on its own beat after the description. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = "*:animate-[kf-empty-rise_calc(560ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_backwards] *:[animation-delay:calc((230ms+(min(sibling-index(),6)-1)*60ms)*var(--kf-speed,1)*var(--kf-flourish,1))] motion-reduce:*:animate-none flex w-full max-w-[320px] min-w-0 flex-wrap items-center justify-center gap-2 text-[13px]"
</script>

<template>
  <parts.Content v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </parts.Content>
</template>
