<script setup lang="ts">
/* The chip: a button that opens the list. The filter around it is what agents use, so the combobox
   trigger is hidden from them (data-agent-hidden). */
import { ComboboxTrigger } from "@ui-sdk/vue/combobox"
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { comboboxTrigger, press, useFilter } from "./primitive"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const { anchor } = useFilter("FilterTrigger")
const setAnchor = (part: unknown) => {
  anchor.value = ((part as { $el?: unknown } | null)?.$el as HTMLElement | undefined) ?? null
}
const base = cn(
  comboboxTrigger,
  press,
  "inline-flex h-[var(--filter-height,2rem)] shrink-0 cursor-pointer items-center rounded-[var(--filter-radius,9px)] pr-1.5 pl-2.5 text-[13px] leading-none font-medium whitespace-nowrap text-[color:var(--filter-ink,var(--foreground))] outline-none select-none",
  "border border-dashed border-[color:var(--filter-border,var(--border))] bg-transparent",
  "[&>svg]:mr-1.5 [&>svg]:shrink-0 [&>svg]:text-muted-foreground",
  "hover:border-[color:color-mix(in_oklab,var(--filter-border,var(--border)),var(--foreground)_18%)] hover:bg-[color-mix(in_oklab,var(--filter-ink,var(--foreground))_4%,transparent)]",
  "data-open:border-solid data-open:bg-[var(--filter-face,var(--popover))] data-open:shadow-[0_1px_2px_rgb(0_0_0/0.06)] dark:data-open:bg-accent",
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  "data-disabled:pointer-events-none data-disabled:opacity-50",
  /* Without values the label keeps an even right inset. */
  "has-[[data-slot=filter-values][data-empty]]:pr-2.5",
)
</script>

<template>
  <ComboboxTrigger :ref="setAnchor" data-agent-hidden="" v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope ?? {}" /></template>
  </ComboboxTrigger>
</template>
