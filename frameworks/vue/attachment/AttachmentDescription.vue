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
const base = "block max-w-full min-w-0 truncate text-[11.5px] leading-none text-[color:var(--attachment-muted,var(--muted-foreground))] tabular-nums group-data-[status=error]/attachment:text-destructive group-data-[size=xs]/attachment:hidden"
</script>

<template>
  <parts.Description v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </parts.Description>
</template>
