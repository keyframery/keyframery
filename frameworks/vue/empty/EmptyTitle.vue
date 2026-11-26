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
const base = "animate-[kf-empty-rise_calc(560ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_backwards] motion-reduce:animate-none [animation-delay:calc(110ms*var(--kf-speed,1)*var(--kf-flourish,1))] text-[length:var(--empty-font,15px)] leading-tight font-semibold tracking-tight"
</script>

<template>
  <parts.Title v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </parts.Title>
</template>
