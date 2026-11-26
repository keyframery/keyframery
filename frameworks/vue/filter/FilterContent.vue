<script setup lang="ts">
/* The popup, anchored to the chip, so it unfolds out of it (the combobox's own motion). It takes the
   speed of the filter it belongs to. */
import { ComboboxContent } from "@ui-sdk/vue/combobox"
import { computed, useAttrs } from "vue"

import { useSpeedStyle } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

import { comboboxContent, useFilter } from "./primitive"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})
const { anchor } = useFilter("FilterContent")
const speedStyle = useSpeedStyle()
const base = cn(
  comboboxContent,
  "group/content flex w-[var(--filter-list-width,15rem)] flex-col overflow-hidden rounded-[14px] bg-[var(--filter-face,var(--popover))] text-[color:var(--filter-ink,var(--popover-foreground))] outline-none",
  "[--list-height:var(--available-height)]",
  "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_6px_-2px_rgb(0_0_0/0.08),0_12px_32px_-8px_rgb(0_0_0/0.18)]",
  "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_12px_32px_-8px_rgb(0_0_0/0.7)]",
)
</script>

<template>
  <ComboboxContent
    :anchor="anchor"
    align="start"
    :side-offset="6"
    v-bind="forwarded"
    :style="[speedStyle, attrs.style as any]"
    :class="cn(base, attrs.class as any)"
  >
    <template #default="scope"><slot v-bind="scope ?? {}" /></template>
  </ComboboxContent>
</template>
