<script setup lang="ts">
/* The value cell: the value, then any actions at its end. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = "flex min-h-7 min-w-0 items-center gap-2 text-[color:var(--description-list-ink,var(--foreground))] tabular-nums"
</script>

<template>
  <parts.Details v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </parts.Details>
</template>
