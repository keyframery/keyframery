<script setup lang="ts">
/* A row of actions; an action marked data-action="remove" removes the attachment. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = "relative z-20 flex shrink-0 items-center gap-0.5 group-data-[orientation=vertical]/attachment:absolute group-data-[orientation=vertical]/attachment:top-2.5 group-data-[orientation=vertical]/attachment:right-2.5"
</script>

<template>
  <parts.Actions v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </parts.Actions>
</template>
