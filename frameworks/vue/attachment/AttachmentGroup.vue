<script setup lang="ts">
/* A row of attachments that scrolls sideways when the files do not fit. */
import { computed, useAttrs } from "vue"

import { Speed, type Speed as SpeedValue } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

import { groupParts as parts } from "./parts"

defineOptions({ inheritAttrs: false })
const props = defineProps<{ speed?: SpeedValue }>()
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = "flex min-w-0 gap-2 overflow-x-auto overscroll-x-contain p-1 [--attachment-gap:0.5rem] [scrollbar-width:none] *:data-[slot=attachment]:flex-none"
</script>

<template>
  <Speed :speed="props.speed">
    <parts.Root v-bind="forwarded" :class="cn(base, attrs.class as any)">
      <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
    </parts.Root>
  </Speed>
</template>
