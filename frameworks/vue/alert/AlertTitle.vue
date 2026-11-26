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
const base = "animate-[kf-alert-rise_calc(480ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_backwards] motion-reduce:animate-none [animation-delay:calc(110ms*var(--kf-speed,1)*var(--kf-flourish,1))] col-start-2 pt-[5px] text-[13.5px] leading-[18px] font-semibold tracking-tight group-data-[variant=destructive]/alert:text-destructive"
</script>

<template>
  <parts.Title v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </parts.Title>
</template>
