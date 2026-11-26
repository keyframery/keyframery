<script setup lang="ts">
/* A button over the whole attachment, to open or preview the file. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = "absolute inset-0 z-10 cursor-pointer rounded-[inherit] outline-none"
</script>

<template>
  <parts.Trigger v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </parts.Trigger>
</template>
