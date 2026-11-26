<script setup lang="ts">
/* Plain words in an addon: a unit, a prefix like https://, a hint. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = "inline-flex items-center gap-1.5 whitespace-nowrap text-[color:var(--input-group-muted,var(--muted-foreground))] [&_svg]:size-4"
</script>

<template>
  <parts.Text v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </parts.Text>
</template>
