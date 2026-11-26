<script setup lang="ts">
/* Inside the header the title leads the description. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = "[&>*]:animate-[kf-card-part_calc(560ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_backwards] motion-reduce:[&>*]:animate-none [&>*]:[animation-delay:calc(calc(110ms*var(--kf-speed,1)*var(--kf-flourish,1))+(min(sibling-index(),10)-1)*calc(60ms*var(--kf-speed,1)*var(--kf-flourish,1)))] grid auto-rows-min grid-rows-[auto_auto] items-start gap-1 px-[var(--card-padding,1.25rem)] has-data-[slot=card-action]:grid-cols-[1fr_auto]"
</script>

<template>
  <parts.Header v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </parts.Header>
</template>
