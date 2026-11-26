<script setup lang="ts">
/* One label with its value. Cascade: each item rises in after the one before it. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = "animate-[kf-dl-in_calc(460ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_backwards] [animation-delay:calc((var(--kf-dl,0)*40ms+40ms)*var(--kf-speed,1)*var(--kf-flourish,1))] motion-reduce:animate-none flex min-w-0 flex-col gap-1 py-[var(--description-list-gap,0.75rem)] not-data-[layout=grid]:border-b not-data-[layout=grid]:border-[color:var(--description-list-rule,var(--border))] not-data-[layout=grid]:last:border-b-0 @md/dl:data-[layout=rows]:grid @md/dl:data-[layout=rows]:grid-cols-[var(--description-list-label,10rem)_minmax(0,1fr)] @md/dl:data-[layout=rows]:items-baseline @md/dl:data-[layout=rows]:gap-4"
</script>

<template>
  <parts.Item v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </parts.Item>
</template>
