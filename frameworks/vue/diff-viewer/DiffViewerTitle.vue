<script setup lang="ts">
/* The file name: its folder quiet, its name in full ink. With no content it reads `filename`. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = "flex min-w-0 items-center gap-1.5 text-[12.5px] leading-none font-medium text-foreground [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:text-muted-foreground"
const cut = (filename: string) => filename.lastIndexOf("/") + 1
</script>

<template>
  <parts.Title v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template #default="{ state }">
      <slot :state="state">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M9 2.75H5A1.25 1.25 0 0 0 3.75 4v8c0 .69.56 1.25 1.25 1.25h6c.69 0 1.25-.56 1.25-1.25V6L9 2.75Z" />
          <path d="M9 2.75V6h3.25" />
        </svg>
        <span class="min-w-0 truncate"><span class="text-muted-foreground @max-[28rem]/diff-viewer:hidden">{{ state.filename.slice(0, cut(state.filename)) }}</span>{{ state.filename.slice(cut(state.filename)) }}</span>
      </slot>
    </template>
  </parts.Title>
</template>
