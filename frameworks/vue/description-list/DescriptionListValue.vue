<script setup lang="ts">
/* The value itself; truncated, it carries its full text as a title. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = "min-w-0 flex-1 [overflow-wrap:anywhere] data-truncate:truncate"
</script>

<template>
  <parts.Value v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </parts.Value>
</template>
