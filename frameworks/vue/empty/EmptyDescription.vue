<script setup lang="ts">
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = "animate-[kf-empty-rise_calc(560ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_backwards] motion-reduce:animate-none [animation-delay:calc(170ms*var(--kf-speed,1)*var(--kf-flourish,1))] text-[13px] leading-[1.55] text-[color:var(--empty-muted,var(--muted-foreground))] [&>a]:font-medium [&>a]:text-[color:var(--empty-ink,var(--foreground))] [&>a]:underline [&>a]:underline-offset-4"
</script>

<template>
  <parts.Description v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </parts.Description>
</template>
