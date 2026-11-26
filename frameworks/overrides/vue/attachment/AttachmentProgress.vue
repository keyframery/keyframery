<script setup lang="ts">
/* The upload line along the foot: fills on a spring to progress, fades once the upload is over. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = "origin-left rtl:origin-right [scale:var(--attachment-progress,0)_1] [transition:scale_calc(620ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(260ms*var(--kf-speed,1))_var(--ease-house)_calc(200ms*var(--kf-speed,1))] opacity-0 group-data-[status=uploading]/attachment:opacity-100 motion-reduce:[transition:none]! pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-foreground/70"
</script>

<template>
  <parts.Progress v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </parts.Progress>
</template>
