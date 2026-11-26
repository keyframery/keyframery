<script setup lang="ts">
/* A small well with a key that slides between Unified and Split. Hidden while the viewer is too narrow for split. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import DiffViewerViewOption from "./DiffViewerViewOption.vue"
import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = cn(
  "relative isolate grid grid-cols-2",
  "before:pointer-events-none before:absolute before:inset-y-0 before:start-0 before:-z-10 before:w-1/2 before:content-['']",
  "before:bg-[color-mix(in_oklch,currentColor_9%,transparent)]",
  "before:transition-[translate] before:duration-[calc(320ms*var(--kf-speed,1))] before:ease-spring motion-reduce:before:transition-none",
  "data-[view=split]:before:translate-x-full rtl:data-[view=split]:before:-translate-x-full",
  "h-7 rounded-[9px] bg-muted p-0.5 shadow-[inset_0_1px_2px_rgb(0_0_0/0.07),inset_0_0_0_1px_rgb(0_0_0/0.035)] dark:shadow-[inset_0_1px_2px_rgb(0_0_0/0.5),inset_0_0_0_1px_rgb(255_255_255/0.04)]",
  "before:inset-y-0.5 before:start-0.5 before:w-[calc(50%-2px)] before:rounded-[7px] before:bg-background",
  "before:shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_2px_4px_-2px_rgb(0_0_0/0.1)]",
  "dark:before:bg-accent dark:before:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08)]",
  "data-narrow:hidden",
  "*:h-6 *:cursor-pointer *:rounded-[7px] *:px-2.5 *:text-[12px] *:leading-none *:font-medium *:text-muted-foreground *:outline-none",
  "*:hover:text-foreground *:data-selected:text-foreground *:focus-visible:ring-2 *:focus-visible:ring-ring",
)
</script>

<template>
  <parts.ViewSwitch v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template #default="scope">
      <slot v-bind="scope ?? {}">
        <DiffViewerViewOption value="unified" />
        <DiffViewerViewOption value="split" />
      </slot>
    </template>
  </parts.ViewSwitch>
</template>
