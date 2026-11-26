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
const base = "block max-w-full min-w-0 truncate text-[length:var(--attachment-font,13px)] leading-none font-medium group-data-[size=xs]/attachment:text-[12px]"
</script>

<template>
  <parts.Title v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </parts.Title>
</template>
